# ADR-002: Chọn Observability Stack cho UIT-Go

- **Status**: Accepted
- **Date**: 2025-12-18
- **Deciders**: Nhóm UIT-Go
- **Context**: Module chuyên sâu Platform / Automation / FinOps + Observability (SE360).

---

## 1. Bối cảnh

Hệ thống UIT-Go gồm nhiều microservice (user, driver, trip, payment).  
Giảng viên yêu cầu:

- Có khả năng **quan sát** hệ thống (sức khỏe, hiệu năng, lỗi).
- Có minh chứng cho **Observability** trong báo cáo & demo.

Nhóm cần chọn stack/chiến lược observability phù hợp với:

- Môi trường demo chủ yếu là **local / small cloud**.
- Giới hạn thời gian đồ án.

---

## 2. Các lựa chọn đã cân nhắc

1. **Full OpenTelemetry + Jaeger + Prometheus + Grafana**
   - Ưu:
     - Bám sát thực tế sản xuất.
     - Có đủ logs, metrics, tracing phân tán.
   - Nhược:
     - Nhiều component, cấu hình phức tạp.
     - Tốn thời gian học & setup, có thể vượt scope đồ án.

2. **Prometheus + Grafana + logging JSON đơn giản**
   - Ưu:
     - Dễ tích hợp vào repo và Docker Compose.
     - Đủ để có healthcheck, metrics, dashboard & alert cơ bản.
   - Nhược:
     - Không có distributed tracing “xịn”, phải debug cross‑service bằng log + request ID.

3. **Cloud managed service (CloudWatch, X-Ray, Stackdriver, …)**
   - Ưu: nhiều tính năng sẵn, ít phải tự vận hành.
   - Nhược:
     - Phụ thuộc account cloud, khó demo offline cho giảng viên.
     - Tốn thời gian cấu hình IAM, network, billing.

---

## 3. Quyết định

Nhóm chọn **phương án (2)**:  
**Logging JSON + healthcheck + (định hướng) /metrics theo chuẩn Prometheus, có thể gắn với Prometheus & Grafana khi cần.**

---

## 4. Lý do

- Cân bằng tốt giữa **tính thực tế** và **độ phức tạp**:
  - Đủ thể hiện tư duy System Engineering (health, metrics, dashboard).
  - Không “đốt” quá nhiều thời gian vào việc cài đặt tool thay vì hiểu kiến trúc.
- Dễ chạy bằng **Docker Compose** trong môi trường chấm điểm.
- Có thể **nâng cấp dần** sau đồ án bằng cách thêm OpenTelemetry/Jaeger mà không phá vỡ cấu trúc hiện tại.

---

## 5. Hệ quả

- Logs:
  - Mỗi service log request/response ra stdout với thông tin có cấu trúc (service, method, path, status, duration_ms).
- Metrics:
  - Mỗi service có thể expose `/metrics` (Prometheus format) để đo request count, latency, error rate.
- Tracing:
  - Chưa có full tracing; nhóm dùng **request ID** + log để lần theo luồng request.
- Hạ tầng observability chi tiết (Prometheus/Grafana/docker-compose bổ sung) được mô tả thêm trong `docs/observability` và `infra/observability` (nếu có).


