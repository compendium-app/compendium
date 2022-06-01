variable "name" {
  type = string
}

variable "domain_name" {
  type = string
}
variable "certificate_name" {
  type = string
}

variable "tags" {
  type        = map(string)
  default     = {}
  description = "resource tags"
}
