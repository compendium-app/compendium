resource "aws_appsync_resolver" "dependency-node" {
  api_id      = aws_appsync_graphql_api.main.id
  field       = "node"
  type        = "Dependency"
  data_source = aws_appsync_datasource.dynamo.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation" : "GetItem",
  "key" : {
      "PK" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependencyId"),
      "SK" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependencyId")
  },
  "consistentRead" : false
}
EOF

  response_template = <<EOF
      $utils.toJson($context.result)
  EOF
}
