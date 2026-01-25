import time
import random
import requests
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000/api/v1/telemetry")
IMEI = os.getenv("IMEI", "123456789012345")

class TelemetryGenerator:
    def __init__(self):
        self.speed = 0.0
        self.battery_soc = 100.0
        self.lat = 12.9716
        self.lng = 77.5946

    def update_state(self):
        self.speed += random.uniform(-1, 3)
        self.speed = max(0, min(120, self.speed))
        
        self.battery_soc -= random.uniform(0.01, 0.05)
        self.battery_soc = max(0, self.battery_soc)
        
        # Jitter location slightly
        self.lat += random.uniform(-0.0001, 0.0001)
        self.lng += random.uniform(-0.0001, 0.0001)
        
    def generate_payload(self):
        return {
            "imei": IMEI,
            "speed": round(self.speed, 2),
            "battery_soc": round(self.battery_soc, 2),
            "lat": round(self.lat, 6),
            "lng": round(self.lng, 6),
            "battery_voltage": round(48.5 + random.uniform(-0.5, 0.5), 2),
            "odometer": round(1500 + time.time() % 100, 2)
        }

def run_generator():
    gen = TelemetryGenerator()
    logging.info(f"Starting telemetry generator for IMEI {IMEI} targeting {BACKEND_URL}")
    
    while True:
        try:
            gen.update_state()
            payload = gen.generate_payload()
            
            response = requests.post(BACKEND_URL, json=payload, timeout=5)
            if response.status_code == 201:
                logging.info(f"Sent (5s): {payload}")
            else:
                logging.error(f"Failed to send: {response.status_code} - {response.text}")
                
        except Exception as e:
            logging.error(f"Error connecting to backend: {e}")
            
        time.sleep(5) # 5 seconds requirement

if __name__ == "__main__":
    logging.info("Waiting for backend...")
    time.sleep(5)
    run_generator()
