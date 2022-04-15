resource "aws_appsync_resolver" "dependant-node" {
  api_id      = aws_appsync_graphql_api.main.id
  field       = "node"
  type        = "Dependant"
  data_source = aws_appsync_datasource.dynamo.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation" : "GetItem",
  "key" : {
      "PK" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependantId"),
      "SK" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependantId")
  },
  "consistentRead" : false
}
EOF

  response_template = <<EOF
      $utils.toJson($context.result)
  EOF
}
