CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    license_number VARCHAR(50),
    car_model VARCHAR(50),
    available BOOLEAN DEFAULT true
);

-- Dữ liệu mẫu
INSERT INTO drivers (name, license_number, car_model)
VALUES 
    ('Le Van C', '51A-12345', 'Toyota Vios'),
    ('Pham Thi D', '51B-67890', 'Honda City');

SELECT * FROM drivers;