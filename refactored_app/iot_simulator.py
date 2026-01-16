import logging
import time
import requests
import random
from datetime import datetime

# Configure logging to file
logging.basicConfig(
    filename="iot.log",
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    filemode="w",
)

# Configuration
API_URL = "http://127.0.0.1:8001/nurse/patient/vitals"
COOKIES = {
    # Using the session cookie from a logged-in nurse (jeff01478)
    # In a real IoT scenario, devices would use an API Key or Token
    # For simulation, we will login first or assume the server accepts a simplified auth for this endpoint
    # However, since our simple auth depends on cookies, we'll need to handle login or pass a session.
    # To keep it simple, let's just bypass auth for the sake of demo or simulate login
}

# Nurse Credentials
USERNAME = "jeff01478"
PASSWORD = "123456"
LOGIN_URL = "http://127.0.0.1:8001/login"


def login():
    session = requests.Session()
    # 1. Get login page to get any CSRF tokens if needed (not needed for this simple app)
    # 2. Post login
    login_data = {"userid": USERNAME, "password": PASSWORD}
    response = session.post(LOGIN_URL, data=login_data)
    logging.info(f"Login Status: {response.status_code}")
    logging.info(f"Login URL: {response.url}")
    if response.url.endswith("/nurse/dashboard"):
        logging.info("✅ IoT Device Connected (Logged in as Nurse)")
        return session
    else:
        logging.info("❌ IoT Device Connection Failed")
        logging.info(f"Response: {response.text[:200]}")
        return None


def simulate_device(session):
    # Simulated patients assigned to this nurse/ward
    patients = ["陳XX", "林XX", "李XX", "張XX"]

    logging.info("🤖 Smart Ward IoT Simulator Started...")
    logging.info("----------------------------------------")

    while True:
        # Pick a random patient
        patient = random.choice(patients)

        # Simulate temperature
        # 90% chance of normal (36.0 - 37.5)
        # 10% chance of fever (37.6 - 39.5)
        if random.random() < 0.9:
            temp = round(random.uniform(36.0, 37.5), 1)
            status = "Normal"
            pulse = random.randint(60, 90)
            bp_sys = random.randint(110, 130)
            bp_dia = random.randint(70, 85)
        else:
            temp = round(random.uniform(37.6, 39.5), 1)
            status = "FEVER ALERT"
            pulse = random.randint(95, 120)  # Elevated pulse with fever
            bp_sys = random.randint(130, 150)
            bp_dia = random.randint(80, 95)

        timestamp = datetime.now().strftime("%H:%M:%S")

        # Prepare payload
        payload = {
            "name": patient,
            "temperature": str(temp),
            "bp_sys": str(bp_sys),
            "bp_dia": str(bp_dia),
            "pulse": str(pulse),
            "remark": "IoT Auto-Reading",
        }

        try:
            # Send data
            response = session.post(API_URL, data=payload)
            if (
                response.status_code == 200 or response.history
            ):  # FastAPI redirects on success
                logging.info(
                    f"[{timestamp}] Sent: {patient} | T:{temp} P:{pulse} BP:{bp_sys}/{bp_dia} | {status}"
                )
            else:
                logging.info(
                    f"[{timestamp}] Failed to send data: {response.status_code}"
                )

        except Exception as e:
            logging.info(f"Connection Error: {e}")

        # Wait for next reading
        sleep_time = random.randint(3, 8)  # Fast updates for demo
        time.sleep(sleep_time)


if __name__ == "__main__":
    session = login()
    if session:
        try:
            simulate_device(session)
        except KeyboardInterrupt:
            logging.info("\n🛑 Simulation Stopped")
