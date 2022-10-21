resource "aws_appsync_resolver" "query-node" {
  api_id      = aws_appsync_graphql_api.main.id
  field       = "node"
  type        = "Query"
  data_source = aws_appsync_datasource.dynamo.name

  request_template = <<EOF
{
  "version": "2018-05-29",
  "operation" : "GetItem",
  "key" : {
      "PK" : $util.dynamodb.toDynamoDBJson("NODE|$ctx.args.id"),
      "SK" : $util.dynamodb.toDynamoDBJson("NODE|$ctx.args.id")
  },
  "consistentRead" : false
}
EOF

  response_template = <<EOF
    #set($res = $context.result)
    $util.qr($res.put("metadata",$util.parseJson($res.metadata)))
    $util.toJson($res)
  EOF
}


# resource "aws_appsync_resolver" "query-node" {
#   api_id = aws_appsync_graphql_api.main.id
#   field  = "node"
#   type   = "Query"
#   kind   = "PIPELINE"

#   request_template = "{}"

#   response_template = "$util.toJson($ctx.result)"
#   pipeline_config {
#     functions = [
#       aws_appsync_function.latest-node.function_id,
#     ]
#   }
# }
