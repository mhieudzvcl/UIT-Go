# Runbook: Login Success Rate SLO Breach

Alert: LoginSuccessRate < 99.9% (rolling 7d window)
Severity: P1 (on-call page)
Owner: User Service / Auth Team

## Symptoms

- CloudWatch alarm for `LoginSuccessRate` is firing.
- Dashboard shows LoginSuccessRate falling below 99.9%.
- Users reporting login failures.

## Quick checks (first 5 minutes)

1. Check Dashboard SLI graph — when did failure rate spike?
2. Open CloudWatch Logs `/uitgo/user-service` and search for `on_error` or HTTP 5xx in login endpoint.
3. Check X-Ray traces for login/auth endpoints — look for latency spikes or errors.
4. Check downstream dependencies: user database (PostgreSQL), JWT signing service, session store (Redis if used).
5. Verify synthetic auth test is also failing (if you have one).

## Likely causes

- User database (PostgreSQL) is slow or offline.
- Password hashing/verification (bcrypt) is taking too long.
- JWT signing/validation service is failing.
- Session store (Redis) is full or unreachable.
- Recent deployment introduced a bug in auth logic.
- DDoS or brute-force attack causing rate limiting.

## Mitigations (ordered)

1. Check database health:
   - Is PostgreSQL responding? Check connection pool.
   - Query performance: are login queries slow? Check slow query logs.
   - If DB is down, failover to read-replica or restore from backup.
2. If recent deployment (<30m): rollback.
3. Check rate limiting or WAF rules — is there a DDoS?
4. Scale up user-service replicas if CPU/memory high.
5. If session store (Redis) is issue:
   - Clear old sessions or restart Redis.
   - Scale up cache cluster.
6. Increase JWT token TTL temporarily (reduces re-login frequency).

## Escalation

- If unable to restore within 10 minutes, page database team and auth owner.
- Check external dependencies (if using third-party auth provider).
- Open incident.

## Post-incident

- Timeline: when did failures start, was there a trigger?
- Root cause: database, code, infrastructure?
- Remediation: fix code, optimize queries, scale infrastructure.
- Prevention: add health checks for user-db, add circuit breaker for auth, load test login flow.
