variable "domain_name" {
  type    = string
  default = null
}
variable "certificate_name" {
  type    = string
  default = null
}

module "main" {
  source           = "./infra"
  name             = "project-compendium"
  certificate_name = var.certificate_name
  domain_name      = var.domain_name
  tags = {
    "app" = "compendium"
  }
}

provider "aws" {
  # Configuration options
}
