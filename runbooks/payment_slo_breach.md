# Runbook: Payment Success Rate SLO Breach

Alert: PaymentSuccessRate < 99.95% (rolling minute window)
Severity: P1 (on-call page)
Owner: Payments / Platform

## Symptoms

- CloudWatch alarm for `PaymentSuccessRate` is firing.
- Dashboard shows PaymentSuccessRate falling below 99.95%.
- Error budget burn rising.

## Quick checks (first 5 minutes)

1. Check Dashboard for time window and recent trend. Note when rate began to drop.
2. Open CloudWatch Logs for `/uitgo/payment-service` and search for `on_error` logs or 5xx responses.
3. Search X-Ray for traces with errors or high latency for `/payments` (filter by time range).
4. Check synthetic runner results (if deployed) to see whether failures are reproducible.
5. Check downstream dependencies (payment gateway, DB) metrics and recent deployment events.

## Likely causes

- External payment gateway partial outage or rate-limiting.
- Recent deployment introduced a bug in payment flow.
- Resource exhaustion (e.g. DB connections) causing internal error responses.
- Transient network errors increasing timeouts.

## Mitigations (ordered)

1. If gateway errors: check gateway status page; if widespread, open incident with provider and consider routing to fallback gateway.
2. If recent deployment (<30m): rollback to previous known-good release.
3. Increase retries/backoff or circuit-breaker thresholds temporarily to reduce error rate.
4. Scale up payment-service replicas or underlying database/connection pool.
5. If database errors are present: check RDS/DBCPU, slow queries and enable read-replicas or failover.

## Escalation

- If unable to restore within 15 minutes, escalate to Platform Lead and engage Payment Provider support.

## Post-incident

- Produce incident timeline and root cause analysis.
- Update SLOs if they were unrealistic or instrumenting was insufficient.
- Add additional metrics/traces/logs to prevent recurrence.
