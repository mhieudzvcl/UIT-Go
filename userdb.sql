CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
);

-- Dữ liệu mẫu
INSERT INTO users (name, email, phone)
VALUES 
    ('Nguyen Van A', 'a@gmail.com', '0909000000'),
    ('Tran Thi B', 'b@gmail.com', '0909111111');

SELECT * FROM users;
