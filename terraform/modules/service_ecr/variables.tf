variable "service_name" {
  type        = string
  description = "Name of the service (e.g., user-service, trip-service)"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the ECR repository"
  default     = {}
}
