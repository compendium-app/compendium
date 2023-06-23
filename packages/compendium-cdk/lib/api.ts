import {
  AppsyncFunction,
  AuthorizationType,
  FieldLogLevel,
  GraphqlApi,
  MappingTemplate,
  SchemaFile,
} from "@aws-cdk/aws-appsync-alpha";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { join } from "path";
import { SFNPutNodes } from "./sfn-put-node";

interface CompendiumApiProps {
  isDynamoTableDestroyable: boolean;
}

export class CompendiumAPI extends Construct {
  appSyncUrl: string;
  appSyncArn: string;

  constructor(scope: Construct, id: string, props?: CompendiumApiProps) {
    super(scope, id);

    const dynamoTable = new Table(this, `CompendiumTable`, {
      tableName: `${id}`,
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: props?.isDynamoTableDestroyable
        ? RemovalPolicy.DESTROY
        : RemovalPolicy.RETAIN,
    });

    const sfnPutNodes = new SFNPutNodes(this, id, { dynamoTable });

    dynamoTable.addGlobalSecondaryIndex({
      indexName: "Inverse",
      partitionKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
    });
    dynamoTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: AttributeType.STRING,
      },
    });

    dynamoTable.addGlobalSecondaryIndex({
      indexName: "GSI2",
      partitionKey: {
        name: "GSI2PK",
        type: AttributeType.STRING,
      },
    });

    const api = new GraphqlApi(this, `${id}GraphqlApi`, {
      name: id,
      schema: SchemaFile.fromAsset(join(__dirname, "schema.graphql")),
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.IAM,
        },
      },
    });
    const dynamoDataSource = api.addDynamoDbDataSource("DynamoDB", dynamoTable);
    const stepFunctionDataSource = api.addHttpDataSource(
      "StepFunction",
      "https://states.eu-central-1.amazonaws.com/",
      {
        authorizationConfig: {
          signingRegion: "eu-central-1",
          signingServiceName: "states",
        },
      }
    );

    dynamoTable.grantReadWriteData(stepFunctionDataSource);
    sfnPutNodes.grant(stepFunctionDataSource, `states:StartExecution`);

    dynamoDataSource.createResolver("queryNode", {
      typeName: "Query",
      fieldName: "node",
      requestMappingTemplate: MappingTemplate.fromString(`
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
      responseMappingTemplate: MappingTemplate.fromString(`
      #set($res = $context.result)
      $util.qr($res.put("metadata",$util.parseJson($res.metadata)))
      $util.toJson($res)
      `),
    });

    dynamoDataSource.createResolver("queryRecentNode", {
      typeName: "Query",
      fieldName: "recentNodes",
      requestMappingTemplate: MappingTemplate.fromString(`
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
      responseMappingTemplate: MappingTemplate.fromString(`
        #set($items = $context.result.items)
        #foreach ($item in $items)
          $util.qr($item.put("metadata",$util.parseJson($item.metadata)))
        #end
        $utils.toJson($items)
      `),
    });

    dynamoDataSource.createResolver("queryNodeTypes", {
      typeName: "Query",
      fieldName: "nodeTypes",
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation" : "Query",
          "query" : {
              "expression" : "PK = :PK",
              "expressionValues" : {
                  ":PK":$util.dynamodb.toDynamoDBJson("TYPE")
              }
          },
          "consistentRead" : false
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        #set($items = $context.result.items)
        $utils.toJson($items)
      `),
    });

    dynamoDataSource.createResolver("queryNodesByType", {
      typeName: "Query",
      fieldName: "nodesByType",
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation" : "Query",
          "index":"GSI2",
          "query" : {
              "expression" : "GSI2PK = :GSI2PK",
              "expressionValues" : {
                  ":GSI2PK" : $util.dynamodb.toDynamoDBJson("TYPE|$ctx.args.typeId")
              }
          },
          "limit":$util.defaultIfNull($ctx.args.limit,100),
          "consistentRead" : false
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        #set($items = $context.result.items)
        $utils.toJson($items)
      `),
    });

    dynamoDataSource.createResolver("nodeDependants", {
      typeName: "Node",
      fieldName: "dependants",
      requestMappingTemplate: MappingTemplate.fromString(`
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
      responseMappingTemplate: MappingTemplate.fromString(`
        $utils.toJson($context.result.items)
      `),
    });
    dynamoDataSource.createResolver("nodeDependencies", {
      typeName: "Node",
      fieldName: "dependencies",
      requestMappingTemplate: MappingTemplate.fromString(`
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
      responseMappingTemplate: MappingTemplate.fromString(`
        $utils.toJson($context.result.items)
      `),
    });

    dynamoDataSource.createResolver("nodeType", {
      typeName: "Node",
      fieldName: "type",
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation" : "GetItem",
          "key" : {
            "PK" : $util.dynamodb.toDynamoDBJson("TYPE"),
            "SK" : $util.dynamodb.toDynamoDBJson("TYPE|$ctx.source.typeId")
          },
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
        $utils.toJson($context.result)
      `),
    });

    dynamoDataSource.createResolver("dependantNode", {
      typeName: "Dependant",
      fieldName: "node",
      requestMappingTemplate: MappingTemplate.fromString(`
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
      responseMappingTemplate: MappingTemplate.fromString(`
        $utils.toJson($context.result)
      `),
    });

    dynamoDataSource.createResolver("dependencyNode", {
      typeName: "Dependency",
      fieldName: "node",
      requestMappingTemplate: MappingTemplate.fromString(`
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
      responseMappingTemplate: MappingTemplate.fromString(`
        #if ($context.result.items.size() == 0)
          null
        #else
          $utils.toJson($context.result.items[0])
        #end
      `),
    });

    dynamoDataSource.createResolver("putNodeType", {
      typeName: "Mutation",
      fieldName: "putNodeType",
      requestMappingTemplate: MappingTemplate.fromString(`
      {
        "version": "2018-05-29",
        "operation" : "PutItem",
        "key": {
          "PK": $util.dynamodb.toDynamoDBJson("TYPE"),
          "SK": $util.dynamodb.toDynamoDBJson("TYPE|$ctx.args.type.id")
        },
        "attributeValues": {
          "id": $util.dynamodb.toDynamoDBJson($ctx.args.type.id),
          "name" : $util.dynamodb.toDynamoDBJson($ctx.args.type.name)
        }
      }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
      $utils.toJson($ctx.result)
      `),
    });

    dynamoDataSource.createResolver("deleteNodeType", {
      typeName: "Mutation",
      fieldName: "deleteNodeType",
      requestMappingTemplate: MappingTemplate.fromString(`
        {
          "version": "2018-05-29",
          "operation" : "DeleteItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("TYPE"),
            "SK": $util.dynamodb.toDynamoDBJson("TYPE|$ctx.args.id")
          }
        }
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
      $utils.toJson($ctx.result)
      `),
    });

    api.createResolver("putNodesResolver", {
      typeName: "Mutation",
      fieldName: "putNodes",
      requestMappingTemplate: MappingTemplate.fromString(`
      $utils.toJson($ctx.args)
      `),
      responseMappingTemplate: MappingTemplate.fromString(`
      $utils.toJson($ctx.result)
      `),
      pipelineConfig: [
        dynamoDataSource.createFunction("getNodeTypesFunction", {
          name: "getNodeTypesFunction",
          requestMappingTemplate: MappingTemplate.fromString(`
          {
            "version": "2018-05-29",
            "operation" : "Query",
            "scanIndexForward":false,
            "query" : {
                "expression" : "PK = :PK",
                "expressionValues" : {
                    ":PK":$util.dynamodb.toDynamoDBJson("TYPE")
                }
            },
            "consistentRead" : false
          }
          `),
          responseMappingTemplate: MappingTemplate.fromString(`
          #set($types = $context.result.items)
          #set($typesList = [])
          #foreach ($type in $types)
            $util.qr($typesList.add($type.id))
          #end
          $utils.toJson($typesList)
        `),
        }),
        new AppsyncFunction(this, "validateTypes", {
          api,
          name: "validateTypes",
          dataSource: api.addNoneDataSource("none"),
          requestMappingTemplate: MappingTemplate.fromString(`
          #set($types = $ctx.prev.result)
          #set($nodes = $ctx.args.nodes)
          #foreach ($node in $nodes)
            #if (!$types.contains($node.typeId))
              $util.error("$node.typeId not a valid type")
            #end
          #end
          {
            "version": "2018-05-29",
            "payload": {}
          }
          `),
          responseMappingTemplate: MappingTemplate.fromString(`
          null
          `),
        }),
        stepFunctionDataSource.createFunction("putNodes", {
          name: "putNodesFunction",

          requestMappingTemplate: MappingTemplate.fromString(`
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
          responseMappingTemplate: MappingTemplate.fromString(`
          {"executionArn":"$utils.parseJson($ctx.result.body).executionArn"}
          `),
        }),
      ],
    });

    this.appSyncUrl = api.graphqlUrl;
    this.appSyncArn = api.arn;
    // Outputs
    new CfnOutput(this, "AppSyncUrl", {
      value: api.graphqlUrl,
    });
    new CfnOutput(this, "AppSyncArn", {
      value: api.arn,
    });
  }
}
