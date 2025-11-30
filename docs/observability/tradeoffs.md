# Observability Data Trade-offs: Logs vs Metrics vs Traces

This note summarizes the trade-offs and recommended usage when designing an observability platform.

Metrics

- Pros: Lightweight, low cardinality, ideal for alerting and SLO evaluation. Fast to aggregate and query.
- Cons: Lack request-level context; cannot reconstruct causal chains.
- Recommendation: Use metrics (EMF -> CloudWatch) for SLIs and alerts. Keep cardinality low (avoid user_id tags). Use percentiles for latency (p95/p99).

Traces

- Pros: Provide causal paths across microservices, show per-span timings and annotations. Excellent for root-cause analysis.
- Cons: Storage cost and sampling concerns. High-cardinality spans or excessive sampling can be expensive.
- Recommendation: Use OpenTelemetry + AWS X-Ray. Apply error-biased sampling (capture most error traces, sample normal traces). Ensure trace headers are propagated between services.

Logs

- Pros: Full fidelity, rich context, necessary for deep-dive forensic debugging.
- Cons: High volume and cost; slow to aggregate at scale if unstructured.
- Recommendation: Emit structured JSON logs (pino/winston) with requestId and traceId to correlate with traces/metrics. Use log retention policies and filters; use Logs Insights for ad-hoc queries.

Overall pattern

1. Alerts & SLO enforcement: Metrics (low-cost, fast). Keep SLOs measured by metric math.
2. Triage: Traces (X-Ray) to follow the request path and identify slow components.
3. Root-cause & forensics: Logs with traceId/requestId correlation.

Controls & cost management

- Sampling: Use error-biased sampling for traces; keep trace retention reasonable.
- Cardinality: Avoid high-cardinality metric labels; use coarse buckets where helpful.
- Retention: Configure log retention per environment and per log group.

Final recommendation

- Use metrics for alerting and SLOs, traces for triage, and logs for root-cause. Provide clear instrumentation patterns, and automate warm-up and health synthetic checks to keep SLOs measurable.
