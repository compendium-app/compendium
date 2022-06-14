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
                  "S.$": "States.Format('NODE|{}',$.node.id)"
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
                        "S.$": "States.Format('NODE|{}',$.node.id)"
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
            },
            "ResultPath":null,
            "Next":"GetOutdatedDependencies"
          },
          "GetOutdatedDependencies":{
            "Type": "Task",
            "Resource": "arn:aws:states:::aws-sdk:dynamodb:query",
            "Parameters": {
              "TableName": "${aws_dynamodb_table.main.name}",
              "KeyConditionExpression":"#PK = :PK AND begins_with(#SK,:SKPrefix)",
              "FilterExpression": "dependantVersion < :version",
              "ExpressionAttributeNames": {
                  "#PK" : "PK",
                  "#SK" : "SK"
              },
              "ExpressionAttributeValues": { 
                ":PK":{
                  "S.$":"States.Format('NODE|{}',$.node.id)"
                },
                ":SKPrefix":{
                  "S":"DEPENDENCY|NODE|"
                },
                ":version":{
                  "S.$":"$$.Execution.StartTime"
                }
              }
            },
            "ResultPath":"$.invalidDependencies",
            "Next": "DeleteOutdatedDependencies"
          },
          "DeleteOutdatedDependencies":{
            "Type":"Map",
            "ItemsPath":"$.invalidDependencies.Items",
            "Parameters": {
              "dependency.$": "$$.Map.Item.Value",
              "node.$": "$.node"
            },
            "Iterator":{
              "StartAt":"DeleteDependency",
              "States":{
                "DeleteDependency":{
                  "Type": "Task",
                  "Resource": "arn:aws:states:::dynamodb:deleteItem",
                  "Parameters": {
                    "TableName": "${aws_dynamodb_table.main.name}",
                    "Key": {
                      "PK": {
                        "S.$": "$.dependency.PK.S"
                      },
                      "SK": {
                        "S.$": "$.dependency.SK.S"
                      }
                    }
                  },
                  "ResultPath":null,
                  "End": true
                }
              }
            },
            "End":true
          }
        }
      }
    }
  }
}
EOF
}
