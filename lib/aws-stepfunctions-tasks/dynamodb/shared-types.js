"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoAttributeValue = exports.DynamoProjectionExpression = exports.DynamoReturnValues = exports.DynamoItemCollectionMetrics = exports.DynamoConsumedCapacity = void 0;
const utils_1 = require("./private/utils");
/**
 * Determines the level of detail about provisioned throughput consumption that is returned.
 */
var DynamoConsumedCapacity;
(function (DynamoConsumedCapacity) {
    /**
     * The response includes the aggregate ConsumedCapacity for the operation,
     * together with ConsumedCapacity for each table and secondary index that was accessed
     */
    DynamoConsumedCapacity["INDEXES"] = "INDEXES";
    /**
     * The response includes only the aggregate ConsumedCapacity for the operation.
     */
    DynamoConsumedCapacity["TOTAL"] = "TOTAL";
    /**
     * No ConsumedCapacity details are included in the response.
     */
    DynamoConsumedCapacity["NONE"] = "NONE";
})(DynamoConsumedCapacity = exports.DynamoConsumedCapacity || (exports.DynamoConsumedCapacity = {}));
/**
 * Determines whether item collection metrics are returned.
 */
var DynamoItemCollectionMetrics;
(function (DynamoItemCollectionMetrics) {
    /**
     * If set to SIZE, the response includes statistics about item collections,
     * if any, that were modified during the operation.
     */
    DynamoItemCollectionMetrics["SIZE"] = "SIZE";
    /**
     * If set to NONE, no statistics are returned.
     */
    DynamoItemCollectionMetrics["NONE"] = "NONE";
})(DynamoItemCollectionMetrics = exports.DynamoItemCollectionMetrics || (exports.DynamoItemCollectionMetrics = {}));
/**
 * Use ReturnValues if you want to get the item attributes as they appear before or after they are changed
 */
var DynamoReturnValues;
(function (DynamoReturnValues) {
    /**
     * Nothing is returned
     */
    DynamoReturnValues["NONE"] = "NONE";
    /**
     * Returns all of the attributes of the item
     */
    DynamoReturnValues["ALL_OLD"] = "ALL_OLD";
    /**
     * Returns only the updated attributes
     */
    DynamoReturnValues["UPDATED_OLD"] = "UPDATED_OLD";
    /**
     * Returns all of the attributes of the item
     */
    DynamoReturnValues["ALL_NEW"] = "ALL_NEW";
    /**
     * Returns only the updated attributes
     */
    DynamoReturnValues["UPDATED_NEW"] = "UPDATED_NEW";
})(DynamoReturnValues = exports.DynamoReturnValues || (exports.DynamoReturnValues = {}));
/**
 * Class to generate projection expression
 */
class DynamoProjectionExpression {
    constructor() {
        this.expression = [];
    }
    /**
     * Adds the passed attribute to the chain
     *
     * @param attr Attribute name
     */
    withAttribute(attr) {
        if (this.expression.length) {
            this.expression.push(`.${attr}`);
        }
        else {
            this.expression.push(attr);
        }
        return this;
    }
    /**
     * Adds the array literal access for passed index
     *
     * @param index array index
     */
    atIndex(index) {
        if (!this.expression.length) {
            throw new Error("Expression must start with an attribute");
        }
        this.expression.push(`[${index}]`);
        return this;
    }
    /**
     * converts and return the string expression
     */
    toString() {
        return this.expression.join("");
    }
}
exports.DynamoProjectionExpression = DynamoProjectionExpression;
/**
 * Represents the data for an attribute.
 * Each attribute value is described as a name-value pair.
 * The name is the data type, and the value is the data itself.
 *
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_AttributeValue.html
 */
class DynamoAttributeValue {
    constructor(value) {
        this.attributeValue = value;
    }
    /**
     * Sets an attribute of type String. For example:  "S": "Hello"
     * Strings may be literal values or as JsonPath. Example values:
     *
     * - `DynamoAttributeValue.fromString('someValue')`
     * - `DynamoAttributeValue.fromString(JsonPath.stringAt('$.bar'))`
     */
    static fromString(value) {
        return new DynamoAttributeValue({ S: value });
    }
    /**
     * Sets a literal number. For example: 1234
     * Numbers are sent across the network to DynamoDB as strings,
     * to maximize compatibility across languages and libraries.
     * However, DynamoDB treats them as number type attributes for mathematical operations.
     */
    static fromNumber(value) {
        return new DynamoAttributeValue({ N: value.toString() });
    }
    /**
     * Sets an attribute of type Number. For example:  "N": "123.45"
     * Numbers are sent across the network to DynamoDB as strings,
     * to maximize compatibility across languages and libraries.
     * However, DynamoDB treats them as number type attributes for mathematical operations.
     *
     * Numbers may be expressed as literal strings or as JsonPath
     */
    static numberFromString(value) {
        return new DynamoAttributeValue({ N: value.toString() });
    }
    /**
     * Sets an attribute of type Binary. For example:  "B": "dGhpcyB0ZXh0IGlzIGJhc2U2NC1lbmNvZGVk"
     *
     * @param value base-64 encoded string
     */
    static fromBinary(value) {
        return new DynamoAttributeValue({ B: value });
    }
    /**
     * Sets an attribute of type String Set. For example:  "SS": ["Giraffe", "Hippo" ,"Zebra"]
     */
    static fromStringSet(value) {
        return new DynamoAttributeValue({ SS: value });
    }
    /**
     * Sets an attribute of type Number Set. For example:  "NS": ["42.2", "-19", "7.5", "3.14"]
     * Numbers are sent across the network to DynamoDB as strings,
     * to maximize compatibility across languages and libraries.
     * However, DynamoDB treats them as number type attributes for mathematical operations.
     */
    static fromNumberSet(value) {
        return new DynamoAttributeValue({ NS: value.map(String) });
    }
    /**
     * Sets an attribute of type Number Set. For example:  "NS": ["42.2", "-19", "7.5", "3.14"]
     * Numbers are sent across the network to DynamoDB as strings,
     * to maximize compatibility across languages and libraries.
     * However, DynamoDB treats them as number type attributes for mathematical operations.
     *
     * Numbers may be expressed as literal strings or as JsonPath
     */
    static numberSetFromStrings(value) {
        return new DynamoAttributeValue({ NS: value });
    }
    /**
     * Sets an attribute of type Binary Set. For example:  "BS": ["U3Vubnk=", "UmFpbnk=", "U25vd3k="]
     */
    static fromBinarySet(value) {
        return new DynamoAttributeValue({ BS: value });
    }
    /**
     * Sets an attribute of type Map. For example:  "M": {"Name": {"S": "Joe"}, "Age": {"N": "35"}}
     */
    static fromMap(value) {
        return new DynamoAttributeValue({ M: (0, utils_1.transformAttributeValueMap)(value) });
    }
    /**
     * Sets an attribute of type Map. For example:  "M": {"Name": {"S": "Joe"}, "Age": {"N": "35"}}
     *
     * @param value Json path that specifies state input to be used
     */
    static mapFromJsonPath(value) {
        (0, utils_1.validateJsonPath)(value);
        return new DynamoAttributeValue({ "M.$": value });
    }
    /**
     * Sets an attribute of type List. For example:  "L": [ {"S": "Cookies"} , {"S": "Coffee"}, {"N", "3.14159"}]
     */
    static fromList(value) {
        return new DynamoAttributeValue({ L: value.map((val) => val.toObject()) });
    }
    /**
     * Sets an attribute of type List. For example:  "L": [ {"S": "Cookies"} , {"S": "Coffee"}, {"S", "Veggies"}]
     *
     * @param value Json path that specifies state input to be used
     */
    static listFromJsonPath(value) {
        (0, utils_1.validateJsonPath)(value);
        return new DynamoAttributeValue({ L: value });
    }
    /**
     * Sets an attribute of type Null. For example:  "NULL": true
     */
    static fromNull(value) {
        return new DynamoAttributeValue({ NULL: value });
    }
    /**
     * Sets an attribute of type Boolean. For example:  "BOOL": true
     */
    static fromBoolean(value) {
        return new DynamoAttributeValue({ BOOL: value });
    }
    /**
     * Sets an attribute of type Boolean from state input through Json path.
     * For example:  "BOOL": true
     *
     * @param value Json path that specifies state input to be used
     */
    static booleanFromJsonPath(value) {
        (0, utils_1.validateJsonPath)(value);
        return new DynamoAttributeValue({ BOOL: value.toString() });
    }
    /**
     * Returns the DynamoDB attribute value
     */
    toObject() {
        return this.attributeValue;
    }
}
exports.DynamoAttributeValue = DynamoAttributeValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLXR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2hhcmVkLXR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUErRTtBQUUvRTs7R0FFRztBQUNILElBQVksc0JBZ0JYO0FBaEJELFdBQVksc0JBQXNCO0lBQ2hDOzs7T0FHRztJQUNILDZDQUFtQixDQUFBO0lBRW5COztPQUVHO0lBQ0gseUNBQWUsQ0FBQTtJQUVmOztPQUVHO0lBQ0gsdUNBQWEsQ0FBQTtBQUNmLENBQUMsRUFoQlcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFnQmpDO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLDJCQVdYO0FBWEQsV0FBWSwyQkFBMkI7SUFDckM7OztPQUdHO0lBQ0gsNENBQWEsQ0FBQTtJQUViOztPQUVHO0lBQ0gsNENBQWEsQ0FBQTtBQUNmLENBQUMsRUFYVywyQkFBMkIsR0FBM0IsbUNBQTJCLEtBQTNCLG1DQUEyQixRQVd0QztBQUVEOztHQUVHO0FBQ0gsSUFBWSxrQkF5Qlg7QUF6QkQsV0FBWSxrQkFBa0I7SUFDNUI7O09BRUc7SUFDSCxtQ0FBYSxDQUFBO0lBRWI7O09BRUc7SUFDSCx5Q0FBbUIsQ0FBQTtJQUVuQjs7T0FFRztJQUNILGlEQUEyQixDQUFBO0lBRTNCOztPQUVHO0lBQ0gseUNBQW1CLENBQUE7SUFFbkI7O09BRUc7SUFDSCxpREFBMkIsQ0FBQTtBQUM3QixDQUFDLEVBekJXLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBeUI3QjtBQUVEOztHQUVHO0FBQ0gsTUFBYSwwQkFBMEI7SUFBdkM7UUFDVSxlQUFVLEdBQWEsRUFBRSxDQUFDO0lBb0NwQyxDQUFDO0lBbENDOzs7O09BSUc7SUFDSSxhQUFhLENBQUMsSUFBWTtRQUMvQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksSUFB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bHVlTWFwLCB2YWxpZGF0ZUpzb25QYXRoIH0gZnJvbSBcIi4vcHJpdmF0ZS91dGlsc1wiO1xuXG4vKipcbiAqIERldGVybWluZXMgdGhlIGxldmVsIG9mIGRldGFpbCBhYm91dCBwcm92aXNpb25lZCB0aHJvdWdocHV0IGNvbnN1bXB0aW9uIHRoYXQgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBlbnVtIER5bmFtb0NvbnN1bWVkQ2FwYWNpdHkge1xuICAvKipcbiAgICogVGhlIHJlc3BvbnNlIGluY2x1ZGVzIHRoZSBhZ2dyZWdhdGUgQ29uc3VtZWRDYXBhY2l0eSBmb3IgdGhlIG9wZXJhdGlvbixcbiAgICogdG9nZXRoZXIgd2l0aCBDb25zdW1lZENhcGFjaXR5IGZvciBlYWNoIHRhYmxlIGFuZCBzZWNvbmRhcnkgaW5kZXggdGhhdCB3YXMgYWNjZXNzZWRcbiAgICovXG4gIElOREVYRVMgPSBcIklOREVYRVNcIixcblxuICAvKipcbiAgICogVGhlIHJlc3BvbnNlIGluY2x1ZGVzIG9ubHkgdGhlIGFnZ3JlZ2F0ZSBDb25zdW1lZENhcGFjaXR5IGZvciB0aGUgb3BlcmF0aW9uLlxuICAgKi9cbiAgVE9UQUwgPSBcIlRPVEFMXCIsXG5cbiAgLyoqXG4gICAqIE5vIENvbnN1bWVkQ2FwYWNpdHkgZGV0YWlscyBhcmUgaW5jbHVkZWQgaW4gdGhlIHJlc3BvbnNlLlxuICAgKi9cbiAgTk9ORSA9IFwiTk9ORVwiLFxufVxuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciBpdGVtIGNvbGxlY3Rpb24gbWV0cmljcyBhcmUgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBlbnVtIER5bmFtb0l0ZW1Db2xsZWN0aW9uTWV0cmljcyB7XG4gIC8qKlxuICAgKiBJZiBzZXQgdG8gU0laRSwgdGhlIHJlc3BvbnNlIGluY2x1ZGVzIHN0YXRpc3RpY3MgYWJvdXQgaXRlbSBjb2xsZWN0aW9ucyxcbiAgICogaWYgYW55LCB0aGF0IHdlcmUgbW9kaWZpZWQgZHVyaW5nIHRoZSBvcGVyYXRpb24uXG4gICAqL1xuICBTSVpFID0gXCJTSVpFXCIsXG5cbiAgLyoqXG4gICAqIElmIHNldCB0byBOT05FLCBubyBzdGF0aXN0aWNzIGFyZSByZXR1cm5lZC5cbiAgICovXG4gIE5PTkUgPSBcIk5PTkVcIixcbn1cblxuLyoqXG4gKiBVc2UgUmV0dXJuVmFsdWVzIGlmIHlvdSB3YW50IHRvIGdldCB0aGUgaXRlbSBhdHRyaWJ1dGVzIGFzIHRoZXkgYXBwZWFyIGJlZm9yZSBvciBhZnRlciB0aGV5IGFyZSBjaGFuZ2VkXG4gKi9cbmV4cG9ydCBlbnVtIER5bmFtb1JldHVyblZhbHVlcyB7XG4gIC8qKlxuICAgKiBOb3RoaW5nIGlzIHJldHVybmVkXG4gICAqL1xuICBOT05FID0gXCJOT05FXCIsXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIG9mIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBpdGVtXG4gICAqL1xuICBBTExfT0xEID0gXCJBTExfT0xEXCIsXG5cbiAgLyoqXG4gICAqIFJldHVybnMgb25seSB0aGUgdXBkYXRlZCBhdHRyaWJ1dGVzXG4gICAqL1xuICBVUERBVEVEX09MRCA9IFwiVVBEQVRFRF9PTERcIixcblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgb2YgdGhlIGF0dHJpYnV0ZXMgb2YgdGhlIGl0ZW1cbiAgICovXG4gIEFMTF9ORVcgPSBcIkFMTF9ORVdcIixcblxuICAvKipcbiAgICogUmV0dXJucyBvbmx5IHRoZSB1cGRhdGVkIGF0dHJpYnV0ZXNcbiAgICovXG4gIFVQREFURURfTkVXID0gXCJVUERBVEVEX05FV1wiLFxufVxuXG4vKipcbiAqIENsYXNzIHRvIGdlbmVyYXRlIHByb2plY3Rpb24gZXhwcmVzc2lvblxuICovXG5leHBvcnQgY2xhc3MgRHluYW1vUHJvamVjdGlvbkV4cHJlc3Npb24ge1xuICBwcml2YXRlIGV4cHJlc3Npb246IHN0cmluZ1tdID0gW107XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIHBhc3NlZCBhdHRyaWJ1dGUgdG8gdGhlIGNoYWluXG4gICAqXG4gICAqIEBwYXJhbSBhdHRyIEF0dHJpYnV0ZSBuYW1lXG4gICAqL1xuICBwdWJsaWMgd2l0aEF0dHJpYnV0ZShhdHRyOiBzdHJpbmcpOiBEeW5hbW9Qcm9qZWN0aW9uRXhwcmVzc2lvbiB7XG4gICAgaWYgKHRoaXMuZXhwcmVzc2lvbi5sZW5ndGgpIHtcbiAgICAgIHRoaXMuZXhwcmVzc2lvbi5wdXNoKGAuJHthdHRyfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmV4cHJlc3Npb24ucHVzaChhdHRyKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgYXJyYXkgbGl0ZXJhbCBhY2Nlc3MgZm9yIHBhc3NlZCBpbmRleFxuICAgKlxuICAgKiBAcGFyYW0gaW5kZXggYXJyYXkgaW5kZXhcbiAgICovXG4gIHB1YmxpYyBhdEluZGV4KGluZGV4OiBudW1iZXIpOiBEeW5hbW9Qcm9qZWN0aW9uRXhwcmVzc2lvbiB7XG4gICAgaWYgKCF0aGlzLmV4cHJlc3Npb24ubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHByZXNzaW9uIG11c3Qgc3RhcnQgd2l0aCBhbiBhdHRyaWJ1dGVcIik7XG4gICAgfVxuXG4gICAgdGhpcy5leHByZXNzaW9uLnB1c2goYFske2luZGV4fV1gKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBjb252ZXJ0cyBhbmQgcmV0dXJuIHRoZSBzdHJpbmcgZXhwcmVzc2lvblxuICAgKi9cbiAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZXhwcmVzc2lvbi5qb2luKFwiXCIpO1xuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgZGF0YSBmb3IgYW4gYXR0cmlidXRlLlxuICogRWFjaCBhdHRyaWJ1dGUgdmFsdWUgaXMgZGVzY3JpYmVkIGFzIGEgbmFtZS12YWx1ZSBwYWlyLlxuICogVGhlIG5hbWUgaXMgdGhlIGRhdGEgdHlwZSwgYW5kIHRoZSB2YWx1ZSBpcyB0aGUgZGF0YSBpdHNlbGYuXG4gKlxuICogQHNlZSBodHRwczovL2RvY3MuYXdzLmFtYXpvbi5jb20vYW1hem9uZHluYW1vZGIvbGF0ZXN0L0FQSVJlZmVyZW5jZS9BUElfQXR0cmlidXRlVmFsdWUuaHRtbFxuICovXG5leHBvcnQgY2xhc3MgRHluYW1vQXR0cmlidXRlVmFsdWUge1xuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBTdHJpbmcuIEZvciBleGFtcGxlOiAgXCJTXCI6IFwiSGVsbG9cIlxuICAgKiBTdHJpbmdzIG1heSBiZSBsaXRlcmFsIHZhbHVlcyBvciBhcyBKc29uUGF0aC4gRXhhbXBsZSB2YWx1ZXM6XG4gICAqXG4gICAqIC0gYER5bmFtb0F0dHJpYnV0ZVZhbHVlLmZyb21TdHJpbmcoJ3NvbWVWYWx1ZScpYFxuICAgKiAtIGBEeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tU3RyaW5nKEpzb25QYXRoLnN0cmluZ0F0KCckLmJhcicpKWBcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IFM6IHZhbHVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBsaXRlcmFsIG51bWJlci4gRm9yIGV4YW1wbGU6IDEyMzRcbiAgICogTnVtYmVycyBhcmUgc2VudCBhY3Jvc3MgdGhlIG5ldHdvcmsgdG8gRHluYW1vREIgYXMgc3RyaW5ncyxcbiAgICogdG8gbWF4aW1pemUgY29tcGF0aWJpbGl0eSBhY3Jvc3MgbGFuZ3VhZ2VzIGFuZCBsaWJyYXJpZXMuXG4gICAqIEhvd2V2ZXIsIER5bmFtb0RCIHRyZWF0cyB0aGVtIGFzIG51bWJlciB0eXBlIGF0dHJpYnV0ZXMgZm9yIG1hdGhlbWF0aWNhbCBvcGVyYXRpb25zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tTnVtYmVyKHZhbHVlOiBudW1iZXIpIHtcbiAgICByZXR1cm4gbmV3IER5bmFtb0F0dHJpYnV0ZVZhbHVlKHsgTjogdmFsdWUudG9TdHJpbmcoKSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIE51bWJlci4gRm9yIGV4YW1wbGU6ICBcIk5cIjogXCIxMjMuNDVcIlxuICAgKiBOdW1iZXJzIGFyZSBzZW50IGFjcm9zcyB0aGUgbmV0d29yayB0byBEeW5hbW9EQiBhcyBzdHJpbmdzLFxuICAgKiB0byBtYXhpbWl6ZSBjb21wYXRpYmlsaXR5IGFjcm9zcyBsYW5ndWFnZXMgYW5kIGxpYnJhcmllcy5cbiAgICogSG93ZXZlciwgRHluYW1vREIgdHJlYXRzIHRoZW0gYXMgbnVtYmVyIHR5cGUgYXR0cmlidXRlcyBmb3IgbWF0aGVtYXRpY2FsIG9wZXJhdGlvbnMuXG4gICAqXG4gICAqIE51bWJlcnMgbWF5IGJlIGV4cHJlc3NlZCBhcyBsaXRlcmFsIHN0cmluZ3Mgb3IgYXMgSnNvblBhdGhcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbnVtYmVyRnJvbVN0cmluZyh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IE46IHZhbHVlLnRvU3RyaW5nKCkgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBCaW5hcnkuIEZvciBleGFtcGxlOiAgXCJCXCI6IFwiZEdocGN5QjBaWGgwSUdseklHSmhjMlUyTkMxbGJtTnZaR1ZrXCJcbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIGJhc2UtNjQgZW5jb2RlZCBzdHJpbmdcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUJpbmFyeSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IEI6IHZhbHVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYW4gYXR0cmlidXRlIG9mIHR5cGUgU3RyaW5nIFNldC4gRm9yIGV4YW1wbGU6ICBcIlNTXCI6IFtcIkdpcmFmZmVcIiwgXCJIaXBwb1wiICxcIlplYnJhXCJdXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmdTZXQodmFsdWU6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IFNTOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIE51bWJlciBTZXQuIEZvciBleGFtcGxlOiAgXCJOU1wiOiBbXCI0Mi4yXCIsIFwiLTE5XCIsIFwiNy41XCIsIFwiMy4xNFwiXVxuICAgKiBOdW1iZXJzIGFyZSBzZW50IGFjcm9zcyB0aGUgbmV0d29yayB0byBEeW5hbW9EQiBhcyBzdHJpbmdzLFxuICAgKiB0byBtYXhpbWl6ZSBjb21wYXRpYmlsaXR5IGFjcm9zcyBsYW5ndWFnZXMgYW5kIGxpYnJhcmllcy5cbiAgICogSG93ZXZlciwgRHluYW1vREIgdHJlYXRzIHRoZW0gYXMgbnVtYmVyIHR5cGUgYXR0cmlidXRlcyBmb3IgbWF0aGVtYXRpY2FsIG9wZXJhdGlvbnMuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21OdW1iZXJTZXQodmFsdWU6IG51bWJlcltdKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IE5TOiB2YWx1ZS5tYXAoU3RyaW5nKSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIE51bWJlciBTZXQuIEZvciBleGFtcGxlOiAgXCJOU1wiOiBbXCI0Mi4yXCIsIFwiLTE5XCIsIFwiNy41XCIsIFwiMy4xNFwiXVxuICAgKiBOdW1iZXJzIGFyZSBzZW50IGFjcm9zcyB0aGUgbmV0d29yayB0byBEeW5hbW9EQiBhcyBzdHJpbmdzLFxuICAgKiB0byBtYXhpbWl6ZSBjb21wYXRpYmlsaXR5IGFjcm9zcyBsYW5ndWFnZXMgYW5kIGxpYnJhcmllcy5cbiAgICogSG93ZXZlciwgRHluYW1vREIgdHJlYXRzIHRoZW0gYXMgbnVtYmVyIHR5cGUgYXR0cmlidXRlcyBmb3IgbWF0aGVtYXRpY2FsIG9wZXJhdGlvbnMuXG4gICAqXG4gICAqIE51bWJlcnMgbWF5IGJlIGV4cHJlc3NlZCBhcyBsaXRlcmFsIHN0cmluZ3Mgb3IgYXMgSnNvblBhdGhcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbnVtYmVyU2V0RnJvbVN0cmluZ3ModmFsdWU6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IE5TOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIEJpbmFyeSBTZXQuIEZvciBleGFtcGxlOiAgXCJCU1wiOiBbXCJVM1Z1Ym5rPVwiLCBcIlVtRnBibms9XCIsIFwiVTI1dmQzaz1cIl1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUJpbmFyeVNldCh2YWx1ZTogc3RyaW5nW10pIHtcbiAgICByZXR1cm4gbmV3IER5bmFtb0F0dHJpYnV0ZVZhbHVlKHsgQlM6IHZhbHVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYW4gYXR0cmlidXRlIG9mIHR5cGUgTWFwLiBGb3IgZXhhbXBsZTogIFwiTVwiOiB7XCJOYW1lXCI6IHtcIlNcIjogXCJKb2VcIn0sIFwiQWdlXCI6IHtcIk5cIjogXCIzNVwifX1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbU1hcCh2YWx1ZTogeyBba2V5OiBzdHJpbmddOiBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSB9KSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IE06IHRyYW5zZm9ybUF0dHJpYnV0ZVZhbHVlTWFwKHZhbHVlKSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIE1hcC4gRm9yIGV4YW1wbGU6ICBcIk1cIjoge1wiTmFtZVwiOiB7XCJTXCI6IFwiSm9lXCJ9LCBcIkFnZVwiOiB7XCJOXCI6IFwiMzVcIn19XG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBKc29uIHBhdGggdGhhdCBzcGVjaWZpZXMgc3RhdGUgaW5wdXQgdG8gYmUgdXNlZFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBtYXBGcm9tSnNvblBhdGgodmFsdWU6IHN0cmluZykge1xuICAgIHZhbGlkYXRlSnNvblBhdGgodmFsdWUpO1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBcIk0uJFwiOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIExpc3QuIEZvciBleGFtcGxlOiAgXCJMXCI6IFsge1wiU1wiOiBcIkNvb2tpZXNcIn0gLCB7XCJTXCI6IFwiQ29mZmVlXCJ9LCB7XCJOXCIsIFwiMy4xNDE1OVwifV1cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUxpc3QodmFsdWU6IER5bmFtb0F0dHJpYnV0ZVZhbHVlW10pIHtcbiAgICByZXR1cm4gbmV3IER5bmFtb0F0dHJpYnV0ZVZhbHVlKHsgTDogdmFsdWUubWFwKCh2YWwpID0+IHZhbC50b09iamVjdCgpKSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIExpc3QuIEZvciBleGFtcGxlOiAgXCJMXCI6IFsge1wiU1wiOiBcIkNvb2tpZXNcIn0gLCB7XCJTXCI6IFwiQ29mZmVlXCJ9LCB7XCJTXCIsIFwiVmVnZ2llc1wifV1cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIEpzb24gcGF0aCB0aGF0IHNwZWNpZmllcyBzdGF0ZSBpbnB1dCB0byBiZSB1c2VkXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGxpc3RGcm9tSnNvblBhdGgodmFsdWU6IHN0cmluZykge1xuICAgIHZhbGlkYXRlSnNvblBhdGgodmFsdWUpO1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBMOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIE51bGwuIEZvciBleGFtcGxlOiAgXCJOVUxMXCI6IHRydWVcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbU51bGwodmFsdWU6IGJvb2xlYW4pIHtcbiAgICByZXR1cm4gbmV3IER5bmFtb0F0dHJpYnV0ZVZhbHVlKHsgTlVMTDogdmFsdWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBCb29sZWFuLiBGb3IgZXhhbXBsZTogIFwiQk9PTFwiOiB0cnVlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21Cb29sZWFuKHZhbHVlOiBib29sZWFuKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IEJPT0w6IHZhbHVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYW4gYXR0cmlidXRlIG9mIHR5cGUgQm9vbGVhbiBmcm9tIHN0YXRlIGlucHV0IHRocm91Z2ggSnNvbiBwYXRoLlxuICAgKiBGb3IgZXhhbXBsZTogIFwiQk9PTFwiOiB0cnVlXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBKc29uIHBhdGggdGhhdCBzcGVjaWZpZXMgc3RhdGUgaW5wdXQgdG8gYmUgdXNlZFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBib29sZWFuRnJvbUpzb25QYXRoKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YWxpZGF0ZUpzb25QYXRoKHZhbHVlKTtcbiAgICByZXR1cm4gbmV3IER5bmFtb0F0dHJpYnV0ZVZhbHVlKHsgQk9PTDogdmFsdWUudG9TdHJpbmcoKSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIHRoZSBkYXRhIGZvciB0aGUgYXR0cmlidXRlLiBEYXRhIGNhbiBiZVxuICAgKiBpLmUuIFwiU1wiOiBcIkhlbGxvXCJcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBhdHRyaWJ1dGVWYWx1ZTogYW55O1xuXG4gIHByaXZhdGUgY29uc3RydWN0b3IodmFsdWU6IGFueSkge1xuICAgIHRoaXMuYXR0cmlidXRlVmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBEeW5hbW9EQiBhdHRyaWJ1dGUgdmFsdWVcbiAgICovXG4gIHB1YmxpYyB0b09iamVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRyaWJ1dGVWYWx1ZTtcbiAgfVxufVxuIl19