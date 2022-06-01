variable "name" {
  type = string
}

variable "domain_name" {
  type    = string
  default = null
}
variable "certificate_name" {
  type    = string
  default = null
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "resource tags"
}
