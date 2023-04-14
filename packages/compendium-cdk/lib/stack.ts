import type { StackProps } from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";
import { CompendiumAPI } from "./api";

type EKSAppStackProps = StackProps;

export class CompendiumStack extends Stack {
  constructor(scope: Construct, id: string, props: EKSAppStackProps) {
    super(scope, id, props);

    new CompendiumAPI(this, `${id}API`);
  }
}
