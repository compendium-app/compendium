import { Table } from "aws-cdk-lib/aws-dynamodb";
import {
  IChainable,
  JsonPath,
  Map,
  StateMachine,
  StateMachineProps,
  StateMachineType,
} from "aws-cdk-lib/aws-stepfunctions";
import {
  DynamoAttributeValue,
  DynamoDeleteItem,
  DynamoPutItem,
} from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { DynamoExecuteStatement } from "./aws-stepfunctions-tasks/dynamodb/execute-statement";

interface SFNPutNodesProps extends Omit<StateMachineProps, "definition"> {
  dynamoTable: Table;
}

export class SFNPutNodes extends StateMachine {
  constructor(scope: Construct, id: string, props: SFNPutNodesProps) {
    const definition = SFNPutNodes.getDefinition(scope, id, props);
    super(scope, `${id}PutNode`, {
      definition,
      stateMachineType: StateMachineType.STANDARD,
      ...props,
    });
  }

  private static getDefinition(
    scope: Construct,
    id: string,
    { dynamoTable }: SFNPutNodesProps
  ): IChainable {
    const putNode = new DynamoPutItem(scope, `${id}PutItem`, {
      table: dynamoTable,
      resultPath: JsonPath.stringAt("$.result"),
      item: {
        PK: DynamoAttributeValue.fromString(
          JsonPath.format("NODE|{}", JsonPath.stringAt("$.node.id"))
        ),
        SK: DynamoAttributeValue.fromString(
          JsonPath.format("NODE|{}", JsonPath.stringAt("$.node.id"))
        ),
        GSI1PK: DynamoAttributeValue.fromString("NODES|RECENT"),
        GSI1SK: DynamoAttributeValue.fromString(
          JsonPath.format(
            "{}|{}",
            JsonPath.stringAt("$$.Execution.StartTime"),
            JsonPath.stringAt("$.node.id")
          )
        ),
        id: DynamoAttributeValue.fromString(JsonPath.stringAt("$.node.id")),
        name: DynamoAttributeValue.fromString(JsonPath.stringAt("$.node.name")),
        metadata: DynamoAttributeValue.fromString(
          JsonPath.jsonToString(JsonPath.objectAt("$.node.metadata"))
        ),
        version: DynamoAttributeValue.fromString(
          JsonPath.stringAt("$$.Execution.StartTime")
        ),
      },
    });
    const storeDependeeEdge = new DynamoPutItem(
      scope,
      `${id}StoreDependeeEdge`,
      {
        table: dynamoTable,
        resultPath: JsonPath.DISCARD,
        item: {
          PK: DynamoAttributeValue.fromString(
            JsonPath.format("NODE|{}", JsonPath.stringAt("$.node.id"))
          ),
          SK: DynamoAttributeValue.fromString(
            JsonPath.format(
              "DEPENDENCY|NODE|{}",
              JsonPath.stringAt("$.dependency")
            )
          ),
          dependencyId: DynamoAttributeValue.fromString(
            JsonPath.format("NODE|{}", JsonPath.stringAt("$.dependency"))
          ),
          dependantId: DynamoAttributeValue.fromString(
            JsonPath.format("NODE|{}", JsonPath.stringAt("$.node.id"))
          ),
          dependantVersion: DynamoAttributeValue.fromString(
            JsonPath.stringAt("$$.Execution.StartTime")
          ),
        },
      }
    );
    const getOutdatedDependencies = new DynamoExecuteStatement(
      scope,
      `${id}GetOutdatedDependencies`,
      {
        table: dynamoTable,
        statement: JsonPath.format(
          `SELECT * FROM "${dynamoTable.tableName}" WHERE PK = 'NODE|{}' AND begins_with(SK,'DEPENDENCY|NODE|') AND dependantVersion < ?`,
          JsonPath.stringAt("$.node.id")
        ),
        parameters: [
          DynamoAttributeValue.fromString(
            JsonPath.stringAt("$$.Execution.StartTime")
          ),
        ],
        resultPath: JsonPath.stringAt("$.invalidDependencies"),
      }
    );

    const deleteOutdatedDependencie = new DynamoDeleteItem(
      scope,
      `${id}GetOutdatedDependencie`,
      {
        table: dynamoTable,
        key: {
          PK: DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.dependency.PK.S")
          ),
          SK: DynamoAttributeValue.fromString(
            JsonPath.stringAt("$.dependency.SK.S")
          ),
        },
        resultPath: JsonPath.stringAt("$.invalidDependencies"),
      }
    );
    return new Map(scope, "MapPutNodes", {
      itemsPath: JsonPath.stringAt("$.nodes"),
      parameters: {
        node: JsonPath.stringAt("$$.Map.Item.Value"),
      },
    }).iterator(
      putNode
        .next(
          new Map(scope, "StoreDependencies", {
            itemsPath: JsonPath.stringAt("$.node.dependencies"),
            parameters: {
              dependency: JsonPath.stringAt("$$.Map.Item.Value"),
              node: JsonPath.stringAt("$.node"),
            },
            resultPath: JsonPath.DISCARD,
          }).iterator(storeDependeeEdge)
        )
        .next(
          getOutdatedDependencies.next(
            new Map(scope, "DeleteOutdatedDependencies", {
              itemsPath: JsonPath.stringAt("$.invalidDependencies.Items"),
              parameters: {
                dependency: JsonPath.stringAt("$$.Map.Item.Value"),
                node: JsonPath.stringAt("$.node"),
              },
            }).iterator(deleteOutdatedDependencie)
          )
        )
    );
  }
}
