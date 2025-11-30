provider "aws" {
  region = var.region
}

# Log groups for each service
resource "aws_cloudwatch_log_group" "payment_service" {
  name              = "/uitgo/payment-service"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "trip_service" {
  name              = "/uitgo/trip-service"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "user_service" {
  name              = "/uitgo/user-service"
  retention_in_days = var.log_retention_days
}

# SNS topic for alerts
resource "aws_sns_topic" "observability_alerts" {
  name = "${var.project}-observability-alerts"
}

# Simple IAM policy to allow X-Ray segments and telemetry (for services to attach)
resource "aws_iam_policy" "xray_put_policy" {
  name   = "${var.project}-xray-put"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "xray:PutTraceSegments",
          "xray:PutTelemetryRecords",
          "xray:PutInsightEvents"
        ],
        Resource = "*"
      }
    ]
  })
}

# Dashboard body loaded from file
resource "aws_cloudwatch_dashboard" "slo_dashboard" {
  dashboard_name = "${var.project}-SLO-Dashboard"
  dashboard_body = file("${path.module}/dashboard.json")
}

# Metric alarm: Payment success rate (metric math: m1 / m2)
resource "aws_cloudwatch_metric_alarm" "payment_success_rate_alarm" {
  alarm_name          = "${var.project}-PaymentSuccessRate-Alarm"
  alarm_description   = "Trigger when Payment success rate falls below the SLO threshold"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  threshold           = 0.9995
  treat_missing_data  = "ignore"

  metric_query {
    id = "m1"

    metric {
      namespace = "UITGo/SLI"
      metric_name = "PaymentSuccessCount"
      period = 60
      stat = "Sum"
    }
  }

  metric_query {
    id = "m2"

    metric {
      namespace = "UITGo/SLI"
      metric_name = "PaymentAttemptCount"
      period = 60
      stat = "Sum"
    }
  }

  metric_query {
    id = "e1"
    expression = "IF(m2 == 0, 1, m1 / m2)"
    label = "PaymentSuccessRate"
    return_data = true
  }

  alarm_actions = [aws_sns_topic.observability_alerts.arn]
}

# Example alarm for match latency (p95)
resource "aws_cloudwatch_metric_alarm" "match_p95_latency_alarm" {
  alarm_name          = "${var.project}-Match-p95-Alarm"
  alarm_description   = "Trigger when match API p95 latency exceeds threshold"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = var.match_p95_threshold_ms
  treat_missing_data  = "ignore"

  metric_query {
    id = "m1"
    metric {
      namespace = "UITGo/SLI"
      metric_name = "MatchLatencyMs"
      period = 60
      stat = "p95"
    }
  }

  metric_query {
    id = "e1"
    expression = "m1"
    label = "MatchP95"
    return_data = true
  }

  alarm_actions = [aws_sns_topic.observability_alerts.arn]
}

# Booking success rate alarm
resource "aws_cloudwatch_metric_alarm" "booking_success_rate_alarm" {
  alarm_name          = "${var.project}-BookingSuccessRate-Alarm"
  alarm_description   = "Trigger when Booking success rate falls below the SLO threshold"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  threshold           = 0.999
  treat_missing_data  = "ignore"

  metric_query {
    id = "m1"
    metric {
      namespace  = "UITGo/SLI"
      metric_name = "BookingSuccessCount"
      period     = 60
      stat       = "Sum"
    }
  }

  metric_query {
    id = "m2"
    metric {
      namespace  = "UITGo/SLI"
      metric_name = "BookingAttemptCount"
      period     = 60
      stat       = "Sum"
    }
  }

  metric_query {
    id          = "e1"
    expression  = "IF(m2 == 0, 1, m1 / m2)"
    label       = "BookingSuccessRate"
    return_data = true
  }

  alarm_actions = [aws_sns_topic.observability_alerts.arn]
}

# Auth/login success rate alarm
resource "aws_cloudwatch_metric_alarm" "auth_success_rate_alarm" {
  alarm_name          = "${var.project}-AuthSuccessRate-Alarm"
  alarm_description   = "Trigger when Auth success rate falls below the SLO threshold"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  threshold           = 0.99
  treat_missing_data  = "ignore"

  metric_query {
    id = "m1"
    metric {
      namespace  = "UITGo/SLI"
      metric_name = "LoginSuccessCount"
      period     = 60
      stat       = "Sum"
    }
  }

  metric_query {
    id = "m2"
    metric {
      namespace  = "UITGo/SLI"
      metric_name = "LoginAttemptCount"
      period     = 60
      stat       = "Sum"
    }
  }

  metric_query {
    id          = "e1"
    expression  = "IF(m2 == 0, 1, m1 / m2)"
    label       = "AuthSuccessRate"
    return_data = true
  }

  alarm_actions = [aws_sns_topic.observability_alerts.arn]
}

# Login p95 latency alarm
resource "aws_cloudwatch_metric_alarm" "login_p95_latency_alarm" {
  alarm_name          = "${var.project}-Login-p95-Alarm"
  alarm_description   = "Trigger when login p95 latency exceeds threshold"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  threshold           = 400
  treat_missing_data  = "ignore"

  metric_query {
    id = "m1"
    metric {
      namespace  = "UITGo/SLI"
      metric_name = "LoginDurationMs"
      period     = 60
      stat       = "p95"
    }
  }

  metric_query {
    id          = "e1"
    expression  = "m1"
    label       = "LoginP95"
    return_data = true
  }

  alarm_actions = [aws_sns_topic.observability_alerts.arn]
}
