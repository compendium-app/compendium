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
    constructor(value) {
        this.attributeValue = value;
    }
    /**
     * Returns the DynamoDB attribute value
     */
    toObject() {
        return this.attributeValue;
    }
}
exports.DynamoAttributeValue = DynamoAttributeValue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhcmVkLXR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2hhcmVkLXR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUErRTtBQUUvRTs7R0FFRztBQUNILElBQVksc0JBZ0JYO0FBaEJELFdBQVksc0JBQXNCO0lBQ2hDOzs7T0FHRztJQUNILDZDQUFtQixDQUFBO0lBRW5COztPQUVHO0lBQ0gseUNBQWUsQ0FBQTtJQUVmOztPQUVHO0lBQ0gsdUNBQWEsQ0FBQTtBQUNmLENBQUMsRUFoQlcsc0JBQXNCLEdBQXRCLDhCQUFzQixLQUF0Qiw4QkFBc0IsUUFnQmpDO0FBRUQ7O0dBRUc7QUFDSCxJQUFZLDJCQVdYO0FBWEQsV0FBWSwyQkFBMkI7SUFDckM7OztPQUdHO0lBQ0gsNENBQWEsQ0FBQTtJQUViOztPQUVHO0lBQ0gsNENBQWEsQ0FBQTtBQUNmLENBQUMsRUFYVywyQkFBMkIsR0FBM0IsbUNBQTJCLEtBQTNCLG1DQUEyQixRQVd0QztBQUVEOztHQUVHO0FBQ0gsSUFBWSxrQkF5Qlg7QUF6QkQsV0FBWSxrQkFBa0I7SUFDNUI7O09BRUc7SUFDSCxtQ0FBYSxDQUFBO0lBRWI7O09BRUc7SUFDSCx5Q0FBbUIsQ0FBQTtJQUVuQjs7T0FFRztJQUNILGlEQUEyQixDQUFBO0lBRTNCOztPQUVHO0lBQ0gseUNBQW1CLENBQUE7SUFFbkI7O09BRUc7SUFDSCxpREFBMkIsQ0FBQTtBQUM3QixDQUFDLEVBekJXLGtCQUFrQixHQUFsQiwwQkFBa0IsS0FBbEIsMEJBQWtCLFFBeUI3QjtBQUVEOztHQUVHO0FBQ0gsTUFBYSwwQkFBMEI7SUFBdkM7UUFDVSxlQUFVLEdBQWEsRUFBRSxDQUFDO0lBb0NwQyxDQUFDO0lBbENDOzs7O09BSUc7SUFDSSxhQUFhLENBQUMsSUFBWTtRQUMvQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksSUFB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ZU1hcCwgdmFsaWRhdGVKc29uUGF0aCB9IGZyb20gXCIuL3ByaXZhdGUvdXRpbHNcIjtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBsZXZlbCBvZiBkZXRhaWwgYWJvdXQgcHJvdmlzaW9uZWQgdGhyb3VnaHB1dCBjb25zdW1wdGlvbiB0aGF0IGlzIHJldHVybmVkLlxuICovXG5leHBvcnQgZW51bSBEeW5hbW9Db25zdW1lZENhcGFjaXR5IHtcbiAgLyoqXG4gICAqIFRoZSByZXNwb25zZSBpbmNsdWRlcyB0aGUgYWdncmVnYXRlIENvbnN1bWVkQ2FwYWNpdHkgZm9yIHRoZSBvcGVyYXRpb24sXG4gICAqIHRvZ2V0aGVyIHdpdGggQ29uc3VtZWRDYXBhY2l0eSBmb3IgZWFjaCB0YWJsZSBhbmQgc2Vjb25kYXJ5IGluZGV4IHRoYXQgd2FzIGFjY2Vzc2VkXG4gICAqL1xuICBJTkRFWEVTID0gXCJJTkRFWEVTXCIsXG5cbiAgLyoqXG4gICAqIFRoZSByZXNwb25zZSBpbmNsdWRlcyBvbmx5IHRoZSBhZ2dyZWdhdGUgQ29uc3VtZWRDYXBhY2l0eSBmb3IgdGhlIG9wZXJhdGlvbi5cbiAgICovXG4gIFRPVEFMID0gXCJUT1RBTFwiLFxuXG4gIC8qKlxuICAgKiBObyBDb25zdW1lZENhcGFjaXR5IGRldGFpbHMgYXJlIGluY2x1ZGVkIGluIHRoZSByZXNwb25zZS5cbiAgICovXG4gIE5PTkUgPSBcIk5PTkVcIixcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgaXRlbSBjb2xsZWN0aW9uIG1ldHJpY3MgYXJlIHJldHVybmVkLlxuICovXG5leHBvcnQgZW51bSBEeW5hbW9JdGVtQ29sbGVjdGlvbk1ldHJpY3Mge1xuICAvKipcbiAgICogSWYgc2V0IHRvIFNJWkUsIHRoZSByZXNwb25zZSBpbmNsdWRlcyBzdGF0aXN0aWNzIGFib3V0IGl0ZW0gY29sbGVjdGlvbnMsXG4gICAqIGlmIGFueSwgdGhhdCB3ZXJlIG1vZGlmaWVkIGR1cmluZyB0aGUgb3BlcmF0aW9uLlxuICAgKi9cbiAgU0laRSA9IFwiU0laRVwiLFxuXG4gIC8qKlxuICAgKiBJZiBzZXQgdG8gTk9ORSwgbm8gc3RhdGlzdGljcyBhcmUgcmV0dXJuZWQuXG4gICAqL1xuICBOT05FID0gXCJOT05FXCIsXG59XG5cbi8qKlxuICogVXNlIFJldHVyblZhbHVlcyBpZiB5b3Ugd2FudCB0byBnZXQgdGhlIGl0ZW0gYXR0cmlidXRlcyBhcyB0aGV5IGFwcGVhciBiZWZvcmUgb3IgYWZ0ZXIgdGhleSBhcmUgY2hhbmdlZFxuICovXG5leHBvcnQgZW51bSBEeW5hbW9SZXR1cm5WYWx1ZXMge1xuICAvKipcbiAgICogTm90aGluZyBpcyByZXR1cm5lZFxuICAgKi9cbiAgTk9ORSA9IFwiTk9ORVwiLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCBvZiB0aGUgYXR0cmlidXRlcyBvZiB0aGUgaXRlbVxuICAgKi9cbiAgQUxMX09MRCA9IFwiQUxMX09MRFwiLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG9ubHkgdGhlIHVwZGF0ZWQgYXR0cmlidXRlc1xuICAgKi9cbiAgVVBEQVRFRF9PTEQgPSBcIlVQREFURURfT0xEXCIsXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYWxsIG9mIHRoZSBhdHRyaWJ1dGVzIG9mIHRoZSBpdGVtXG4gICAqL1xuICBBTExfTkVXID0gXCJBTExfTkVXXCIsXG5cbiAgLyoqXG4gICAqIFJldHVybnMgb25seSB0aGUgdXBkYXRlZCBhdHRyaWJ1dGVzXG4gICAqL1xuICBVUERBVEVEX05FVyA9IFwiVVBEQVRFRF9ORVdcIixcbn1cblxuLyoqXG4gKiBDbGFzcyB0byBnZW5lcmF0ZSBwcm9qZWN0aW9uIGV4cHJlc3Npb25cbiAqL1xuZXhwb3J0IGNsYXNzIER5bmFtb1Byb2plY3Rpb25FeHByZXNzaW9uIHtcbiAgcHJpdmF0ZSBleHByZXNzaW9uOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBwYXNzZWQgYXR0cmlidXRlIHRvIHRoZSBjaGFpblxuICAgKlxuICAgKiBAcGFyYW0gYXR0ciBBdHRyaWJ1dGUgbmFtZVxuICAgKi9cbiAgcHVibGljIHdpdGhBdHRyaWJ1dGUoYXR0cjogc3RyaW5nKTogRHluYW1vUHJvamVjdGlvbkV4cHJlc3Npb24ge1xuICAgIGlmICh0aGlzLmV4cHJlc3Npb24ubGVuZ3RoKSB7XG4gICAgICB0aGlzLmV4cHJlc3Npb24ucHVzaChgLiR7YXR0cn1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5leHByZXNzaW9uLnB1c2goYXR0cik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIGFycmF5IGxpdGVyYWwgYWNjZXNzIGZvciBwYXNzZWQgaW5kZXhcbiAgICpcbiAgICogQHBhcmFtIGluZGV4IGFycmF5IGluZGV4XG4gICAqL1xuICBwdWJsaWMgYXRJbmRleChpbmRleDogbnVtYmVyKTogRHluYW1vUHJvamVjdGlvbkV4cHJlc3Npb24ge1xuICAgIGlmICghdGhpcy5leHByZXNzaW9uLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwcmVzc2lvbiBtdXN0IHN0YXJ0IHdpdGggYW4gYXR0cmlidXRlXCIpO1xuICAgIH1cblxuICAgIHRoaXMuZXhwcmVzc2lvbi5wdXNoKGBbJHtpbmRleH1dYCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogY29udmVydHMgYW5kIHJldHVybiB0aGUgc3RyaW5nIGV4cHJlc3Npb25cbiAgICovXG4gIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmV4cHJlc3Npb24uam9pbihcIlwiKTtcbiAgfVxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGRhdGEgZm9yIGFuIGF0dHJpYnV0ZS5cbiAqIEVhY2ggYXR0cmlidXRlIHZhbHVlIGlzIGRlc2NyaWJlZCBhcyBhIG5hbWUtdmFsdWUgcGFpci5cbiAqIFRoZSBuYW1lIGlzIHRoZSBkYXRhIHR5cGUsIGFuZCB0aGUgdmFsdWUgaXMgdGhlIGRhdGEgaXRzZWxmLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9kb2NzLmF3cy5hbWF6b24uY29tL2FtYXpvbmR5bmFtb2RiL2xhdGVzdC9BUElSZWZlcmVuY2UvQVBJX0F0dHJpYnV0ZVZhbHVlLmh0bWxcbiAqL1xuZXhwb3J0IGNsYXNzIER5bmFtb0F0dHJpYnV0ZVZhbHVlIHtcbiAgLyoqXG4gICAqIFNldHMgYW4gYXR0cmlidXRlIG9mIHR5cGUgU3RyaW5nLiBGb3IgZXhhbXBsZTogIFwiU1wiOiBcIkhlbGxvXCJcbiAgICogU3RyaW5ncyBtYXkgYmUgbGl0ZXJhbCB2YWx1ZXMgb3IgYXMgSnNvblBhdGguIEV4YW1wbGUgdmFsdWVzOlxuICAgKlxuICAgKiAtIGBEeW5hbW9BdHRyaWJ1dGVWYWx1ZS5mcm9tU3RyaW5nKCdzb21lVmFsdWUnKWBcbiAgICogLSBgRHluYW1vQXR0cmlidXRlVmFsdWUuZnJvbVN0cmluZyhKc29uUGF0aC5zdHJpbmdBdCgnJC5iYXInKSlgXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBTOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgbGl0ZXJhbCBudW1iZXIuIEZvciBleGFtcGxlOiAxMjM0XG4gICAqIE51bWJlcnMgYXJlIHNlbnQgYWNyb3NzIHRoZSBuZXR3b3JrIHRvIER5bmFtb0RCIGFzIHN0cmluZ3MsXG4gICAqIHRvIG1heGltaXplIGNvbXBhdGliaWxpdHkgYWNyb3NzIGxhbmd1YWdlcyBhbmQgbGlicmFyaWVzLlxuICAgKiBIb3dldmVyLCBEeW5hbW9EQiB0cmVhdHMgdGhlbSBhcyBudW1iZXIgdHlwZSBhdHRyaWJ1dGVzIGZvciBtYXRoZW1hdGljYWwgb3BlcmF0aW9ucy5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbU51bWJlcih2YWx1ZTogbnVtYmVyKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IE46IHZhbHVlLnRvU3RyaW5nKCkgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBOdW1iZXIuIEZvciBleGFtcGxlOiAgXCJOXCI6IFwiMTIzLjQ1XCJcbiAgICogTnVtYmVycyBhcmUgc2VudCBhY3Jvc3MgdGhlIG5ldHdvcmsgdG8gRHluYW1vREIgYXMgc3RyaW5ncyxcbiAgICogdG8gbWF4aW1pemUgY29tcGF0aWJpbGl0eSBhY3Jvc3MgbGFuZ3VhZ2VzIGFuZCBsaWJyYXJpZXMuXG4gICAqIEhvd2V2ZXIsIER5bmFtb0RCIHRyZWF0cyB0aGVtIGFzIG51bWJlciB0eXBlIGF0dHJpYnV0ZXMgZm9yIG1hdGhlbWF0aWNhbCBvcGVyYXRpb25zLlxuICAgKlxuICAgKiBOdW1iZXJzIG1heSBiZSBleHByZXNzZWQgYXMgbGl0ZXJhbCBzdHJpbmdzIG9yIGFzIEpzb25QYXRoXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG51bWJlckZyb21TdHJpbmcodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBOOiB2YWx1ZS50b1N0cmluZygpIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYW4gYXR0cmlidXRlIG9mIHR5cGUgQmluYXJ5LiBGb3IgZXhhbXBsZTogIFwiQlwiOiBcImRHaHBjeUIwWlhoMElHbHpJR0poYzJVMk5DMWxibU52WkdWa1wiXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBiYXNlLTY0IGVuY29kZWQgc3RyaW5nXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21CaW5hcnkodmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBCOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIFN0cmluZyBTZXQuIEZvciBleGFtcGxlOiAgXCJTU1wiOiBbXCJHaXJhZmZlXCIsIFwiSGlwcG9cIiAsXCJaZWJyYVwiXVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nU2V0KHZhbHVlOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBTUzogdmFsdWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBOdW1iZXIgU2V0LiBGb3IgZXhhbXBsZTogIFwiTlNcIjogW1wiNDIuMlwiLCBcIi0xOVwiLCBcIjcuNVwiLCBcIjMuMTRcIl1cbiAgICogTnVtYmVycyBhcmUgc2VudCBhY3Jvc3MgdGhlIG5ldHdvcmsgdG8gRHluYW1vREIgYXMgc3RyaW5ncyxcbiAgICogdG8gbWF4aW1pemUgY29tcGF0aWJpbGl0eSBhY3Jvc3MgbGFuZ3VhZ2VzIGFuZCBsaWJyYXJpZXMuXG4gICAqIEhvd2V2ZXIsIER5bmFtb0RCIHRyZWF0cyB0aGVtIGFzIG51bWJlciB0eXBlIGF0dHJpYnV0ZXMgZm9yIG1hdGhlbWF0aWNhbCBvcGVyYXRpb25zLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tTnVtYmVyU2V0KHZhbHVlOiBudW1iZXJbXSkge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBOUzogdmFsdWUubWFwKFN0cmluZykgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBOdW1iZXIgU2V0LiBGb3IgZXhhbXBsZTogIFwiTlNcIjogW1wiNDIuMlwiLCBcIi0xOVwiLCBcIjcuNVwiLCBcIjMuMTRcIl1cbiAgICogTnVtYmVycyBhcmUgc2VudCBhY3Jvc3MgdGhlIG5ldHdvcmsgdG8gRHluYW1vREIgYXMgc3RyaW5ncyxcbiAgICogdG8gbWF4aW1pemUgY29tcGF0aWJpbGl0eSBhY3Jvc3MgbGFuZ3VhZ2VzIGFuZCBsaWJyYXJpZXMuXG4gICAqIEhvd2V2ZXIsIER5bmFtb0RCIHRyZWF0cyB0aGVtIGFzIG51bWJlciB0eXBlIGF0dHJpYnV0ZXMgZm9yIG1hdGhlbWF0aWNhbCBvcGVyYXRpb25zLlxuICAgKlxuICAgKiBOdW1iZXJzIG1heSBiZSBleHByZXNzZWQgYXMgbGl0ZXJhbCBzdHJpbmdzIG9yIGFzIEpzb25QYXRoXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG51bWJlclNldEZyb21TdHJpbmdzKHZhbHVlOiBzdHJpbmdbXSkge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBOUzogdmFsdWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBCaW5hcnkgU2V0LiBGb3IgZXhhbXBsZTogIFwiQlNcIjogW1wiVTNWdWJuaz1cIiwgXCJVbUZwYm5rPVwiLCBcIlUyNXZkM2s9XCJdXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21CaW5hcnlTZXQodmFsdWU6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IEJTOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIE1hcC4gRm9yIGV4YW1wbGU6ICBcIk1cIjoge1wiTmFtZVwiOiB7XCJTXCI6IFwiSm9lXCJ9LCBcIkFnZVwiOiB7XCJOXCI6IFwiMzVcIn19XG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21NYXAodmFsdWU6IHsgW2tleTogc3RyaW5nXTogRHluYW1vQXR0cmlidXRlVmFsdWUgfSkge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBNOiB0cmFuc2Zvcm1BdHRyaWJ1dGVWYWx1ZU1hcCh2YWx1ZSkgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBNYXAuIEZvciBleGFtcGxlOiAgXCJNXCI6IHtcIk5hbWVcIjoge1wiU1wiOiBcIkpvZVwifSwgXCJBZ2VcIjoge1wiTlwiOiBcIjM1XCJ9fVxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgSnNvbiBwYXRoIHRoYXQgc3BlY2lmaWVzIHN0YXRlIGlucHV0IHRvIGJlIHVzZWRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbWFwRnJvbUpzb25QYXRoKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YWxpZGF0ZUpzb25QYXRoKHZhbHVlKTtcbiAgICByZXR1cm4gbmV3IER5bmFtb0F0dHJpYnV0ZVZhbHVlKHsgXCJNLiRcIjogdmFsdWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBMaXN0LiBGb3IgZXhhbXBsZTogIFwiTFwiOiBbIHtcIlNcIjogXCJDb29raWVzXCJ9ICwge1wiU1wiOiBcIkNvZmZlZVwifSwge1wiTlwiLCBcIjMuMTQxNTlcIn1dXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21MaXN0KHZhbHVlOiBEeW5hbW9BdHRyaWJ1dGVWYWx1ZVtdKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IEw6IHZhbHVlLm1hcCgodmFsKSA9PiB2YWwudG9PYmplY3QoKSkgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBMaXN0LiBGb3IgZXhhbXBsZTogIFwiTFwiOiBbIHtcIlNcIjogXCJDb29raWVzXCJ9ICwge1wiU1wiOiBcIkNvZmZlZVwifSwge1wiU1wiLCBcIlZlZ2dpZXNcIn1dXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBKc29uIHBhdGggdGhhdCBzcGVjaWZpZXMgc3RhdGUgaW5wdXQgdG8gYmUgdXNlZFxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBsaXN0RnJvbUpzb25QYXRoKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB2YWxpZGF0ZUpzb25QYXRoKHZhbHVlKTtcbiAgICByZXR1cm4gbmV3IER5bmFtb0F0dHJpYnV0ZVZhbHVlKHsgTDogdmFsdWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb2YgdHlwZSBOdWxsLiBGb3IgZXhhbXBsZTogIFwiTlVMTFwiOiB0cnVlXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21OdWxsKHZhbHVlOiBib29sZWFuKSB7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IE5VTEw6IHZhbHVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYW4gYXR0cmlidXRlIG9mIHR5cGUgQm9vbGVhbi4gRm9yIGV4YW1wbGU6ICBcIkJPT0xcIjogdHJ1ZVxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBmcm9tQm9vbGVhbih2YWx1ZTogYm9vbGVhbikge1xuICAgIHJldHVybiBuZXcgRHluYW1vQXR0cmlidXRlVmFsdWUoeyBCT09MOiB2YWx1ZSB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvZiB0eXBlIEJvb2xlYW4gZnJvbSBzdGF0ZSBpbnB1dCB0aHJvdWdoIEpzb24gcGF0aC5cbiAgICogRm9yIGV4YW1wbGU6ICBcIkJPT0xcIjogdHJ1ZVxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgSnNvbiBwYXRoIHRoYXQgc3BlY2lmaWVzIHN0YXRlIGlucHV0IHRvIGJlIHVzZWRcbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgYm9vbGVhbkZyb21Kc29uUGF0aCh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdmFsaWRhdGVKc29uUGF0aCh2YWx1ZSk7XG4gICAgcmV0dXJuIG5ldyBEeW5hbW9BdHRyaWJ1dGVWYWx1ZSh7IEJPT0w6IHZhbHVlLnRvU3RyaW5nKCkgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgZGF0YSBmb3IgdGhlIGF0dHJpYnV0ZS4gRGF0YSBjYW4gYmVcbiAgICogaS5lLiBcIlNcIjogXCJIZWxsb1wiXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgYXR0cmlidXRlVmFsdWU6IGFueTtcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmF0dHJpYnV0ZVZhbHVlID0gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgRHluYW1vREIgYXR0cmlidXRlIHZhbHVlXG4gICAqL1xuICBwdWJsaWMgdG9PYmplY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuYXR0cmlidXRlVmFsdWU7XG4gIH1cbn1cbiJdfQ==