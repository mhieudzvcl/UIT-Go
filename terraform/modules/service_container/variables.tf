variable "resource_group_name" {
  type        = string
  description = "Azure resource group to deploy the container group into"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "service_name" {
  type        = string
  description = "Logical name of the service (e.g., user-service, trip-service)"
}

variable "image" {
  type        = string
  description = "Full image name (e.g., uitgoacrdev.azurecr.io/user-service:latest)"
}

variable "port" {
  type        = number
  description = "Port exposed by the container"
  default     = 3000
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the container group"
  default     = {}
}
