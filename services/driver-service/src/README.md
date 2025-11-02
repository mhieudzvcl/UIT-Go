## Run nhanh bằng Docker
docker compose up --build
# mở tab khác:
docker compose exec driver-svc npm run db:init

## Test nhanh (cURL)
# tạo driver
curl -X POST http://localhost:8000/v1/drivers \
  -H "Content-Type: application/json" \
  -d '{"user_id":"u9","full_name":"Pham Van C","phone":"0909"}'

# online
curl -X PATCH http://localhost:8000/v1/drivers/1/status \
  -H "Content-Type: application/json" -d '{"status":"online"}'

# cập nhật vị trí (lần 2 <3s sẽ bị throttle 202)
curl -X POST http://localhost:8000/v1/drivers/1/location \
  -H "Content-Type: application/json" \
  -d '{"lat":10.776,"lng":106.7,"accuracy":8}'

# tìm gần
curl "http://localhost:8000/v1/drivers?status=online&near=10.776,106.7&radius_km=5"
