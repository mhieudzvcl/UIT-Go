CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  license_no TEXT,
  status TEXT NOT NULL DEFAULT 'offline',
  avg_rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_rides INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  driver_id INT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  plate_no TEXT UNIQUE NOT NULL,
  brand TEXT,
  model TEXT,
  color TEXT,
  type TEXT
);

CREATE TABLE IF NOT EXISTS driver_status_history (
  id SERIAL PRIMARY KEY,
  driver_id INT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_locations (
  id BIGSERIAL PRIMARY KEY,
  driver_id INT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_locations_driver_at ON driver_locations(driver_id, at DESC);

-- seed nhẹ
INSERT INTO drivers (user_id, full_name, phone, status)
VALUES 
('u1','Nguyễn Văn A','0909000001','offline'),
('u2','Trần Thị B','0909000002','online')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO vehicles (driver_id, plate_no, type)
SELECT id, CONCAT('59A', id::text), 'bike'
FROM drivers d
WHERE NOT EXISTS (SELECT 1 FROM vehicles v WHERE v.driver_id = d.id);
