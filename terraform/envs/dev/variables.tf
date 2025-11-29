variable "resource_group_name" {
  type        = string
  description = "Existing resource group for UIT-Go dev environment"
  default     = "UIT-Go"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "koreacentral"
}
