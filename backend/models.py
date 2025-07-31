from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from db import Base

class Order(Base):
    __tablename__ = 'orders'
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    status = Column(String, index=True)
    driver_id = Column(String, ForeignKey('drivers.id'), nullable=True)
    scent = Column(String, nullable=True)  # Comma-separated for multiple scents
    # Add more fields as needed

class Driver(Base):
    __tablename__ = 'drivers'
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    # Add more fields as needed
    orders = relationship('Order', backref='driver')
