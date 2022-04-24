locals {
  ui_path = "./ui"
}

resource "aws_s3_bucket" "ui" {
  bucket = "${var.name}-ui"
}

resource "aws_s3_bucket_acl" "ui" {
  bucket = aws_s3_bucket.ui.id
  acl    = "public-read"
}

resource "null_resource" "ui_build" {
  triggers = {
    dir_sha1                         = sha1(join("", [for f in fileset("${local.ui_path}/src", "**/*") : filesha1("${local.ui_path}/src/${f}")]))
    REACT_APP_COMPENDIUM_GRAPHQL_URL = aws_appsync_domain_name.main.domain_name
    REACT_APP_AWS_ACCESS_KEY_ID      = aws_iam_access_key.ui.id
    REACT_APP_AWS_SECRET_ACCESS_KEY  = aws_iam_access_key.ui.secret
  }

  provisioner "local-exec" {
    command = "cd ${local.ui_path} && npm run build"
    environment = {
      REACT_APP_COMPENDIUM_GRAPHQL_URL = "https://${aws_appsync_domain_name.main.domain_name}/graphql"
      REACT_APP_AWS_ACCESS_KEY_ID      = aws_iam_access_key.ui.id
      REACT_APP_AWS_SECRET_ACCESS_KEY  = aws_iam_access_key.ui.secret
    }
  }
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

  depends_on = [
    null_resource.ui_build
  ]
}
