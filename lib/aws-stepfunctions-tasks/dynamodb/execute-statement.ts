import { Stack } from "aws-cdk-lib";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  FieldUtils,
  TaskMetricsConfig,
  TaskStateBase,
  TaskStateBaseProps,
} from "aws-cdk-lib/aws-stepfunctions";
import { DynamoAttributeValue } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { DynamoMethod, getDynamoExecuteStatementArn } from "./private/utils";
import {
  DynamoConsumedCapacity,
  DynamoProjectionExpression,
} from "./shared-types";

/**
 * Properties for DynamoGetItem Task
 */
export interface DynamoExecuteStatementProps extends TaskStateBaseProps {
  /**
   * The name of the table containing the requested item.
   */
  readonly table: ITable;

  /**
   * Determines the read consistency model:
   * If set to true, then the operation uses strongly consistent reads;
   * otherwise, the operation uses eventually consistent reads.
   */
  readonly statement: string;

  /**
   * Determines the read consistency model:
   * If set to true, then the operation uses strongly consistent reads;
   * otherwise, the operation uses eventually consistent reads.
   *
   * @default false
   */
  readonly consistentRead?: boolean;

  /**
   * One or more values that can be substituted in an expression.
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html#DDB-PutItem-request-ExpressionAttributeValues
   *
   * @default - No expression attribute values
   */
  readonly parameters?: [DynamoAttributeValue];

  /**
   * Determines the level of detail about provisioned throughput consumption that is returned in the response
   *
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html#DDB-GetItem-request-ReturnConsumedCapacity
   *
   * @default DynamoConsumedCapacity.NONE
   */
  readonly returnConsumedCapacity?: DynamoConsumedCapacity;
}

/**
 * A StepFunctions task to call DynamoGetItem
 */
export class DynamoExecuteStatement extends TaskStateBase {
  protected readonly taskMetrics?: TaskMetricsConfig;
  protected readonly taskPolicies?: PolicyStatement[];

  constructor(
    scope: Construct,
    id: string,
    private readonly props: DynamoExecuteStatementProps
  ) {
    super(scope, id, props);

    this.taskPolicies = [
      new PolicyStatement({
        resources: [
          Stack.of(this).formatArn({
            service: "dynamodb",
            resource: "table",
            resourceName: props.table.tableName,
          }),
        ],
        actions: [`dynamodb:PartiQLSelect`],
      }),
    ];
  }

  /**
   * @internal
   */
  protected _renderTask(): any {
    return {
      Resource: "arn:aws:states:::aws-sdk:dynamodb:executeStatement",
      Parameters: FieldUtils.renderObject({
        ConsistentRead: this.props.consistentRead ?? false,
        Statement: this.props.statement,
        Parameters: this.props.parameters?.map((x) => x.toObject()),
        ReturnConsumedCapacity: this.props.returnConsumedCapacity,
      }),
    };
  }
}
