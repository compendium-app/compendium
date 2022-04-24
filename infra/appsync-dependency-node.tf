resource "aws_appsync_resolver" "dependency-node" {
  api_id      = aws_appsync_graphql_api.main.id
  field       = "nodeVersions"
  type        = "Dependency"
  data_source = aws_appsync_datasource.dynamo.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation" : "Query",
  "query" : {
      "expression" : "PK = :pk and begins_with(SK,:sk)",
      "expressionValues" : {
          ":pk" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependencyId"),
          ":sk" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependencyId")
      }
  },
  "scanIndexForward":false,
  "limit":100,
  "consistentRead" : false
}
EOF

  response_template = <<EOF
      $utils.toJson($context.result.items)
  EOF
}
