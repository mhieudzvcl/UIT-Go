terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  common_tags = {
    Project = "UIT-Go"
    Env     = "dev"
    Owner   = "Group"
  }
}

# ========== USER-SERVICE ==========
module "user_service" {
  source = "../../modules/service_container"

  resource_group_name = var.resource_group_name
  location            = var.location

  service_name = "user-service"
  image       = "uitgoacrdev.azurecr.io/user-service:latest"
  port        = 3000

  tags = merge(
    local.common_tags,
    {
      Service = "user-service"
    }
  )
}

# ========== TRIP-SERVICE ==========
module "trip_service" {
  source = "../../modules/service_container"

  resource_group_name = var.resource_group_name
  location            = var.location

  service_name = "trip-service"
  image        = "uitgoacrdev.azurecr.io/trip-service:latest"
  port         = 3000

  tags = merge(
    local.common_tags,
    {
      Service = "trip-service"
    }
  )
}
