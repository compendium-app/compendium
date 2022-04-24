data "aws_acm_certificate" "main" {
  domain      = var.domain_name
  provider    = aws.us-east-1
  types       = ["AMAZON_ISSUED"]
  most_recent = true
}

data "aws_caller_identity" "current" {}
