# UIT-Go 🚗

UIT-Go là đồ án SE360 mô phỏng hệ thống backend cho một ứng dụng gọi xe (kiểu Grab/Uber mini), xây dựng theo kiến trúc **cloud-native microservices**.

Repo này được thiết kế để:
- Thực hành **System Engineering**: từ code, hạ tầng, CI/CD đến Observability & FinOps.
- Làm **portfolio project**: có thể demo cho nhà tuyển dụng xem quy trình làm việc end‑to‑end.

---

## 1. Kiến trúc & Module chuyên sâu

Hệ thống gồm các service chính:

- **User Service**: quản lý tài khoản người dùng (hành khách + tài xế).
- **Driver Service**: quản lý profile tài xế, trạng thái online/offline, vị trí GPS.
- **Trip Service**: điều phối chuyến đi, trạng thái chuyến, gọi sang driver/payment.
- **Payment Service**: xử lý thanh toán cho chuyến đi.

Module chuyên sâu của nhóm:

- **Module E – Platform, Automation & FinOps (kèm Observability)**  
  - GitHub Actions CI (build + test + build Docker).  
  - Observability: healthcheck, logging, metrics, dashboard & alert (mô tả chi tiết trong docs).  
  - FinOps: cấu hình hạ tầng & tài nguyên tối ưu chi phí.

Chi tiết kiến trúc: xem **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**.  
Chi tiết Observability / FinOps: xem thư mục **[`docs/observability`](./docs/observability)** và **[`infra/observability`](./infra/observability)**.

---

## 2. Chạy dự án trên máy local

### 2.1. Yêu cầu

- Docker + Docker Compose
- Node.js 20 (nếu muốn chạy từng service không qua Docker)

### 2.2. Chạy full stack bằng Docker Compose (khuyến nghị)

# 1. Start toàn bộ stack
docker compose up --build

# 2. Khởi tạo DB nếu cần
# ví dụ:
# docker compose exec db psql -U postgres -f /init-db.sqlCác service mặc định:

- User Service: `http://localhost:3000`
- Driver Service: `http://localhost:8002`
- Trip Service: `http://localhost:8082`
- Payment Service: `http://localhost:3004`
- Postgres: `localhost:5432`

### 2.3. Chạy API sample

Ví dụ tạo tài xế và tìm tài xế gần (Driver Service):

# Tạo tài xế
curl -X POST http://localhost:8002/drivers \
  -H "Content-Type: application/json" \
  -d '{"user_id":"u9","full_name":"Pham Van C","phone":"0909"}'

# Cập nhật vị trí
curl -X POST http://localhost:8002/drivers/1/location \
  -H "Content-Type: application/json" \
  -d '{"lat":10.776,"lng":106.7,"accuracy":8}'

# Tìm tài xế gần
curl "http://localhost:8002/drivers?status=online&near=10.776,106.7&radius_km=5"Thêm ví dụ cho `Trip Service` / `User Service` nếu cần.

---

## 3. Phát triển & cấu trúc thư mục

.
├─ services/            # Source code của 4 microservices
│  ├─ user-service/
│  ├─ driver-service/
│  ├─ trip-service/
│  └─ payment-service/
├─ sql/                 # Script init database
├─ terraform/           # Hạ tầng IaC (cloud, FinOps)
├─ infra/observability/ # Stack observability (Prometheus/Grafana/... nếu có)
├─ docs/observability/  # Tài liệu module Observability/FinOps/Automation
├─ runbooks/            # Runbook xử lý sự cố (oncall)
└─ .github/workflows/   # GitHub Actions CI---

## 4. CI/CD & Automation

Repo dùng **GitHub Actions**:

- Workflow: **`UIT-Go CI (basic + docker build)`** (`.github/workflows/ci-basic.yml`).
- Chức năng:
  - `npm install` + `npm test` (nếu có) cho 4 services.
  - Build Docker image cho từng service.
- Có thể mở rộng dễ dàng để:
  - Push image lên container registry.
  - Deploy lên môi trường staging/production qua Terraform.

Xem chi tiết trong: **[`scripts/`](./scripts)** và **`.github/workflows/`**.

---

## 5. Observability & FinOps (Module E)

- **Observability**
  - Health check endpoint (`/healthz`) cho mỗi service.
  - Logging chuẩn JSON (service, method, path, status, duration, …).
  - Metrics endpoint (`/metrics`) theo chuẩn Prometheus (nếu đã implement).
  - Dashboard & alerting (mô phỏng) mô tả trong `docs/observability`.

- **FinOps**
  - Sử dụng Terraform để định nghĩa hạ tầng có gắn **tags chi phí**.
  - Hạn chế tài nguyên cho container (CPU, RAM) để tránh lãng phí (nếu đã cấu hình trong `docker-compose.yml`).
  - Phân tích trade‑off chi phí vs hiệu năng trong REPORT.md.

---

## 6. Tài liệu dự án

- **`ARCHITECTURE.md`** – Kiến trúc tổng quan + chi tiết module chuyên sâu.
- **`ADR/`** – Các quyết định kiến trúc (Architectural Decision Records).
- **`runbooks/`** – Quy trình xử lý sự cố (observability & incident response).
- **`REPORT.md`** – Báo cáo cuối kỳ (theo format SE360).

---

## 7. Thành viên nhóm

- **Nhóm Đồ án – UIT SE360**
  - Huỳnh Minh Hiếu – 23520477
  - Đỗ Trần Tuấn Kiệt – 23520811
  - Phùng Gia Kiệt – 23520818
  - Nguyễn Phát Đạt – 23520258
