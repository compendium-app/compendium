import { DynamoAttributeValue } from "../shared-types";
export declare enum DynamoMethod {
    GET = "Get",
    PUT = "Put",
    DELETE = "Delete",
    UPDATE = "Update",
    QUERY = "Query",
    EXECUTE_STATEMENT = "ExecuteStatement"
}
export declare function getDynamoResourceArn(method: DynamoMethod): string;
export declare function getDynamoExecuteStatementArn(): string;
export declare function transformAttributeValueMap(attrMap?: {
    [key: string]: DynamoAttributeValue;
}): any;
export declare function validateJsonPath(value: string): void;
