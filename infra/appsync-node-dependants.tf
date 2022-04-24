resource "aws_appsync_resolver" "node-dependants" {
  api_id      = aws_appsync_graphql_api.main.id
  field       = "dependants"
  type        = "NodeVersion"
  data_source = aws_appsync_datasource.dynamo.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation" : "Query",
  "index":"GSI1",
  "query" : {
      "expression" : "SK = :SK",
      "expressionValues" : {
          ":SK" : $util.dynamodb.toDynamoDBJson("DEPENDENCY|NODE|$ctx.source.id")
      }
  },
  "limit":$util.defaultIfNull($ctx.args.limit,100),
  "consistentRead" : false
}
EOF

  response_template = <<EOF
      $utils.toJson($context.result.items)
  EOF
}
