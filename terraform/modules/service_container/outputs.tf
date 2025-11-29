output "container_group_name" {
  description = "Name of the container group"
  value       = azurerm_container_group.this.name
}

output "fqdn" {
  description = "Public FQDN of the container group"
  value       = azurerm_container_group.this.fqdn
}
