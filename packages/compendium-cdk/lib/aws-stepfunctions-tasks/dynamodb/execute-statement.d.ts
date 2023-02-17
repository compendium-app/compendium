import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { TaskMetricsConfig, TaskStateBase, TaskStateBaseProps } from "aws-cdk-lib/aws-stepfunctions";
import { DynamoAttributeValue } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import { DynamoConsumedCapacity } from "./shared-types";
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
export declare class DynamoExecuteStatement extends TaskStateBase {
    private readonly props;
    protected readonly taskMetrics?: TaskMetricsConfig;
    protected readonly taskPolicies?: PolicyStatement[];
    constructor(scope: Construct, id: string, props: DynamoExecuteStatementProps);
    /**
     * @internal
     */
    protected _renderTask(): any;
}
