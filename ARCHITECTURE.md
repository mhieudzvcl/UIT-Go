# Kiến trúc hệ thống UIT-Go

Tài liệu này mô tả **kiến trúc tổng quan** của hệ thống UIT-Go và cách nhóm hiện thực **module chuyên sâu Platform / Automation / FinOps + Observability** theo yêu cầu đồ án SE360.

---

## 1. Tổng quan kiến trúc

### 1.1. Bối cảnh

UIT-Go là backend cho một ứng dụng gọi xe (tương tự Grab/Uber mini).  
Mục tiêu kiến trúc:

- **Tách nhỏ thành nhiều microservice** độc lập, deploy bằng container.
- Hỗ trợ **mở rộng theo chiều ngang**, dễ nâng cấp từng service.
- Dễ tích hợp **CI/CD, Observability và FinOps** để mô phỏng vận hành thực tế.

### 1.2. Các microservice chính

- **User Service**
  - Chức năng: quản lý tài khoản người dùng (hành khách + tài xế), đăng ký, đăng nhập cơ bản.
  - Công nghệ: Node.js + Express, PostgreSQL (`userdb`).
  - API chính:
    - `POST /users` – đăng ký.
    - `POST /sessions` – đăng nhập (tùy nhóm hiện thực).
    - `GET /users/me` – lấy thông tin user hiện tại (qua JWT / middleware auth).

- **Driver Service**
  - Chức năng: quản lý hồ sơ tài xế, trạng thái online/offline và vị trí GPS theo thời gian gần thực.
  - Công nghệ: Node.js + Express, PostgreSQL (`driverdb`).
  - API tiêu biểu:
    - `POST /drivers` – tạo/cập nhật tài xế.
    - `PATCH /drivers/:id/status` – đổi trạng thái (`online`, `offline`, …).
    - `POST /drivers/:id/location` – cập nhật vị trí GPS, có cơ chế throttle.
    - `GET /drivers?near=lat,lng&radius_km=...` – tìm tài xế gần.

- **Trip Service**
  - Chức năng: dịch vụ trung tâm điều phối chuyến đi, quản lý trạng thái chuyến (tạo, đang tìm tài xế, đang chạy, hoàn tất, hủy).
  - Công nghệ: Node.js + Express, PostgreSQL (`tripdb`).
  - API chính:
    - `POST /trips` – tạo chuyến mới, gọi sang Driver Service để tìm tài xế gần.
    - `GET /trips/:id` – xem chi tiết chuyến đi.
    - `POST /trips/:id/complete` – đánh dấu hoàn tất chuyến, gọi sang Payment Service để charge.

- **Payment Service**
  - Chức năng: ghi nhận giao dịch thanh toán cho mỗi chuyến.
  - Công nghệ: Node.js + Express, PostgreSQL (`payments`).
  - API chính:
    - `POST /payments` – tạo payment cho 1 trip, lưu trạng thái (ví dụ `captured`).

Các service giao tiếp với nhau chủ yếu qua **REST API nội bộ** (HTTP), URL được cấu hình bằng biến môi trường (`USER_SERVICE_URL`, `DRIVER_SERVICE_URL`, `PAYMENT_SERVICE_URL`).

---

## 2. Luồng nghiệp vụ chính

### 2.1. Đăng ký & chuẩn bị

1. Hành khách đăng ký tài khoản qua **User Service**: `POST /users`.
2. Tài xế tạo hồ sơ qua **Driver Service**: `POST /drivers`.
3. Khi bắt đầu ca làm, tài xế bật trạng thái `online` và gửi vị trí định kỳ:
   - `PATCH /drivers/:id/status`.
   - `POST /drivers/:id/location`.

### 2.2. Tạo chuyến đi

1. Ứng dụng client gửi yêu cầu `POST /trips` tới **Trip Service**, gồm:
   - `passenger_id` (hoặc `rider_id`).
   - Tọa độ điểm đón (`pickup_lat`, `pickup_lng`) và điểm đến (`dropoff_lat`, `dropoff_lng`).
2. Trip Service:
   - Xác thực/kiểm tra nhẹ user bằng cách gọi sang **User Service**.
   - Gọi `GET /drivers/search` hoặc `GET /drivers?near=...` bên **Driver Service** để tìm tài xế gần.
   - Ước lượng giá cước (`estimatePrice(distanceKm)`) theo logic đơn giản.
   - Ghi bản ghi mới vào bảng `trips` với trạng thái ban đầu (ví dụ `searching`), kèm `driver_id` nếu đã gán.
3. Trip Service trả về JSON mô tả chuyến đi cho client.

### 2.3. Hoàn tất chuyến & thanh toán

1. Khi chuyến kết thúc, client gửi `POST /trips/:id/complete` tới **Trip Service**.
2. Trip Service:
   - Lấy thông tin trip từ DB.
   - Gọi `POST /payments` bên **Payment Service** để tạo bản ghi thanh toán cho chuyến.
   - Cập nhật trạng thái trip thành `completed`.
3. Kết quả (trip + payment) có thể được client dùng để hiển thị lịch sử và doanh thu.

---

## 3. Hạ tầng triển khai

### 3.1. Môi trường local – Docker Compose

- File `docker-compose.yml` đứng ở root repo, dựng các thành phần:
  - `db` – container Postgres dùng chung, init bằng script SQL trong thư mục `sql/`.
  - `redis` – (nếu dùng cho caching / queue).
  - `user-service`, `driver-service`, `trip-service`, `payment-service` – 4 container ứng dụng Node.js.
- Mỗi service dùng connection string riêng (`PGURL`) trỏ đến database tương ứng trong cùng 1 instance Postgres.
- Các service expose port lên `localhost` để dễ debug & demo.
- `healthcheck` được định nghĩa cho DB và từng service để:
  - Bảo đảm thứ tự khởi động đúng (service chỉ start sau khi DB đã `healthy`).
  - Là cơ sở cho monitoring sau này.

### 3.2. Hạ tầng cloud – Terraform (định hướng)

Trong thư mục `terraform/`, nhóm mô hình hóa hạ tầng cloud (EC2/ECS/EKS hoặc tương đương) sử dụng **Infrastructure as Code**:

- Tạo VPC, subnet, security group.
- Tạo database managed (ví dụ AWS RDS PostgreSQL) cho các service.
- Tạo compute (VM/cluster) để chạy container.
- Gắn **tags tài nguyên** (ví dụ `Project = "UIT-Go"`, `Env = "dev" | "prod"`, `Owner = "<team>"`) để phục vụ FinOps.

Chi tiết cấu hình có thể khác nhau tùy môi trường, nhưng mục tiêu là:
- Có thể **reproduce hạ tầng** bằng lệnh Terraform.
- Dễ đánh giá & tối ưu chi phí.

---

## 4. Observability

Module Observability của hệ thống UIT-Go tập trung vào ba trụ cột:

- **Logs** – ghi lại hoạt động hệ thống.
- **Metrics** – đo lường hiệu năng và độ ổn định.
- **Healthcheck & (định hướng) Tracing** – theo dõi tình trạng service và luồng request.

### 4.1. Healthcheck

- Mỗi service expose endpoint `GET /healthz` để:
  - Kiểm tra nhanh service đang chạy.
  - Một số service còn kiểm tra kết nối DB (`SELECT 1`).
- Endpoint này được dùng trong:
  - Docker Compose `healthcheck`.
  - Các script kiểm tra / cảnh báo.

### 4.2. Logging

- Các service dùng `console.log` / `console.error` theo format có cấu trúc (có `service`, `method`, `path`, `status`, `duration_ms`, …).
- Log được ghi ra stdout của container – có thể thu thập tập trung bởi stack logging (ELK/Loki) trong môi trường production.

### 4.3. Metrics & Dashboard (định hướng)

- Ở scope hiện tại, metrics được thiết kế theo phong cách Prometheus:
  - Đếm số request, phân phối latency theo endpoint.
  - Đếm số lỗi 4xx/5xx.
- Hệ thống có thể mở rộng thêm:
  - **Prometheus** để scrape `/metrics`.
  - **Grafana** để vẽ dashboard (latency, error rate, throughput).
  - Alert rule đơn giản (tỉ lệ lỗi cao, DB down, latency tăng…).

Chi tiết setup và mô hình quan sát được mô tả trong thư mục `docs/observability`.

---

## 5. FinOps & Automation (Module chuyên sâu)

### 5.1. Automation – CI/CD

- Repo sử dụng **GitHub Actions** (thư mục `.github/workflows/`), trong đó:
  - Workflow `UIT-Go CI (basic + docker build)`:
    - Chạy trên mỗi `push` / `pull_request` vào nhánh `main`.
    - Thực hiện: `npm install` + `npm test` cho 4 service.
    - Build image Docker cho từng service.
- Mục tiêu:
  - Bảo đảm mọi thay đổi đều được kiểm tra tự động trước khi merge.
  - Tạo nền tảng để dễ dàng bổ sung bước deploy (CD) sau này.

### 5.2. FinOps – Chi phí & tài nguyên

- Ở tầng container:
  - Có thể cấu hình **giới hạn CPU/RAM** cho từng service trong `docker-compose.yml` để tránh lạm dụng tài nguyên.
- Ở tầng cloud (Terraform):
  - Tài nguyên (VM, DB, v.v.) được gắn **tags** rõ ràng để theo dõi chi phí theo dự án/môi trường.
  - Cấu hình loại máy/vùng triển khai theo nguyên tắc: đủ dùng cho demo, tránh over‑provisioning.
- Báo cáo phân tích chi phí, trade‑off giữa **chi phí – hiệu năng – độ phức tạp** được trình bày chi tiết trong `REPORT.md` và các file ADR liên quan.

---

## 6. Liên kết tài liệu

- **Tổng quan & hướng dẫn chạy**: xem `README.md`.
- **Quyết định kiến trúc**: thư mục `ADR/` (Architectural Decision Records).
- **Observability & Runbook**: `docs/observability/` và `runbooks/` (nếu có).
- **Hạ tầng & FinOps**: `terraform/` và `infra/observability/`.

Tài liệu này đóng vai trò như bản đồ kiến trúc ở mức cao; các chi tiết triển khai cụ thể được mô tả thêm trong từng service và trong các ADR.


