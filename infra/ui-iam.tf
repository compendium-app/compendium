resource "aws_iam_user" "ui" {
  name = "${var.name}-ui"
}
resource "aws_iam_access_key" "ui" {
  user = aws_iam_user.ui.name
}


resource "aws_iam_user_policy" "ui" {
  name = "${var.name}-ui"
  user = aws_iam_user.ui.name

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "appsync:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}
