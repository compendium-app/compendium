variable "name" {
  type = string
}

variable "ui_domain_name" {
  type    = string
  default = null
}
variable "api_domain_name" {
  type    = string
  default = null
}
variable "certificate_arn" {
  type    = string
  default = null
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "resource tags"
}

variable "override_graphql_url" {
  type    = string
  default = ""
}