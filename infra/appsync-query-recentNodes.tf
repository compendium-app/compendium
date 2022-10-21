resource "aws_appsync_resolver" "query-recentNodes" {
  api_id      = aws_appsync_graphql_api.main.id
  field       = "recentNodes"
  type        = "Query"
  data_source = aws_appsync_datasource.dynamo.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation" : "Query",
  "index":"GSI1",
  "scanIndexForward":false,
  "query" : {
      "expression" : "GSI1PK = :PK",
      "expressionValues" : {
          ":PK":$util.dynamodb.toDynamoDBJson("NODES|RECENT")
      }
  },
  "limit":$util.defaultIfNull($ctx.args.limit,10),
  "consistentRead" : false
}
EOF

  response_template = <<EOF
      $utils.toJson($context.result.items)
  EOF
}
