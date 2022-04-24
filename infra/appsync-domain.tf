resource "aws_appsync_domain_name" "main" {
  domain_name     = "compendium-api.${var.domain_name}"
  certificate_arn = data.aws_acm_certificate.main.arn
}

resource "aws_appsync_domain_name_api_association" "main" {
  api_id      = aws_appsync_graphql_api.main.id
  domain_name = aws_appsync_domain_name.main.domain_name
}
