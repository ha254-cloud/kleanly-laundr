from fastapi import FastAPI, Body, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from notifications import send_order_status_notification, send_driver_location_notification
from sqlalchemy import and_
from sqlalchemy.orm import Session
from db import SessionLocal, engine, Base
from models import Order, Driver
from users import User
from auth import verify_token
from auth_utils import hash_password, verify_password
from jose import jwt
from fastapi.security import OAuth2PasswordRequestForm
import os
from datetime import timedelta, datetime
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI()
Base.metadata.create_all(bind=engine)

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# --- User registration and login ---

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    expo_token: str = None
    is_admin: bool = False
    is_driver: bool = False

class OrderCreate(BaseModel):
    id: str
    user_id: str
    status: str
    driver_id: Optional[str] = None
    scent: Optional[List[str]] = None

class OrderCancel(BaseModel):
    reason: Optional[str] = None

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    is_driver: Optional[bool] = None

class DriverStatusUpdate(BaseModel):
    status: str

class DriverCreate(BaseModel):
    id: str
    name: str
    phone: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = hash_password(user.password)
    db_user = User(
        id=user.username,  # For demo, use username as id
        username=user.username,
        hashed_password=hashed_pw,
        email=user.email,
        expo_token=user.expo_token,
        is_admin=user.is_admin,
        is_driver=user.is_driver
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"username": db_user.username}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    to_encode = {"sub": user.username, "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)}
    access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/orders/")
def create_order(order: OrderCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    order_data = order.dict()
    if order_data.get('scent') and isinstance(order_data['scent'], list):
        order_data['scent'] = ','.join(order_data['scent'])
    db_order = Order(**order_data)
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return {"order_id": db_order.id}

@app.get("/orders/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.patch("/orders/{order_id}/status")
def update_status(order_id: str, status: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    send_order_status_notification(order.user_id, order.id, status)
    return {"success": True}

# --- Cancel order ---
@app.post("/orders/{order_id}/cancel")
def cancel_order(order_id: str, cancel: OrderCancel, db: Session = Depends(get_db), user=Depends(verify_token)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = "cancelled"
    db.commit()
    send_order_status_notification(order.user_id, order.id, "cancelled")
    return {"success": True}

# --- User profile update ---
@app.patch("/users/{username}")
def update_user_profile(username: str, update: UserProfileUpdate, db: Session = Depends(get_db), user=Depends(verify_token)):
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if update.password:
        db_user.hashed_password = hash_password(update.password)
    if update.is_admin is not None:
        db_user.is_admin = update.is_admin
    if update.is_driver is not None:
        db_user.is_driver = update.is_driver
    if update.username:
        db_user.username = update.username
    if hasattr(update, 'email') and update.email:
        db_user.email = update.email
    if hasattr(update, 'expo_token') and update.expo_token:
        db_user.expo_token = update.expo_token
    db.commit()
    return {"success": True}

# --- Driver status update ---
@app.patch("/drivers/{driver_id}/status")
def update_driver_status(driver_id: str, update: DriverStatusUpdate, db: Session = Depends(get_db), user=Depends(verify_token)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    driver.status = update.status
    db.commit()
    return {"success": True}

@app.post("/drivers/")
def create_driver(driver: DriverCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    db_driver = Driver(**driver.dict())
    db.add(db_driver)
    db.commit()
    db.refresh(db_driver)
    return {"driver_id": db_driver.id}

@app.post("/drivers/assign")
def assign_driver(order_id: str, driver_id: str, db: Session = Depends(get_db), user=Depends(verify_token)):
    order = db.query(Order).filter(Order.id == order_id).first()
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not order or not driver:
        raise HTTPException(status_code=404, detail="Order or driver not found")
    order.driver_id = driver_id
    db.commit()
    return {"success": True}


# --- WebSocket for order status ---
@app.websocket("/ws/orders/{order_id}")
async def order_ws(websocket: WebSocket, order_id: str):
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            order = db.query(Order).filter(Order.id == order_id).first()
            if order:
                await websocket.send_json({"status": order.status, "driver_id": order.driver_id})
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        db.close()


# --- Driver location update endpoint ---

@app.post('/drivers/{driver_id}/location')
def update_location(driver_id: str, lat: float = Body(...), lng: float = Body(...), db: Session = Depends(get_db), user=Depends(verify_token)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    # Store location in driver model
    driver.lat = lat
    driver.lng = lng
    db.commit()
    # Notify all users with active orders assigned to this driver
    orders = db.query(Order).filter(and_(Order.driver_id == driver_id, Order.status != "delivered")).all()
    for order in orders:
        user_obj = db.query(User).filter(User.username == order.user_id).first()
        if user_obj:
            send_driver_location_notification(order.user_id, driver_id, lat, lng, to_email=user_obj.email, expo_token=user_obj.expo_token)
    # Broadcast to WebSocket (handled in ws endpoint)
    return {"success": True}

# --- Real-time driver location WebSocket ---
@app.websocket("/ws/drivers/{driver_id}/location")
async def driver_location_ws(websocket: WebSocket, driver_id: str):
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            driver = db.query(Driver).filter(Driver.id == driver_id).first()
            if driver and hasattr(driver, 'lat') and hasattr(driver, 'lng'):
                await websocket.send_json({"driver_id": driver_id, "lat": driver.lat, "lng": driver.lng})
            else:
                await websocket.send_json({"driver_id": driver_id, "lat": None, "lng": None})
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}  # Always returns JSON

@app.get("/status")
async def status():
    return {"status": "ok"}  # Always returns JSON

@app.get("/error")
async def error():
    return JSONResponse(status_code=400, content={"error": "Bad request"})

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"error": "Not found"})

@app.exception_handler(500)
async def server_error_handler(request, exc):
    return JSONResponse(status_code=500, content={"error": "Internal server error"})
