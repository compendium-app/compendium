resource "aws_appsync_graphql_api" "main" {
  name                = var.name
  authentication_type = "AWS_IAM"
  xray_enabled        = true

  tags = var.tags

  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.main.arn
    field_log_level          = "ALL"
  }

  schema = <<EOF
type Node {
  id: ID!
  name: String!
  metadata: NodeMetadata
  version: String!
  dependencies(limit: Int = 100): [Dependency!]!
  dependants(limit: Int = 100): [Dependant!]!
}
type NodeMetadata {
  description: String
  links: [NodeMetadataLink!]
}
type NodeMetadataLink {
  url: String!
  name: String
}
type Dependency {
  dependencyId: ID!
  dependantVersion: String!
  node: Node
}
type Dependant {
  dependantId: ID!
  dependantVersion: String!
  node: Node
}
input NodeInput {
  id: ID!
  name: String!
  metadata: NodeMetadataInput
  dependencies: [ID!]!
}
input NodeMetadataInput {
  description: String
  links: [NodeMetadataLinkInput!]
}
input NodeMetadataLinkInput {
  url: String!
  name: String
}

type Execution {
  executionArn: String!
}

type Query {
  node(id: ID!): Node
  recentNodes(limit: Int = 10): [Node!]!
}
type Mutation {
  putNodes(nodes: [NodeInput!]!): Execution!
}
  EOF
}

