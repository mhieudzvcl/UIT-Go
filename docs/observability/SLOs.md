# UIT-Go SLOs & SLIs

## Flow A — Đặt xe end-to-end (Booking)

- **Service:** trip-service
- **SLI name:** BookingSuccessRate
- **Description:** Tỷ lệ booking thành công (state = CONFIRMED trong ≤ 30s)
- **Window:** Rolling 30 days
- **SLO:** ≥ 99.90%
- **Error budget:** 0.10% / 30d (~43.2 phút downtime-equivalent/tháng)
- **Success event:** API tạo chuyến trả 2xx và booking.state = CONFIRMED trong ≤ 30s
- **Failure event:** Timeout, 4xx/5xx, state ≠ CONFIRMED sau 30s
- **Metric namespace:** UITGo/SLI
- **Metric name:** BookingSuccessRate
- **Dimensions:** Service=trip-service, Env=dev/prod

## Flow B — Match driver

- **Service:** driver-service
- **SLI name:** MatchLatencyP95
- **Description:** p95 latency của API /match-driver
- **Window:** Rolling 7 days
- **SLO:** p95 < 200ms
- **Metric:** MatchLatencyMs (sử dụng p95 trong CloudWatch)

## Flow C — Payment

- **Service:** payment-service
- **SLI name:** PaymentSuccessRate
- **Description:** Tỷ lệ payment confirmation thành công
- **Window:** Rolling 30 days
- **SLO:** ≥ 99.95%

## Flow D — Auth (Login)

- **Service:** user-service
- **SLI name:** LoginSuccessRate
- **Description:** Tỷ lệ đăng nhập thành công
- **Window:** Rolling 7 days
- **SLO:** ≥ 99.9%
