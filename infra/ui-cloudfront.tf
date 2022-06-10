locals {
  s3_origin_id = "ui-bucket"
}

resource "aws_cloudfront_distribution" "ui" {
  origin {
    domain_name = aws_s3_bucket.ui.bucket_regional_domain_name
    origin_id   = local.s3_origin_id
  }

  tags = var.tags

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Compendium UI"
  default_root_object = "index.html"

  # logging_config {
  #   include_cookies = false
  #   bucket          = "mylogs.s3.amazonaws.com"
  #   prefix          = "myprefix"
  # }

  aliases = [var.ui_domain_name]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # tags = {
  #   Environment = "production"
  # }

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}
