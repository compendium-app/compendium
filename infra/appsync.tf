resource "aws_appsync_graphql_api" "main" {
  name                = var.name
  authentication_type = "AWS_IAM"
  xray_enabled        = true

  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.main.arn
    field_log_level          = "ALL"
  }

  schema = <<EOF
type NodeVersion {
  id: ID!
  name: String!
  version: String!
  dependencies: [Dependency!]!
  dependants: [Dependant!]!
}
type Dependency {
  dependencyId: ID!
  dependantVersion: String!
  nodeVersions: [NodeVersion!]!
}
type Dependant {
  dependantId: ID!
  dependantVersion: String!
  nodeVersions: [NodeVersion!]!
}
input NodeInput {
  id: ID!
  name: String!
  dependencies: [ID!]!
}

type Execution {
  executionArn: String!
}

type Query {
  nodeVersions(id: ID!): [NodeVersion!]!
}
type Mutation {
  putNodes(nodes: [NodeInput!]!): Execution!
}
  EOF
}

