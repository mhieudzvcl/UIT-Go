variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project prefix for resources"
  type        = string
  default     = "uitgo"
}

variable "log_retention_days" {
  description = "Log retention days for CloudWatch Log Groups"
  type        = number
  default     = 30
}

variable "match_p95_threshold_ms" {
  description = "Threshold (ms) for match p95 alarm"
  type        = number
  default     = 200
}
