import time
import random
import requests
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:8000/api/v1/telemetry")
IMEI = os.getenv("IMEI", "123456789012345")

class TelemetryGenerator:
    def __init__(self, imei):
        self.imei = imei
        self.speed = 0.0
        self.battery_soc = random.uniform(20.0, 100.0)
        # Random US Location start
        self.lat = random.uniform(30.0, 48.0)
        self.lng = random.uniform(-120.0, -75.0)

    def update_state(self):
        self.speed += random.uniform(-5, 5)
        self.speed = max(0, min(120, self.speed))
        
        self.battery_soc -= random.uniform(0.01, 0.05)
        self.battery_soc = max(0, self.battery_soc)
        
        # Jitter location slightly (simulating movement)
        self.lat += random.uniform(-0.001, 0.001)
        self.lng += random.uniform(-0.001, 0.001)
        
    def generate_payload(self):
        return {
            "imei": self.imei,
            "speed": round(self.speed, 2),
            "battery_soc": round(self.battery_soc, 2),
            "lat": round(self.lat, 6),
            "lng": round(self.lng, 6),
            "battery_voltage": round(48.5 + random.uniform(-0.5, 0.5), 2),
            "odometer": round(1500 + time.time() % 100, 2)
        }

def run_generator():
    imeis = [f"12345678901234{i}" for i in range(1, 6)]
    generators = [TelemetryGenerator(imei) for imei in imeis]
    
    logging.info(f"Starting telemetry generator for {len(generators)} vehicles targeting {BACKEND_URL}")
    
    while True:
        try:
            for gen in generators:
                gen.update_state()
                payload = gen.generate_payload()
                
                response = requests.post(BACKEND_URL, json=payload, timeout=5)
                if response.status_code == 201:
                    logging.info(f"Sent ({gen.imei}): OK")
                else:
                    logging.error(f"Failed to send ({gen.imei}): {response.status_code}")
                time.sleep(5)
        except Exception as e:
            logging.error(f"Error connecting to backend: {e}")
            
        time.sleep(15) # 15 seconds requirement

if __name__ == "__main__":
    logging.info("Waiting for backend...")
    time.sleep(5)
    run_generator()
