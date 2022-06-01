resource "aws_s3_bucket" "ui" {
  bucket = "${var.name}-ui"
  tags   = var.tags
}

resource "aws_s3_bucket_acl" "ui" {
  bucket = aws_s3_bucket.ui.id
  acl    = "public-read"
}
