CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  passenger_id INT NOT NULL,
  driver_id INT,
  status VARCHAR(20) DEFAULT 'searching',
  pickup_lat FLOAT,
  pickup_lng FLOAT,
  dropoff_lat FLOAT,
  dropoff_lng FLOAT,
  price_estimate FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);