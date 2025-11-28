resource "aws_ecr_repository" "this" {
  name = var.service_name

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}
