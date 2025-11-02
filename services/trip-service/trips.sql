CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  rider_id INT NOT NULL,
  driver_id INT,
  pickup_lat  NUMERIC(9,6) NOT NULL,
  pickup_lng  NUMERIC(9,6) NOT NULL,
  dropoff_lat NUMERIC(9,6) NOT NULL,
  dropoff_lng NUMERIC(9,6) NOT NULL,
  status VARCHAR(20) DEFAULT 'searching',
  price_estimate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
