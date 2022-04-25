resource "aws_dynamodb_table" "main" {
  name         = var.name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  tags = var.tags

  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "SK"
    range_key       = "PK"
    projection_type = "ALL"
  }
}
