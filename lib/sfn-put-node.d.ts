import { Table } from "aws-cdk-lib/aws-dynamodb";
import { StateMachine, StateMachineProps } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
interface SFNPutNodesProps extends Omit<StateMachineProps, "definition"> {
    dynamoTable: Table;
}
export declare class SFNPutNodes extends StateMachine {
    constructor(scope: Construct, id: string, props: SFNPutNodesProps);
    private static getDefinition;
}
export {};
