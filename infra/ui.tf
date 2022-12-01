locals {
  ui_path = "${path.module}/../ui"
}

module "template_files" {
  source = "hashicorp/dir/template"

  base_dir = "${local.ui_path}/build"
}

resource "aws_s3_object" "dist" {
  for_each = module.template_files.files

  bucket       = aws_s3_bucket.ui.id
  key          = each.key
  acl          = "public-read"
  content_type = each.value.content_type

  # The template_files module guarantees that only one of these two attributes
  # will be set for each file, depending on whether it is an in-memory template
  # rendering result or a static file on disk.
  source  = each.value.source_path
  content = each.value.content

  # Unless the bucket has encryption enabled, the ETag of each object is an
  # MD5 hash of that object.
  etag = each.value.digests.md5
}

locals {
  envJSContent = <<EOF
window.ENV = {
  REACT_APP_COMPENDIUM_GRAPHQL_URL: "${var.override_graphql_url!=""?var.override_graphql_url:aws_appsync_graphql_api.main.uris["GRAPHQL"]}",
  REACT_APP_AWS_ACCESS_KEY_ID: "${aws_iam_access_key.ui.id}",
  REACT_APP_AWS_SECRET_ACCESS_KEY: "${aws_iam_access_key.ui.secret}"
}
  EOF
}
resource "aws_s3_object" "env-js" {
  bucket       = aws_s3_bucket.ui.id
  key          = "env.js"
  acl          = "public-read"
  content_type = "application/javascript"

  # The template_files module guarantees that only one of these two attributes
  # will be set for each file, depending on whether it is an in-memory template
  # rendering result or a static file on disk.
  content_base64 = base64encode(local.envJSContent)

  # Unless the bucket has encryption enabled, the ETag of each object is an
  # MD5 hash of that object.
  etag = md5(local.envJSContent)
}
