import {
  AuthorizationType,
  FieldLogLevel,
  GraphqlApi,
  MappingTemplate,
  SchemaFile,
} from "@aws-cdk/aws-appsync-alpha";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { join } from "path";
import { SFNPutNodes } from "./sfn-put-node";

interface CompendiumApiProps {}

export class CompendiumAPI extends Construct {
  constructor(scope: Construct, id: string, props: CompendiumApiProps) {
    super(scope, id);

    const dynamoTable = new Table(this, `${id}Table`, {
      tableName: "compendium",
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
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

    stepFunctionDataSource.createResolver("putNodes", {
      typeName: "Mutation",
      fieldName: "putNodes",
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
    });
  }
}
