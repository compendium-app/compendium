"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompendiumAPI = void 0;
const aws_appsync_alpha_1 = require("@aws-cdk/aws-appsync-alpha");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const constructs_1 = require("constructs");
const path_1 = require("path");
const sfn_put_node_1 = require("./sfn-put-node");
class CompendiumAPI extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const dynamoTable = new aws_dynamodb_1.Table(this, `${id}Table`, {
            tableName: id,
            partitionKey: { name: "PK", type: aws_dynamodb_1.AttributeType.STRING },
            sortKey: { name: "SK", type: aws_dynamodb_1.AttributeType.STRING },
            billingMode: aws_dynamodb_1.BillingMode.PAY_PER_REQUEST,
        });
        const sfnPutNodes = new sfn_put_node_1.SFNPutNodes(this, id, { dynamoTable });
        dynamoTable.addGlobalSecondaryIndex({
            indexName: "Inverse",
            partitionKey: {
                name: "SK",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            sortKey: {
                name: "PK",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
        });
        dynamoTable.addGlobalSecondaryIndex({
            indexName: "GSI1",
            partitionKey: {
                name: "GSI1PK",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            sortKey: {
                name: "GSI1SK",
                type: aws_dynamodb_1.AttributeType.STRING,
            },
        });
        const api = new aws_appsync_alpha_1.GraphqlApi(this, "this", {
            name: id,
            schema: aws_appsync_alpha_1.SchemaFile.fromAsset((0, path_1.join)(__dirname, "schema.graphql")),
            logConfig: {
                fieldLogLevel: aws_appsync_alpha_1.FieldLogLevel.ALL,
            },
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: aws_appsync_alpha_1.AuthorizationType.IAM,
                },
            },
        });
        const dynamoDataSource = api.addDynamoDbDataSource("DynamoDB", dynamoTable);
        const stepFunctionDataSource = api.addHttpDataSource("StepFunction", "https://states.eu-central-1.amazonaws.com/", {
            authorizationConfig: {
                signingRegion: "eu-central-1",
                signingServiceName: "states",
            },
        });
        dynamoTable.grantReadWriteData(stepFunctionDataSource);
        sfnPutNodes.grant(stepFunctionDataSource, `states:StartExecution`);
        dynamoDataSource.createResolver("queryNode", {
            typeName: "Query",
            fieldName: "node",
            requestMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
            {
              "version": "2018-05-29",
              "operation" : "GetItem",
              "key" : {
                  "PK" : $util.dynamodb.toDynamoDBJson("NODE|$ctx.args.id"),
                  "SK" : $util.dynamodb.toDynamoDBJson("NODE|$ctx.args.id")
              },
              "consistentRead" : false
            }
            `),
            responseMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
      #set($res = $context.result)
      $util.qr($res.put("metadata",$util.parseJson($res.metadata)))
      $util.toJson($res)
      `),
        });
        dynamoDataSource.createResolver("queryRecentNode", {
            typeName: "Query",
            fieldName: "recentNodes",
            requestMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
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
            `),
            responseMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        #set($items = $context.result.items)
        #foreach ($item in $items)
          $util.qr($item.put("metadata",$util.parseJson($item.metadata)))
        #end
        $utils.toJson($items)
      `),
        });
        dynamoDataSource.createResolver("nodeDependants", {
            typeName: "Node",
            fieldName: "dependants",
            requestMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation" : "Query",
          "index":"Inverse",
          "query" : {
              "expression" : "SK = :SK",
              "expressionValues" : {
                  ":SK" : $util.dynamodb.toDynamoDBJson("DEPENDENCY|NODE|$ctx.source.id")
              }
          },
          "limit":$util.defaultIfNull($ctx.args.limit,100),
          "consistentRead" : false
        }
            `),
            responseMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        $utils.toJson($context.result.items)
      `),
        });
        dynamoDataSource.createResolver("nodeDependencies", {
            typeName: "Node",
            fieldName: "dependencies",
            requestMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation" : "Query",
          "query" : {
              "expression" : "PK = :pk and begins_with(SK,:sk)",
              "expressionValues" : {
                  ":pk" : $util.dynamodb.toDynamoDBJson("NODE|$ctx.source.id"),
                  ":sk" : $util.dynamodb.toDynamoDBJson("DEPENDENCY|NODE|")
              }
          },
          "limit":$util.defaultIfNull($ctx.args.limit,100),
          "consistentRead" : false
        }
            `),
            responseMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        $utils.toJson($context.result.items)
      `),
        });
        dynamoDataSource.createResolver("dependantNode", {
            typeName: "Dependant",
            fieldName: "node",
            requestMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation" : "GetItem",
          "key" : {
              "PK" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependantId"),
              "SK" : $util.dynamodb.toDynamoDBJson("$ctx.source.dependantId")
          },
          "consistentRead" : false
        }
            `),
            responseMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        $utils.toJson($context.result)
      `),
        });
        dynamoDataSource.createResolver("dependencyNode", {
            typeName: "Dependency",
            fieldName: "node",
            requestMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
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
          "limit":1,
          "consistentRead" : false
        }
            `),
            responseMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
        #if ($context.result.items.size() == 0)
          null
        #else
          $utils.toJson($context.result.items[0])
        #end
      `),
        });
        stepFunctionDataSource.createResolver("putNodes", {
            typeName: "Mutation",
            fieldName: "putNodes",
            requestMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
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
            "stateMachineArn": "${sfnPutNodes.stateMachineArn}",
            "input": $utils.toJson($utils.toJson($ctx.args))
          }
        }
      }`),
            responseMappingTemplate: aws_appsync_alpha_1.MappingTemplate.fromString(`
      {"executionArn":"$utils.parseJson($ctx.result.body).executionArn"}
      `),
        });
    }
}
exports.CompendiumAPI = CompendiumAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGtFQU1vQztBQUNwQywyREFBNkU7QUFDN0UsMkNBQXVDO0FBQ3ZDLCtCQUE0QjtBQUM1QixpREFBNkM7QUFJN0MsTUFBYSxhQUFjLFNBQVEsc0JBQVM7SUFDMUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUF5QjtRQUNqRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRTtZQUNoRCxTQUFTLEVBQUUsRUFBRTtZQUNiLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3hELE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTSxFQUFFO1lBQ25ELFdBQVcsRUFBRSwwQkFBVyxDQUFDLGVBQWU7U0FDekMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxXQUFXLEdBQUcsSUFBSSwwQkFBVyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBRS9ELFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQztZQUNsQyxTQUFTLEVBQUUsU0FBUztZQUNwQixZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTTthQUMzQjtZQUNELE9BQU8sRUFBRTtnQkFDUCxJQUFJLEVBQUUsSUFBSTtnQkFDVixJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNO2FBQzNCO1NBQ0YsQ0FBQyxDQUFDO1FBQ0gsV0FBVyxDQUFDLHVCQUF1QixDQUFDO1lBQ2xDLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFlBQVksRUFBRTtn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QztTQUNILENBQUMsQ0FBQztRQUVILGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNoRCxRQUFRLEVBQUUsWUFBWTtZQUN0QixTQUFTLEVBQUUsTUFBTTtZQUNqQixzQkFBc0IsRUFBRSxtQ0FBZSxDQUFDLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O2FBZTVDLENBQUM7WUFDUix1QkFBdUIsRUFBRSxtQ0FBZSxDQUFDLFVBQVUsQ0FBQzs7Ozs7O09BTW5ELENBQUM7U0FDSCxDQUFDLENBQUM7UUFFSCxzQkFBc0IsQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFO1lBQ2hELFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFNBQVMsRUFBRSxVQUFVO1lBQ3JCLHNCQUFzQixFQUFFLG1DQUFlLENBQUMsVUFBVSxDQUFDOzs7Ozs7Ozs7Ozs7O2tDQWF2QixXQUFXLENBQUMsZUFBZTs7OztRQUlyRCxDQUFDO1lBQ0gsdUJBQXVCLEVBQUUsbUNBQWUsQ0FBQyxVQUFVLENBQUM7O09BRW5ELENBQUM7U0FDSCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFwT0Qsc0NBb09DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQXV0aG9yaXphdGlvblR5cGUsXG4gIEZpZWxkTG9nTGV2ZWwsXG4gIEdyYXBocWxBcGksXG4gIE1hcHBpbmdUZW1wbGF0ZSxcbiAgU2NoZW1hRmlsZSxcbn0gZnJvbSBcIkBhd3MtY2RrL2F3cy1hcHBzeW5jLWFscGhhXCI7XG5pbXBvcnQgeyBBdHRyaWJ1dGVUeXBlLCBCaWxsaW5nTW9kZSwgVGFibGUgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiXCI7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBTRk5QdXROb2RlcyB9IGZyb20gXCIuL3Nmbi1wdXQtbm9kZVwiO1xuXG5pbnRlcmZhY2UgQ29tcGVuZGl1bUFwaVByb3BzIHt9XG5cbmV4cG9ydCBjbGFzcyBDb21wZW5kaXVtQVBJIGV4dGVuZHMgQ29uc3RydWN0IHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IENvbXBlbmRpdW1BcGlQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCBkeW5hbW9UYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCBgJHtpZH1UYWJsZWAsIHtcbiAgICAgIHRhYmxlTmFtZTogaWQsXG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogXCJQS1wiLCB0eXBlOiBBdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgc29ydEtleTogeyBuYW1lOiBcIlNLXCIsIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBiaWxsaW5nTW9kZTogQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2ZuUHV0Tm9kZXMgPSBuZXcgU0ZOUHV0Tm9kZXModGhpcywgaWQsIHsgZHluYW1vVGFibGUgfSk7XG5cbiAgICBkeW5hbW9UYWJsZS5hZGRHbG9iYWxTZWNvbmRhcnlJbmRleCh7XG4gICAgICBpbmRleE5hbWU6IFwiSW52ZXJzZVwiLFxuICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgIG5hbWU6IFwiU0tcIixcbiAgICAgICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICB9LFxuICAgICAgc29ydEtleToge1xuICAgICAgICBuYW1lOiBcIlBLXCIsXG4gICAgICAgIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBkeW5hbW9UYWJsZS5hZGRHbG9iYWxTZWNvbmRhcnlJbmRleCh7XG4gICAgICBpbmRleE5hbWU6IFwiR1NJMVwiLFxuICAgICAgcGFydGl0aW9uS2V5OiB7XG4gICAgICAgIG5hbWU6IFwiR1NJMVBLXCIsXG4gICAgICAgIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HLFxuICAgICAgfSxcbiAgICAgIHNvcnRLZXk6IHtcbiAgICAgICAgbmFtZTogXCJHU0kxU0tcIixcbiAgICAgICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgYXBpID0gbmV3IEdyYXBocWxBcGkodGhpcywgXCJ0aGlzXCIsIHtcbiAgICAgIG5hbWU6IGlkLFxuICAgICAgc2NoZW1hOiBTY2hlbWFGaWxlLmZyb21Bc3NldChqb2luKF9fZGlybmFtZSwgXCJzY2hlbWEuZ3JhcGhxbFwiKSksXG4gICAgICBsb2dDb25maWc6IHtcbiAgICAgICAgZmllbGRMb2dMZXZlbDogRmllbGRMb2dMZXZlbC5BTEwsXG4gICAgICB9LFxuICAgICAgYXV0aG9yaXphdGlvbkNvbmZpZzoge1xuICAgICAgICBkZWZhdWx0QXV0aG9yaXphdGlvbjoge1xuICAgICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBBdXRob3JpemF0aW9uVHlwZS5JQU0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGR5bmFtb0RhdGFTb3VyY2UgPSBhcGkuYWRkRHluYW1vRGJEYXRhU291cmNlKFwiRHluYW1vREJcIiwgZHluYW1vVGFibGUpO1xuICAgIGNvbnN0IHN0ZXBGdW5jdGlvbkRhdGFTb3VyY2UgPSBhcGkuYWRkSHR0cERhdGFTb3VyY2UoXG4gICAgICBcIlN0ZXBGdW5jdGlvblwiLFxuICAgICAgXCJodHRwczovL3N0YXRlcy5ldS1jZW50cmFsLTEuYW1hem9uYXdzLmNvbS9cIixcbiAgICAgIHtcbiAgICAgICAgYXV0aG9yaXphdGlvbkNvbmZpZzoge1xuICAgICAgICAgIHNpZ25pbmdSZWdpb246IFwiZXUtY2VudHJhbC0xXCIsXG4gICAgICAgICAgc2lnbmluZ1NlcnZpY2VOYW1lOiBcInN0YXRlc1wiLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgICk7XG4gICAgZHluYW1vVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKHN0ZXBGdW5jdGlvbkRhdGFTb3VyY2UpO1xuICAgIHNmblB1dE5vZGVzLmdyYW50KHN0ZXBGdW5jdGlvbkRhdGFTb3VyY2UsIGBzdGF0ZXM6U3RhcnRFeGVjdXRpb25gKTtcblxuICAgIGR5bmFtb0RhdGFTb3VyY2UuY3JlYXRlUmVzb2x2ZXIoXCJxdWVyeU5vZGVcIiwge1xuICAgICAgdHlwZU5hbWU6IFwiUXVlcnlcIixcbiAgICAgIGZpZWxkTmFtZTogXCJub2RlXCIsXG4gICAgICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZnJvbVN0cmluZyhgXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIFwidmVyc2lvblwiOiBcIjIwMTgtMDUtMjlcIixcbiAgICAgICAgICAgICAgXCJvcGVyYXRpb25cIiA6IFwiR2V0SXRlbVwiLFxuICAgICAgICAgICAgICBcImtleVwiIDoge1xuICAgICAgICAgICAgICAgICAgXCJQS1wiIDogJHV0aWwuZHluYW1vZGIudG9EeW5hbW9EQkpzb24oXCJOT0RFfCRjdHguYXJncy5pZFwiKSxcbiAgICAgICAgICAgICAgICAgIFwiU0tcIiA6ICR1dGlsLmR5bmFtb2RiLnRvRHluYW1vREJKc29uKFwiTk9ERXwkY3R4LmFyZ3MuaWRcIilcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgXCJjb25zaXN0ZW50UmVhZFwiIDogZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGApLFxuICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IE1hcHBpbmdUZW1wbGF0ZS5mcm9tU3RyaW5nKGBcbiAgICAgICNzZXQoJHJlcyA9ICRjb250ZXh0LnJlc3VsdClcbiAgICAgICR1dGlsLnFyKCRyZXMucHV0KFwibWV0YWRhdGFcIiwkdXRpbC5wYXJzZUpzb24oJHJlcy5tZXRhZGF0YSkpKVxuICAgICAgJHV0aWwudG9Kc29uKCRyZXMpXG4gICAgICBgKSxcbiAgICB9KTtcblxuICAgIGR5bmFtb0RhdGFTb3VyY2UuY3JlYXRlUmVzb2x2ZXIoXCJxdWVyeVJlY2VudE5vZGVcIiwge1xuICAgICAgdHlwZU5hbWU6IFwiUXVlcnlcIixcbiAgICAgIGZpZWxkTmFtZTogXCJyZWNlbnROb2Rlc1wiLFxuICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgICB7XG4gICAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMjAxOC0wNS0yOVwiLFxuICAgICAgICAgIFwib3BlcmF0aW9uXCIgOiBcIlF1ZXJ5XCIsXG4gICAgICAgICAgXCJpbmRleFwiOlwiR1NJMVwiLFxuICAgICAgICAgIFwic2NhbkluZGV4Rm9yd2FyZFwiOmZhbHNlLFxuICAgICAgICAgIFwicXVlcnlcIiA6IHtcbiAgICAgICAgICAgICAgXCJleHByZXNzaW9uXCIgOiBcIkdTSTFQSyA9IDpQS1wiLFxuICAgICAgICAgICAgICBcImV4cHJlc3Npb25WYWx1ZXNcIiA6IHtcbiAgICAgICAgICAgICAgICAgIFwiOlBLXCI6JHV0aWwuZHluYW1vZGIudG9EeW5hbW9EQkpzb24oXCJOT0RFU3xSRUNFTlRcIilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJsaW1pdFwiOiR1dGlsLmRlZmF1bHRJZk51bGwoJGN0eC5hcmdzLmxpbWl0LDEwKSxcbiAgICAgICAgICBcImNvbnNpc3RlbnRSZWFkXCIgOiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgICAgICBgKSxcbiAgICAgIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZnJvbVN0cmluZyhgXG4gICAgICAgICNzZXQoJGl0ZW1zID0gJGNvbnRleHQucmVzdWx0Lml0ZW1zKVxuICAgICAgICAjZm9yZWFjaCAoJGl0ZW0gaW4gJGl0ZW1zKVxuICAgICAgICAgICR1dGlsLnFyKCRpdGVtLnB1dChcIm1ldGFkYXRhXCIsJHV0aWwucGFyc2VKc29uKCRpdGVtLm1ldGFkYXRhKSkpXG4gICAgICAgICNlbmRcbiAgICAgICAgJHV0aWxzLnRvSnNvbigkaXRlbXMpXG4gICAgICBgKSxcbiAgICB9KTtcbiAgICBkeW5hbW9EYXRhU291cmNlLmNyZWF0ZVJlc29sdmVyKFwibm9kZURlcGVuZGFudHNcIiwge1xuICAgICAgdHlwZU5hbWU6IFwiTm9kZVwiLFxuICAgICAgZmllbGROYW1lOiBcImRlcGVuZGFudHNcIixcbiAgICAgIHJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6IE1hcHBpbmdUZW1wbGF0ZS5mcm9tU3RyaW5nKGBcbiAgICAgICAge1xuICAgICAgICAgIFwidmVyc2lvblwiOiBcIjIwMTgtMDUtMjlcIixcbiAgICAgICAgICBcIm9wZXJhdGlvblwiIDogXCJRdWVyeVwiLFxuICAgICAgICAgIFwiaW5kZXhcIjpcIkludmVyc2VcIixcbiAgICAgICAgICBcInF1ZXJ5XCIgOiB7XG4gICAgICAgICAgICAgIFwiZXhwcmVzc2lvblwiIDogXCJTSyA9IDpTS1wiLFxuICAgICAgICAgICAgICBcImV4cHJlc3Npb25WYWx1ZXNcIiA6IHtcbiAgICAgICAgICAgICAgICAgIFwiOlNLXCIgOiAkdXRpbC5keW5hbW9kYi50b0R5bmFtb0RCSnNvbihcIkRFUEVOREVOQ1l8Tk9ERXwkY3R4LnNvdXJjZS5pZFwiKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImxpbWl0XCI6JHV0aWwuZGVmYXVsdElmTnVsbCgkY3R4LmFyZ3MubGltaXQsMTAwKSxcbiAgICAgICAgICBcImNvbnNpc3RlbnRSZWFkXCIgOiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgICAgICBgKSxcbiAgICAgIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZnJvbVN0cmluZyhgXG4gICAgICAgICR1dGlscy50b0pzb24oJGNvbnRleHQucmVzdWx0Lml0ZW1zKVxuICAgICAgYCksXG4gICAgfSk7XG4gICAgZHluYW1vRGF0YVNvdXJjZS5jcmVhdGVSZXNvbHZlcihcIm5vZGVEZXBlbmRlbmNpZXNcIiwge1xuICAgICAgdHlwZU5hbWU6IFwiTm9kZVwiLFxuICAgICAgZmllbGROYW1lOiBcImRlcGVuZGVuY2llc1wiLFxuICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgICB7XG4gICAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMjAxOC0wNS0yOVwiLFxuICAgICAgICAgIFwib3BlcmF0aW9uXCIgOiBcIlF1ZXJ5XCIsXG4gICAgICAgICAgXCJxdWVyeVwiIDoge1xuICAgICAgICAgICAgICBcImV4cHJlc3Npb25cIiA6IFwiUEsgPSA6cGsgYW5kIGJlZ2luc193aXRoKFNLLDpzaylcIixcbiAgICAgICAgICAgICAgXCJleHByZXNzaW9uVmFsdWVzXCIgOiB7XG4gICAgICAgICAgICAgICAgICBcIjpwa1wiIDogJHV0aWwuZHluYW1vZGIudG9EeW5hbW9EQkpzb24oXCJOT0RFfCRjdHguc291cmNlLmlkXCIpLFxuICAgICAgICAgICAgICAgICAgXCI6c2tcIiA6ICR1dGlsLmR5bmFtb2RiLnRvRHluYW1vREJKc29uKFwiREVQRU5ERU5DWXxOT0RFfFwiKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImxpbWl0XCI6JHV0aWwuZGVmYXVsdElmTnVsbCgkY3R4LmFyZ3MubGltaXQsMTAwKSxcbiAgICAgICAgICBcImNvbnNpc3RlbnRSZWFkXCIgOiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgICAgICBgKSxcbiAgICAgIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZnJvbVN0cmluZyhgXG4gICAgICAgICR1dGlscy50b0pzb24oJGNvbnRleHQucmVzdWx0Lml0ZW1zKVxuICAgICAgYCksXG4gICAgfSk7XG5cbiAgICBkeW5hbW9EYXRhU291cmNlLmNyZWF0ZVJlc29sdmVyKFwiZGVwZW5kYW50Tm9kZVwiLCB7XG4gICAgICB0eXBlTmFtZTogXCJEZXBlbmRhbnRcIixcbiAgICAgIGZpZWxkTmFtZTogXCJub2RlXCIsXG4gICAgICByZXF1ZXN0TWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZnJvbVN0cmluZyhgXG4gICAgICAgIHtcbiAgICAgICAgICBcInZlcnNpb25cIjogXCIyMDE4LTA1LTI5XCIsXG4gICAgICAgICAgXCJvcGVyYXRpb25cIiA6IFwiR2V0SXRlbVwiLFxuICAgICAgICAgIFwia2V5XCIgOiB7XG4gICAgICAgICAgICAgIFwiUEtcIiA6ICR1dGlsLmR5bmFtb2RiLnRvRHluYW1vREJKc29uKFwiJGN0eC5zb3VyY2UuZGVwZW5kYW50SWRcIiksXG4gICAgICAgICAgICAgIFwiU0tcIiA6ICR1dGlsLmR5bmFtb2RiLnRvRHluYW1vREJKc29uKFwiJGN0eC5zb3VyY2UuZGVwZW5kYW50SWRcIilcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiY29uc2lzdGVudFJlYWRcIiA6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgICAgICAgIGApLFxuICAgICAgcmVzcG9uc2VNYXBwaW5nVGVtcGxhdGU6IE1hcHBpbmdUZW1wbGF0ZS5mcm9tU3RyaW5nKGBcbiAgICAgICAgJHV0aWxzLnRvSnNvbigkY29udGV4dC5yZXN1bHQpXG4gICAgICBgKSxcbiAgICB9KTtcblxuICAgIGR5bmFtb0RhdGFTb3VyY2UuY3JlYXRlUmVzb2x2ZXIoXCJkZXBlbmRlbmN5Tm9kZVwiLCB7XG4gICAgICB0eXBlTmFtZTogXCJEZXBlbmRlbmN5XCIsXG4gICAgICBmaWVsZE5hbWU6IFwibm9kZVwiLFxuICAgICAgcmVxdWVzdE1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgICB7XG4gICAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMjAxOC0wNS0yOVwiLFxuICAgICAgICAgIFwib3BlcmF0aW9uXCIgOiBcIlF1ZXJ5XCIsXG4gICAgICAgICAgXCJxdWVyeVwiIDoge1xuICAgICAgICAgICAgICBcImV4cHJlc3Npb25cIiA6IFwiUEsgPSA6cGsgYW5kIGJlZ2luc193aXRoKFNLLDpzaylcIixcbiAgICAgICAgICAgICAgXCJleHByZXNzaW9uVmFsdWVzXCIgOiB7XG4gICAgICAgICAgICAgICAgICBcIjpwa1wiIDogJHV0aWwuZHluYW1vZGIudG9EeW5hbW9EQkpzb24oXCIkY3R4LnNvdXJjZS5kZXBlbmRlbmN5SWRcIiksXG4gICAgICAgICAgICAgICAgICBcIjpza1wiIDogJHV0aWwuZHluYW1vZGIudG9EeW5hbW9EQkpzb24oXCIkY3R4LnNvdXJjZS5kZXBlbmRlbmN5SWRcIilcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzY2FuSW5kZXhGb3J3YXJkXCI6ZmFsc2UsXG4gICAgICAgICAgXCJsaW1pdFwiOjEsXG4gICAgICAgICAgXCJjb25zaXN0ZW50UmVhZFwiIDogZmFsc2VcbiAgICAgICAgfVxuICAgICAgICAgICAgYCksXG4gICAgICByZXNwb25zZU1hcHBpbmdUZW1wbGF0ZTogTWFwcGluZ1RlbXBsYXRlLmZyb21TdHJpbmcoYFxuICAgICAgICAjaWYgKCRjb250ZXh0LnJlc3VsdC5pdGVtcy5zaXplKCkgPT0gMClcbiAgICAgICAgICBudWxsXG4gICAgICAgICNlbHNlXG4gICAgICAgICAgJHV0aWxzLnRvSnNvbigkY29udGV4dC5yZXN1bHQuaXRlbXNbMF0pXG4gICAgICAgICNlbmRcbiAgICAgIGApLFxuICAgIH0pO1xuXG4gICAgc3RlcEZ1bmN0aW9uRGF0YVNvdXJjZS5jcmVhdGVSZXNvbHZlcihcInB1dE5vZGVzXCIsIHtcbiAgICAgIHR5cGVOYW1lOiBcIk11dGF0aW9uXCIsXG4gICAgICBmaWVsZE5hbWU6IFwicHV0Tm9kZXNcIixcbiAgICAgIHJlcXVlc3RNYXBwaW5nVGVtcGxhdGU6IE1hcHBpbmdUZW1wbGF0ZS5mcm9tU3RyaW5nKGBcbiAgICAgICAgICAgICR1dGlsLnFyKCRjdHguc3Rhc2gucHV0KFwiZXhlY3V0aW9uSWRcIiwgJHV0aWwuYXV0b0lkKCkpKVxuXG4gICAgICB7XG4gICAgICAgIFwidmVyc2lvblwiOiBcIjIwMTgtMDUtMjlcIixcbiAgICAgICAgXCJtZXRob2RcIjogXCJQT1NUXCIsXG4gICAgICAgIFwicmVzb3VyY2VQYXRoXCI6IFwiL1wiLFxuICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgXCJoZWFkZXJzXCI6IHtcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24veC1hbXotanNvbi0xLjBcIixcbiAgICAgICAgICAgIFwieC1hbXotdGFyZ2V0XCI6XCJBV1NTdGVwRnVuY3Rpb25zLlN0YXJ0RXhlY3V0aW9uXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiYm9keVwiOiB7XG4gICAgICAgICAgICBcInN0YXRlTWFjaGluZUFyblwiOiBcIiR7c2ZuUHV0Tm9kZXMuc3RhdGVNYWNoaW5lQXJufVwiLFxuICAgICAgICAgICAgXCJpbnB1dFwiOiAkdXRpbHMudG9Kc29uKCR1dGlscy50b0pzb24oJGN0eC5hcmdzKSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1gKSxcbiAgICAgIHJlc3BvbnNlTWFwcGluZ1RlbXBsYXRlOiBNYXBwaW5nVGVtcGxhdGUuZnJvbVN0cmluZyhgXG4gICAgICB7XCJleGVjdXRpb25Bcm5cIjpcIiR1dGlscy5wYXJzZUpzb24oJGN0eC5yZXN1bHQuYm9keSkuZXhlY3V0aW9uQXJuXCJ9XG4gICAgICBgKSxcbiAgICB9KTtcbiAgfVxufVxuIl19