---
date: 2018-11-02T14:48:22-07:00
title: "RateLimiting"
weight: 4
aliases: [/core-concepts/tracing/sampling/ratelimiting]
---

### RateLimiting sampler
This sampler tries to sample with a rate per time window, which by default is 0.1 traces/second.
When applied to a child Span of a sampled parent Span, the child Span keeps the sampling decision.

### Implementation details

RateLimiting sampling aims to solves some problems:

1. Getting QPS based sampling
2. Providing real sampling probabilities
3. Minimal overhead

To achieve rate-limiting, the time that we last made a QPS based sampling decision is stored in an atomic variable.
The elapsed time `Z` since we last made a probabilistic decision is also noted. We then use a probability function
`P(Z)` such that we get the desired sampling QPS. We always want `P(Z)` to be very cheap to compute.

Thus if X is the desired QPS, Z is the elapsed time in seconds, since the last sampling decision, then
```go
P(Z) = min(Z * X, 1)
```

### References
Resource|URL
---|---
RateLimiting sampler in the specs|[specs/trace/Sampling.RateLimiting](https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/Sampling.md#ratelimiting-sampler-implementation-details)
