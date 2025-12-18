# ADR-003: Lựa chọn CI/CD & GitHub Actions cho UIT-Go

- **Status**: Accepted
- **Date**: 2025-12-18
- **Deciders**: Nhóm UIT-Go
- **Context**: Module chuyên sâu Platform / Automation / FinOps + Observability (SE360).

---

## 1. Bối cảnh

UIT-Go gồm nhiều service trong cùng một monorepo.  
Nhóm cần một giải pháp **Automation / CI** để:

- Tự động kiểm tra (test, build) trên mỗi `push` / `pull_request`.
- Build được Docker images cho từng service.
- Dễ minh họa trong demo & báo cáo (không phụ thuộc server riêng).

Các lựa chọn phổ biến:

- GitHub Actions.
- GitLab CI (không phù hợp vì repo trên GitHub).
- Jenkins / tự host runner riêng.

---

## 2. Các lựa chọn đã cân nhắc

1. **Jenkins / tự host CI**
   - Ưu: linh hoạt, mô phỏng gần production ở nhiều công ty.
   - Nhược:
     - Cần server riêng để cài Jenkins.
     - Tốn thời gian vận hành (backup, upgrade, plugin).

2. **GitHub Actions (CI)** với workflow YAML trong `.github/workflows`
   - Ưu:
     - Tích hợp sẵn với GitHub, không cần server riêng.
     - Cấu hình bằng YAML đơn giản.
     - Đủ dùng cho scope đồ án (test + build Docker).
   - Nhược:
     - Phụ thuộc platform GitHub, nhưng chấp nhận được cho đồ án.

---

## 3. Quyết định

Nhóm chọn **GitHub Actions** làm nền tảng Automation/CI chính, với workflow:

- Tên: `UIT-Go CI (basic + docker build)`.
- Vị trí: `.github/workflows/ci-basic.yml`.

---

## 4. Thiết kế workflow

- **Trigger**
  - `on: push` vào nhánh `main`.
  - `on: pull_request` vào nhánh `main`.

- **Steps chính**
  1. Checkout source (`actions/checkout`).
  2. Setup Node.js (`actions/setup-node`, version 20, cache npm).
  3. Cho từng service trong `services/`:
     - `npm install`.
     - `npm test || echo "no tests yet"` (không fail nếu chưa có test).
  4. Build Docker image:
     - `docker build` cho 4 service với tag `uit-go-<service>:gha`.

Workflow hiện tại tập trung vào **CI**; các bước CD (deploy) được để mở cho tương lai.

---

## 5. Lý do

- Đáp ứng tốt yêu cầu **Automation** của Module E:
  - Mọi commit đều được kiểm tra và build tự động.
  - Pipeline nhìn thấy rõ trên tab **Actions** của GitHub.
- Triển khai nhanh, không cần thêm hạ tầng ngoài GitHub.
- Dễ mở rộng:
  - Thêm job publish image lên container registry.
  - Thêm bước chạy Terraform để deploy.

---

## 6. Hệ quả

- Repo có một workflow CI duy nhất nhưng hỗ trợ nhiều service.
- Thời gian chạy pipeline tăng theo số service, nhưng vẫn chấp nhận được trong scope đồ án.
- Nếu hệ thống lớn hơn, có thể:
  - Chuyển sang matrix jobs.
  - Tách workflow theo service hoặc theo loại job (test / build / deploy).


