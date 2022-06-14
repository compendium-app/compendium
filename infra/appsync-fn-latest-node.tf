resource "aws_appsync_function" "latest-node" {
  api_id                   = aws_appsync_graphql_api.main.id
  data_source              = aws_appsync_datasource.dynamo.name
  name                     = "latestNode"
  request_mapping_template = <<EOF
{
  "version": "2018-05-29",
  "operation" : "Query",
  "query" : {
      "expression" : "PK = :pk and begins_with(SK,:sk)",
      "expressionValues" : {
          ":pk" : $util.dynamodb.toDynamoDBJson("NODE|$ctx.args.id"),
          ":sk" : $util.dynamodb.toDynamoDBJson("NODE|$ctx.args.id|")
      }
  },
  "scanIndexForward":false,
  "limit":1,
  "consistentRead" : false
}
EOF

  response_mapping_template = <<EOF
  #if ($context.result.items.size() == 0)
    null
  #else
    $util.toJson($context.result.items[0])
  #end
EOF
}
