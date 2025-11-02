CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    trip_id INT,
    amount DECIMAL(10,2),
    status VARCHAR(20)
);

-- Dữ liệu mẫu
INSERT INTO payments (trip_id, amount, status)
VALUES 
    (1, 120000, 'paid'),
    (2, 95000, 'pending');

SELECT * FROM payments;