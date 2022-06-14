variable "certificate_arn" {
  type    = string
  default = null
}

module "main" {
  source          = "./infra"
  name            = "project-compendium"
  certificate_arn = var.certificate_arn
  api_domain_name = "compendium-api.rekap.online"
  ui_domain_name  = "compendium.rekap.online"
  tags = {
    "app" = "compendium"
  }
}

provider "aws" {
  # Configuration options
}
