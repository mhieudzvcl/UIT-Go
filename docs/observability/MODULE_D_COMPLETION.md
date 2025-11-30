# Module D: Observability — Hoàn Thành

**Ngày:** 28 Tháng 11, 2025  
**Trạng thái:** ✅ HOÀN THÀNH

## Tóm tắt yêu cầu

Module D yêu cầu thiết kế hệ thống Observability có khả năng "tự chẩn đoán" cho UIT-Go microservices:

1. Định nghĩa SLO/SLI cho các luồng nghiệp vụ chính.
2. Xây dựng nền tảng quan sát (logging, metrics, tracing).
3. Thiết kế dashboard và hệ thống cảnh báo.
4. Viết runbooks và hướng dẫn xử lý sự cố.

## Những artefact đã tạo

### 1. Định nghĩa SLO/SLI

**File:** `docs/observability/SLOs.md`

- **Booking (trip-service):** SLI = BookingSuccessRate, SLO ≥ 99.90%, window 30d, error budget 43.2 min/tháng
- **Match (driver-service):** SLI = MatchLatencyMs p95, SLO < 200ms, window 7d
- **Payment (payment-service):** SLI = PaymentSuccessRate, SLO ≥ 99.95%, window 30d
- **Auth (user-service):** SLI = LoginSuccessRate, SLO ≥ 99.9%, window 7d

### 2. Instrumentation (Logs, Metrics, Traces)

**Files:** `services/*/src/observability/*`

Các service đã được instrument:

- **payment-service**: EMF metrics, Fastify plugin, warm-up metric, per-step timing logs
- **trip-service**: EMF metrics, Express middleware, tracing stub, per-step timing logs
- **user-service**: EMF metrics, Express middleware, tracing stub

**Công nghệ đã sử dụng:**

- EMF (aws-embedded-metrics) → CloudWatch custom metrics
- Structured logging (JSON) with requestId/traceId correlation
- OpenTelemetry SDK (stub, ready for X-Ray exporter)

**Metric names:**

- `UITGo/SLI.PaymentSuccessCount`, `PaymentAttemptCount`, `PaymentDurationMs`
- `UITGo/SLI.BookingSuccessCount`, `BookingAttemptCount`, `BookingDurationMs`
- `UITGo/SLI.LoginSuccessCount`, `LoginAttemptCount`, `LoginDurationMs`
- `UITGo/SLI.MatchLatencyMs` (placeholder)

### 3. Hạ tầng quan sát (Terraform starter)

**Files:** `infra/observability/*`

Được cấp phép provision:

- CloudWatch Log Groups (`/uitgo/payment-service`, `/uitgo/trip-service`, `/uitgo/user-service`)
- CloudWatch Dashboard (`UITGo-SLO-Dashboard`) với widgets:
  - Payment Success Rate (metric math: m1/m2)
  - Match p95 Latency
  - Error Budget note
- SNS topic để gửi alerts
- IAM policy cho X-Ray (cho services)
- Ví dụ CloudWatch Alarms (PaymentSuccessRate < 99.95%, Match p95 > 200ms)

**Cách deploy:**

```powershell
cd infra\observability
terraform init
terraform apply
```

### 4. Synthetic test scripts

**Files:** `scripts/synthetic-*.ps1`

- `synthetic-payment-test.ps1`: Test endpoint `/payments` (payment-service)
  - Chạy N request với interval và đo p50/p95/avg duration, success rate
  - Xuất CSV kết quả
- `synthetic-booking-test.ps1`: Test endpoint `/trips` (trip-service)
  - Tương tự payment test

**Chạy:**

```powershell
.\synthetic-payment-test.ps1 -Count 100 -IntervalSeconds 0.1
.\synthetic-booking-test.ps1 -Count 100 -IntervalSeconds 0.1
```

### 5. Runbooks & Playbooks

**Files:** `runbooks/*.md`

- `payment_slo_breach.md`: Hướng dẫn xử lý khi PaymentSuccessRate < 99.95%
  - Symptoms, quick checks, likely causes, mitigations, escalation

### 6. Trade-offs analysis

**File:** `docs/observability/tradeoffs.md`

Phân tích pros/cons và khuyến nghị sử dụng:

- **Metrics:** Dùng cho SLO/alerting (low-cost, fast)
- **Traces:** Dùng cho triage (X-Ray, error-biased sampling)
- **Logs:** Dùng cho root-cause (structured JSON, traceId correlation)

### 7. Documentation

**Files:**

- `docs/observability/ModuleD_README.md`: Hướng dẫn kiểm chứng & deployment
- `infra/observability/README.md`: Hướng dẫn Terraform

## Quy trình kiểm chứng (verification steps)

### Local (dev)

1. Cài dependencies:
   ```powershell
   npm install  # cho mỗi service
   ```
2. Chạy service:
   ```powershell
   cd services/payment-service
   npm run start
   ```
3. Chạy synthetic test:
   ```powershell
   cd scripts
   .\synthetic-payment-test.ps1 -Count 50
   ```
4. Kiểm tra output:
   - Logs hiển thị JSON `http_request_complete` từ middleware
   - EMF JSON lines (chứa `"_aws"`) từ metrics

### AWS Educate (production)

1. Cài dependencies và deploy services (ECS/EC2/container)
2. Áp dụng Terraform (provision CloudWatch resources)
3. Gán IAM policy cho service role để cho phép `PutMetricData`, `PutTraceSegments`
4. Đảm bảo stdout được forward vào CloudWatch Logs (log driver)
5. Mở CloudWatch Dashboard để xem SLIs
6. Subscribe SNS topic để nhận alerts

## Trade-offs & gotchas

### Sampling

- EMF metrics: mỗi request ghi một metric event (cardinality risk nếu có user_id tags)
- Traces: khuyến nghị error-biased sampling (capture most errors, sample 1-5% success)

### Cardinality

- Hiện tại: requestId, service name, success flag (low cardinality)
- Tránh: userId, customerId (high cardinality → chi phí cao)

### CloudWatch Logs → Metrics extraction

- EMF JSON phải match định dạng CloudWatch (xem `aws-embedded-metrics` docs)
- Metric filters hoặc Lambda có thể dùng để aggregation thêm

### X-Ray tracing

- Hiện tại: OpenTelemetry SDK stub (không gửi traces)
- Để bật: cài `@opentelemetry/exporter-trace-otlp-http` hoặc `aws-xray-sdk`, config exporter

## Kế tiếp (optional/future)

Nếu muốn mở rộng Module D:

1. **Bật OpenTelemetry → X-Ray tracing end-to-end:** cài exporter, config SDK.
2. **Thêm runbooks cho Booking & Auth:** tương tự Payment runbook.
3. **Lambda/Synthetics synthetic runner:** chạy checks định kỳ, ghi SLI liên tục.
4. **Dashboard tuning:** thêm error budget burn rate widget, trace links, customization.

## Đánh giá Module D

| Yêu cầu                               | Trạng thái   | Ghi chú                                   |
| ------------------------------------- | ------------ | ----------------------------------------- |
| SLO/SLI định nghĩa                    | ✅           | 4 luồng, cụ thể, có error budget          |
| Instrumentation (logs/metrics/traces) | ✅           | EMF metrics, structured logs, OTel stub   |
| Dashboard & Alarms                    | ✅           | Terraform + JSON, metric math, SNS        |
| Runbooks                              | ✅ (partial) | Payment runbook; có thể thêm Booking/Auth |
| Synthetic tests                       | ✅           | 2 scripts (payment, booking)              |
| Trade-offs analysis                   | ✅           | Documented                                |
| IaC (Terraform)                       | ✅           | Starter, reproducible                     |

## Kết luận

**Module D đã được hoàn thành** ở mức "production-ready starter":

- Artefacts đầy đủ và có thể deploy/review.
- Instrumentation đang chạy trên dev (EMF logs xuất stdout, synthetic tests pass).
- Terraform starter sẵn sàng apply vào AWS Educate.
- Runbooks mẫu có thể sử dụng/mở rộng.

Để đưa vào production: deploy services, apply Terraform, configure CloudWatch log forwarding, subscribe alerts.
