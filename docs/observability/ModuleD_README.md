# Module D — Observability: Hoàn thiện & Kiểm chứng

Mục tiêu: Hoàn thành yêu cầu Module D (Thiết kế cho Observability) với các artefact có thể review và deploy.

Những artefact đã tạo trong repo

- `docs/observability/SLOs.md` — Định nghĩa SLO/SLI cho các luồng nghiệp vụ (Booking, Match, Payment, Auth).
- `services/payment-service/src/observability/*` — Instrumentation mẫu: EMF metrics, Fastify plugin, tracing stub, warm-up metric.
- `scripts/synthetic-payment-test.ps1` — Script PowerShell để chạy synthetic tests và xuất CSV kết quả.
- `infra/observability/*` — Terraform starter chứa:
  - CloudWatch LogGroups cho services
  - Dashboard skeleton (`dashboard.json`)
  - SNS topic cho alerts
  - IAM policy mẫu cho X-Ray
  - Ví dụ CloudWatch Alarms (PaymentSuccessRate, Match p95)
- `runbooks/payment_slo_breach.md` — Runbook mẫu cho cảnh báo SLO Payment.
- `docs/observability/tradeoffs.md` — Phân tích trade-offs giữa logs, metrics và traces.

Mục kiểm chứng (cách xác minh nhanh)

1. Kiểm tra SLO & SLIs

   - Mở `docs/observability/SLOs.md` để xác nhận tên SLI, window, SLO, và error budget.

2. Chạy service có instrumentation (local)

   - Khởi động `payment-service`:
     ```powershell
     cd services\payment-service
     node src/index.js
     ```
   - Gọi endpoint `/payments` và kiểm tra console logs sẽ có các mục `start_createPayment`, `after_recordPaymentAttempt`, `after_processPayment`.

3. Chạy synthetic test (local)

   - Từ repo root:
     ```powershell
     cd scripts
     .\synthetic-payment-test.ps1 -Count 100 -IntervalSeconds 0.1
     ```
   - Kiểm tra file CSV xuất ra và summary để xác nhận success rate, p95, avg.

4. Provision infra (AWS) — optional (yêu cầu quyền)

   - Chuẩn bị AWS CLI credentials (có quyền tạo SNS, CloudWatch, IAM, X-Ray).
   - Áp dụng Terraform:
     ```powershell
     cd infra\observability
     terraform init
     terraform apply
     ```
   - Sau khi apply, subscribe SNS topic để nhận alert (email/HTTP/PagerDuty).

5. Kết nối ứng dụng với CloudWatch/X-Ray

   - Khi deploy trên ECS/EC2/container, đảm bảo stdout của container được forward tới CloudWatch Logs (log driver) để EMF JSON lines tạo custom metrics.
   - Gán IAM policy `xray-put` (được tạo trong Terraform) vào IAM role của service để cho phép publish trace segments.
   - Triển khai X-Ray daemon (sidecar) hoặc sử dụng X-Ray SDK trong container để gửi trace segments.

6. Mở Dashboard
   - Dashboard tên `<project>-SLO-Dashboard` trong CloudWatch sẽ hiển thị Payment Success Rate và Match p95.
   - Nếu metrics chưa xuất hiện, kiểm tra CloudWatch Logs cho EMF JSON (`"_aws"` field) và báo lỗi nếu EMF không xuất.

Lưu ý / Những bước có thể cần support

- Một số tài khoản (AWS Educate) có hạn chế IAM/SNS. Nếu bạn không có quyền, hãy gửi file Terraform cho admin và nhờ họ apply.
- Để hoàn thiện traceability end-to-end (X-Ray) cần triển khai X-Ray SDK/daemon trong môi trường chạy microservices.

Kết luận

Các yêu cầu chính của Module D đã được thực hiện dưới dạng artefact có thể review: SLOs, instrumentation mẫu, Terraform starter (dashboard + alarms), runbook mẫu, synthetic test và tài liệu phân tích trade-offs.

Nếu bạn muốn, tôi sẽ:

- A) Triển khai instrumentation tương tự cho `trip-service` và `user-service` (để có coverage toàn bộ SLOs);
- B) Tạo Lambda/CloudWatch Synthetics để ghi SLI liên tục vào CloudWatch;
- C) Tinh chỉnh dashboard (error budget burn widget) và tạo thêm runbooks (Match/Auth).

Chọn A/B/C hoặc nói "Hoàn tất" nếu bạn muốn dừng ở mức này.
