import type { StackProps } from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
type EKSAppStackProps = StackProps;
export declare class CompendiumStack extends Stack {
    constructor(scope: Construct, id: string, props: EKSAppStackProps);
}
export {};
