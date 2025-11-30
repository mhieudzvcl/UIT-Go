# Observability Terraform (starter)

This folder contains a small Terraform starter to provision CloudWatch resources for the UIT-Go project.

What it creates

- CloudWatch Log Groups for payment-service, trip-service, and user-service
- A CloudWatch Dashboard skeleton (`<project>-SLO-Dashboard`)
- An SNS topic for alert notifications
- A minimal IAM policy allowing X-Ray PutTraceSegments (attach to service roles as needed)
- Example CloudWatch Alarms for Payment Success Rate and Match p95 latency

How to use

1. Ensure you have `terraform` installed and AWS credentials configured (e.g. `aws configure`).

2. From PowerShell (Windows):

```powershell
cd infra\observability
terraform init
terraform plan
terraform apply
```

3. After apply, note the outputs: dashboard name, SNS topic ARN, X-Ray policy ARN. Subscribe an endpoint (email/Slack/PagerDuty) to the SNS topic to receive alerts.

Notes and limitations

- This is a starter. You may need to adapt metric names/dimensions to match what your services emit.
- `aws_iam_policy.xray_put_policy` is created as a convenience; attach it to the ECS/EC2 role your services use.
- Some AWS Educate accounts limit IAM or SNS creation. If you lack permissions, export these files and ask an admin to apply them.
