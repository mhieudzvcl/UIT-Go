CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    user_id INT,
    driver_id INT,
    origin_lat FLOAT,
    origin_lng FLOAT,
    dest_lat FLOAT,
    dest_lng FLOAT,
    status VARCHAR(20),
    price DECIMAL(10,2)
);

-- Dữ liệu mẫu
INSERT INTO trips (user_id, driver_id, origin_lat, origin_lng, dest_lat, dest_lng, status, price)
VALUES 
    (1, 1, 10.7626, 106.6601, 10.7765, 106.7009, 'completed', 120000),
    (2, 2, 10.7800, 106.7000, 10.7750, 106.7050, 'created', 95000);

SELECT * FROM trips;