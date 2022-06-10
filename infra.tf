variable "domain_name" {
  type    = string
  default = null
}
variable "certificate_arn" {
  type    = string
  default = null
}

module "main" {
  source          = "./infra"
  name            = "project-compendium"
  certificate_arn = var.certificate_arn
  api_domain_name = "compendium-api.${var.domain_name}"
  ui_domain_name  = "compendium.${var.domain_name}"
  tags = {
    "app" = "compendium"
  }
}

provider "aws" {
  # Configuration options
}
