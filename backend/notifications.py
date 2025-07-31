
import os
import requests
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# --- Email notification using SendGrid ---
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@kleanly.com")

def send_email(to_email: str, subject: str, content: str):
    if not SENDGRID_API_KEY:
        print("SendGrid API key not set")
        return
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        plain_text_content=content
    )
    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Email sent to {to_email}: {response.status_code}")
    except Exception as e:
        print(f"SendGrid error: {e}")

# --- Expo push notification ---
EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

def send_expo_push(token: str, title: str, body: str):
    data = {
        "to": token,
        "title": title,
        "body": body
    }
    try:
        r = requests.post(EXPO_PUSH_URL, json=data)
        print(f"Expo push sent: {r.status_code} {r.text}")
    except Exception as e:
        print(f"Expo push error: {e}")

# --- Notification logic ---
def send_order_status_notification(user_id: str, order_id: str, status: str, to_email: str = None, expo_token: str = None):
    subject = f"Order {order_id} status update"
    content = f"Your order {order_id} status changed to {status}."
    if to_email:
        send_email(to_email, subject, content)
    if expo_token:
        send_expo_push(expo_token, subject, content)

def send_driver_location_notification(user_id: str, driver_id: str, lat: float, lng: float, to_email: str = None, expo_token: str = None):
    subject = f"Driver {driver_id} location update"
    content = f"Driver {driver_id} is at ({lat}, {lng})"
    if to_email:
        send_email(to_email, subject, content)
    if expo_token:
        send_expo_push(expo_token, subject, content)
