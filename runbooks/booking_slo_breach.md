# Runbook: Booking Success Rate SLO Breach

Alert: BookingSuccessRate < 99.90% (rolling 30d window)
Severity: P1 (on-call page)
Owner: Trip Service / Platform

## Symptoms

- CloudWatch alarm for `BookingSuccessRate` is firing.
- Dashboard shows BookingSuccessRate falling below 99.90%.
- Error budget burn rising rapidly.

## Quick checks (first 5 minutes)

1. Check Dashboard SLI graph — when did rate start to drop?
2. Open CloudWatch Logs `/uitgo/trip-service` and search for `on_error` or HTTP 5xx.
3. Check X-Ray traces for `/trips` POST endpoints (filter by error).
4. Verify synthetic booking test is also failing (run `.\synthetic-booking-test.ps1`).
5. Check downstream dependencies: driver-service, payment-service, user-service status.

## Likely causes

- Driver matching service (driver-service) is down or returning errors.
- Payment service failing to estimate or process prices.
- User verification service (verifyUser) is failing.
- Database connectivity issues (trip model can't persist).
- Recent deployment introduced a bug in booking flow.

## Mitigations (ordered)

1. Check status of driver-service and payment-service — are they returning errors?
   - Query X-Ray traces or logs for those services.
2. If recent deployment (<30m): rollback to previous known-good release.
3. Circuit breaker: temporarily disable user verification to see if that's the blocker.
4. Scale up trip-service replicas if CPU/memory is saturated.
5. If database errors: check DB connection pool, query performance, failover if needed.
6. Increase retry counts/backoff for downstream calls.

## Escalation

- If unable to restore within 15 minutes, escalate to Platform Lead.
- Engage driver-service and payment-service owners for joint investigation.
- Open incident and post in war room (Slack/teams).

## Post-incident

- Timeline: when did error rate start, what changed?
- Root cause: which service failed, why?
- Remediation: code fix, config change, scaling, etc.
- Prevention: add alerting for driver-service/payment-service health, improve e2e tests.
