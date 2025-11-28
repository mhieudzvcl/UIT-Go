terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Tag chung cho project
locals {
  common_tags = {
    Project = "UIT-Go"
    Env     = "dev"
    Owner   = "Group4"
  }
}

# ECR cho user-service
module "user_service_ecr" {
  source       = "../../modules/service_ecr"
  service_name = "user-service"

  tags = merge(
    local.common_tags,
    {
      Service = "user-service"
    }
  )
}

# ECR cho trip-service
module "trip_service_ecr" {
  source       = "../../modules/service_ecr"
  service_name = "trip-service"

  tags = merge(
    local.common_tags,
    {
      Service = "trip-service"
    }
  )
}
