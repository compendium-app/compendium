resource "aws_appsync_domain_name" "main" {
  count = var.certificate_arn != null && var.api_domain_name!=null?1:0
  domain_name     = var.api_domain_name
  certificate_arn = var.certificate_arn
}

resource "aws_appsync_domain_name_api_association" "main" {
  count = var.certificate_arn != null && var.api_domain_name!=null?1:0
  api_id      = aws_appsync_graphql_api.main.id
  domain_name = aws_appsync_domain_name.main[0].domain_name
}
