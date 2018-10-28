---
date: 2018-10-25T20:01:43-07:00
title: "Probabilistic"
weight: 3
aliases: [/core-concepts/tracing/sampling/probabilistic]
---

### Probabilistic sampler

The probabilistic sampler probabilistically returns True or False for whether a span should be sampled depending on the results of a coin flip.

By default, the probabilistic sampling rate is 1 in 10,000

### Code samples
{{<tabs Go Java CplusPlus>}}
{{<highlight go>}}
import "go.opencensus.io/trace"

theSampler = trace.ProbabilitySampler(1/1000.0);
{{</highlight>}}

{{<highlight java>}}
Samplers.probabilitySampler(1/1000.0);
{{</highlight>}}

{{<highlight cpp>}}
// Samplers are potentially expensive to construct. Use one long-lived
// sampler instead of constructing one for every Span.
static opencensus::trace::ProbabilitySampler sampler(1/1000.0);
{{</highlight>}}
{{</tabs>}}

### Reference
Resource|URL
---|---
Probability sampler in specs|https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/Sampling.md#what-kind-of-samplers-does-opencensus-support
Go ProbabilitySample|[trace.ProbabilitySampler](https://godoc.org/go.opencensus.io/trace#ProbabilitySampler)
Java ProbabilitySampler|[trace.ProbabilitySampler](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/samplers/Samplers.html#probabilitySampler--)
C++ ProbabilitySampler|[trace.ProbabilitySampler](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/sampler.h#L53)
