output "dashboard_name" {
  value = aws_cloudwatch_dashboard.slo_dashboard.dashboard_name
}

output "sns_topic_arn" {
  value = aws_sns_topic.observability_alerts.arn
}

output "xray_policy_arn" {
  value = aws_iam_policy.xray_put_policy.arn
}
