# ADR-001: Kiến trúc tổng thể & lựa chọn stack cho UIT-Go

- **Status**: Accepted
- **Date**: 2025-10-26
- **Deciders**: Nhóm UIT-Go
- **Context**: Đồ án SE360 – Xây dựng nền tảng UIT-Go cloud-native.

---

## 1. Bối cảnh

UIT-Go cần backend cho ứng dụng gọi xe với các yêu cầu:

- Hỗ trợ nhiều luồng nghiệp vụ (đăng ký, tạo chuyến, cập nhật vị trí, thanh toán).
- Dễ triển khai trên môi trường local (Docker Compose) và cloud (Terraform).
- Phù hợp kiến thức của sinh viên (JavaScript/Node.js quen thuộc).

Nhóm phải chọn:

- Ngôn ngữ / framework backend.
- Kiểu kiến trúc (monolith vs microservices).
- Loại cơ sở dữ liệu.

---

## 2. Các lựa chọn đã cân nhắc

1. **Monolith Node.js + PostgreSQL**
   - Ưu điểm: đơn giản, ít service, dễ deploy.
   - Nhược: khó mô phỏng thực tế về hệ thống phân tán, khó tách module chuyên sâu.

2. **Microservices Node.js + PostgreSQL (chia DB theo service)**
   - Ưu điểm:
     - Bám sát yêu cầu môn học về microservices.
     - Mỗi nhóm có thể tập trung vào một service/module chuyên sâu.
   - Nhược:
     - Nhiều repo/service hơn → phức tạp vận hành hơn monolith.

3. **Microservices Go/Python + NoSQL (MongoDB, DynamoDB)**
   - Ưu điểm: phù hợp thực tế ở một số công ty lớn.
   - Nhược:
     - Tăng độ khó cho sinh viên nếu không quen ngôn ngữ/công nghệ.
     - NoSQL khiến phần thiết kế dữ liệu & query phức tạp hơn cần thiết.

---

## 3. Quyết định

Nhóm chọn **phương án (2)**:

- **Ngôn ngữ**: Node.js với **Express** cho tất cả service.
- **Kiến trúc**: **Microservices**, mỗi domain chính 1 service:
  - `user-service`, `driver-service`, `trip-service`, `payment-service`.
- **CSDL**: PostgreSQL, mỗi service dùng 1 database logic riêng (userdb, driverdb, tripdb, payments).

---

## 4. Lý do

- Node.js/Express quen thuộc, giúp nhóm tập trung vào ***
  kiến trúc*** thay vì học ngôn ngữ mới.
- Microservices cho phép:
  - Tách rõ ràng domain (User, Driver, Trip, Payment).
  - Dễ mở rộng thêm module (Observability, FinOps, Automation) mà không đụng logic toàn hệ thống.
- PostgreSQL:
  - Hỗ trợ tốt quan hệ & transaction – phù hợp dữ liệu tài khoản, chuyến, thanh toán.
  - Dễ chạy local qua Docker, quen thuộc trong môi trường học thuật.

---

## 5. Hệ quả

- Tăng số lượng service → cần thêm:
  - CI/CD cho multiple services.
  - Monitoring/observability phân tán.
- Tuy nhiên điều này phù hợp mục tiêu môn học (System Engineering) nên chấp nhận được.


