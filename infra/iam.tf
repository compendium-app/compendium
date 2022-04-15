resource "aws_iam_role" "main" {
  name = "project-compendium-shared"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = [
            "states.amazonaws.com",
            "events.amazonaws.com",
            "lambda.amazonaws.com",
            "appsync.amazonaws.com"
          ]
        }
      },
    ]
  })
}
resource "aws_iam_role_policy" "main" {
  name = "project-compendium-shared"
  role = aws_iam_role.main.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogDelivery",
          "logs:GetLogDelivery",
          "logs:UpdateLogDelivery",
          "logs:DeleteLogDelivery",
          "logs:ListLogDeliveries",
          "logs:PutResourcePolicy",
          "logs:DescribeResourcePolicies",
          "logs:DescribeLogGroups"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "dynamodb:*",
        ],
        Resource = [
          aws_dynamodb_table.main.arn,
          "${aws_dynamodb_table.main.arn}/*"
        ]
      },
      {
        "Action" : [
          "states:*"
        ],
        "Effect" : "Allow",
        "Resource" : [
          "arn:aws:states:eu-central-1:${data.aws_caller_identity.current.account_id}:stateMachine:compendium-*",
          "arn:aws:states:eu-central-1:${data.aws_caller_identity.current.account_id}:execution:compendium-*:*"
        ]
      },
    ]
  })
}

data "aws_iam_policy" "lambda-basic-execution" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
resource "aws_iam_role_policy_attachment" "appsync-cloudwatch" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppSyncPushToCloudWatchLogs"
  role       = aws_iam_role.main.name
}
resource "aws_iam_role_policy_attachment" "lambda-basic-execution" {
  role       = aws_iam_role.main.name
  policy_arn = data.aws_iam_policy.lambda-basic-execution.arn
}
