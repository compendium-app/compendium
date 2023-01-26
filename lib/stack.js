"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompendiumStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const api_1 = require("./api");
class CompendiumStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        new api_1.CompendiumAPI(this, `${id}API`, {});
    }
}
exports.CompendiumStack = CompendiumStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw2Q0FBb0M7QUFFcEMsK0JBQXNDO0FBSXRDLE1BQWEsZUFBZ0IsU0FBUSxtQkFBSztJQUN4QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXVCO1FBQy9ELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLElBQUksbUJBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0Y7QUFORCwwQ0FNQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgU3RhY2tQcm9wcyB9IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgU3RhY2sgfSBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB0eXBlIHsgQ29uc3RydWN0IH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcbmltcG9ydCB7IENvbXBlbmRpdW1BUEkgfSBmcm9tIFwiLi9hcGlcIjtcblxudHlwZSBFS1NBcHBTdGFja1Byb3BzID0gU3RhY2tQcm9wcztcblxuZXhwb3J0IGNsYXNzIENvbXBlbmRpdW1TdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IEVLU0FwcFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIG5ldyBDb21wZW5kaXVtQVBJKHRoaXMsIGAke2lkfUFQSWAsIHt9KTtcbiAgfVxufVxuIl19