resource "aws_appsync_datasource" "dynamo" {
  api_id           = aws_appsync_graphql_api.main.id
  name             = "AppSyncDynamoDBExecution"
  service_role_arn = aws_iam_role.main.arn
  type             = "AMAZON_DYNAMODB"

  dynamodb_config {
    table_name = aws_dynamodb_table.main.name
  }
}

# resource "aws_appsync_datasource" "sfn-start-sync-execution" {
#   api_id           = aws_appsync_graphql_api.main.id
#   name             = "AppSyncSFNStartSyncExecution"
#   service_role_arn = aws_iam_role.main.arn
#   type             = "AWS_LAMBDA"

#   lambda_config {
#     function_arn = module.sfn-start-sync-execution.function_arn
#   }
# }

resource "aws_cloudformation_stack" "sfn-data-source" {
  name          = "CompendiumAppSyncSFNDataSource"
  template_body = <<STACK
Resources:
  StepFunctionsHttpDataSource:
      Type: AWS::AppSync::DataSource
      Properties:
        ApiId: ${aws_appsync_graphql_api.main.id}
        Name: CompendiumAppSyncSFNDataSource
        Type: HTTP
        # IAM role defined elsewhere in AWS CloudFormation template
        ServiceRoleArn: ${aws_iam_role.main.arn}
        HttpConfig:
          Endpoint: !Sub https://states.$${AWS::Region}.amazonaws.com/
          AuthorizationConfig:
            AuthorizationType: AWS_IAM
            AwsIamConfig:
              SigningRegion: !Ref AWS::Region
              SigningServiceName: states
Outputs:
  name: 
    Value: CompendiumAppSyncSFNDataSource
STACK

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_cloudformation_stack" "sfn-sync-data-source" {
  name          = "AppSyncSFNSyncDataSource"
  template_body = <<STACK
Resources:
  StepFunctionsHttpDataSource:
      Type: AWS::AppSync::DataSource
      Properties:
        ApiId: ${aws_appsync_graphql_api.main.id}
        Name: AppSyncSFNSyncDataSource
        Type: HTTP
        # IAM role defined elsewhere in AWS CloudFormation template
        ServiceRoleArn: ${aws_iam_role.main.arn}
        HttpConfig:
          Endpoint: !Sub https://sync-states.$${AWS::Region}.amazonaws.com/
          AuthorizationConfig:
            AuthorizationType: AWS_IAM
            AwsIamConfig:
              SigningRegion: !Ref AWS::Region
              SigningServiceName: states
Outputs:
  name: 
    Value: AppSyncSFNSyncDataSource
STACK

  lifecycle {
    create_before_destroy = true
  }
}
