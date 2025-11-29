resource "azurerm_container_group" "this" {
  name                = "${var.service_name}-cg"
  location            = var.location
  resource_group_name = var.resource_group_name

  os_type = "Linux"

  ip_address_type = "Public"
  dns_name_label  = "${var.service_name}-dev-${replace(var.resource_group_name, "_", "-")}"
  restart_policy  = "Always"

  container {
    name   = var.service_name
    image  = var.image
    cpu    = 0.5
    memory = 1.0

    ports {
      port     = var.port
      protocol = "TCP"
    }
  }

  tags = var.tags
}
