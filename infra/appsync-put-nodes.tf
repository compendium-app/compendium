resource "aws_appsync_resolver" "put-node" {
  api_id      = aws_appsync_graphql_api.main.id
  field       = "putNodes"
  type        = "Mutation"
  data_source = aws_cloudformation_stack.sfn-data-source.outputs.name

  request_template = <<EOF
$util.qr($ctx.stash.put("executionId", $util.autoId()))

{
  "version": "2018-05-29",
  "method": "POST",
  "resourcePath": "/",
  "params": {
    "headers": {
      "content-type": "application/x-amz-json-1.0",
      "x-amz-target":"AWSStepFunctions.StartExecution"
    },
    "body": {
      "stateMachineArn": "${aws_sfn_state_machine.put-nodes.arn}",
      "input": $utils.toJson($utils.toJson($ctx.args))
    }
  }
}
EOF

  response_template = <<EOF
  {"executionArn":"$util.parseJson($ctx.result.body).executionArn"}
EOF
}
