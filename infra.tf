variable "domain_name" {
  type    = string
  default = null
}

module "main" {
  source      = "./infra"
  name        = "project-compendium"
  domain_name = var.domain_name
}

provider "aws" {
  # Configuration options
}
