resource "aws_sfn_state_machine" "put-nodes" {
  name     = "${var.name}-put-nodes"
  role_arn = aws_iam_role.main.arn
  # type     = "EXPRESS"

  tags = var.tags

  tracing_configuration {
    enabled = true
  }

  definition = <<EOF
{
  "Comment": "Handle storing of node",
  "StartAt": "StoreNodes",
  "States": {
    "StoreNodes":{
      "Type":"Map",
      "ItemsPath":"$.nodes",
      "End":true,
      "Parameters": {
        "node.$": "$$.Map.Item.Value"
      },
      "Iterator":{
        "StartAt":"PutNode",
        "States":{  
          "PutNode":{
            "Type": "Task",
            "Resource": "arn:aws:states:::dynamodb:putItem",
            "Parameters": {
              "TableName": "${aws_dynamodb_table.main.name}",
              "Item": {
                "PK": {
                  "S.$": "States.Format('NODE|{}',$.node.id)"
                },
                "SK": {
                  "S.$": "States.Format('NODE|{}|{}',$.node.id,$$.Execution.StartTime)"
                },
                "id": {
                  "S.$": "$.node.id"
                },
                "name": {
                  "S.$": "$.node.name"
                },
                "version": {
                  "S.$": "$$.Execution.StartTime"
                }
              }
            },
            "ResultPath":"$.result",
            "Next": "StoreDependencies"
          },
          "StoreDependencies":{
            "Type":"Map",
            "ItemsPath":"$.node.dependencies",
            "End":true,
            "Parameters": {
              "dependency.$": "$$.Map.Item.Value",
              "node.$": "$.node"
            },
            "Iterator":{
              "StartAt":"StoreDependeeEdge",
              "States":{
                "StoreDependeeEdge":{
                  "Type": "Task",
                  "Resource": "arn:aws:states:::dynamodb:putItem",
                  "Parameters": {
                    "TableName": "${aws_dynamodb_table.main.name}",
                    "Item": {
                      "PK": {
                        "S.$": "States.Format('NODE|{}|{}',$.node.id,$$.Execution.StartTime)"
                      },
                      "SK": {
                        "S.$": "States.Format('DEPENDENCY|NODE|{}',$.dependency)"
                      },
                      "dependencyId":{
                        "S.$": "States.Format('NODE|{}',$.dependency)"
                      },
                      "dependantId":{
                        "S.$": "States.Format('NODE|{}',$.node.id)"
                      },
                      "dependantVersion":{
                        "S.$": "$$.Execution.StartTime"
                      }
                    }
                  },
                  "ResultPath":null,
                  "End": true
                }
              }
            }
          }
        }
      }
    }
  }
}
EOF
}
