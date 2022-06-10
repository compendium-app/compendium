output "appsync_api_domain_name" {
  value = replace(replace(aws_appsync_graphql_api.main.uris["GRAPHQL"], "https://", ""), "/graphql", "")
}

output "appsync_api_url" {
  value = aws_appsync_graphql_api.main.uris["GRAPHQL"]
}

output "ui_cloudfront_domain_name" {
  value = aws_cloudfront_distribution.ui.domain_name
}
