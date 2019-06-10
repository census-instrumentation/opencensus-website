---
date: 2018-10-25T20:01:43-07:00
title: "Always"
weight: 1
aliases: [/core-concepts/tracing/sampling/always]
---

### Always sampler
The Always sampler always returns a decision of True for any sampling decision

### Code samples
{{<tabs Go Java Python CplusPlus NodeJS>}}
{{<highlight go>}}
import "go.opencensus.io/trace"

_ = trace.AlwaysSample()
{{</highlight>}}

{{<highlight java>}}
Samplers.alwaysSample();
{{</highlight>}}

{{<highlight python>}}
from opencensus.trace.samplers import always_on
from opencensus.trace import tracer as tracer_module

# This is the default sampler
sampler = always_on.AlwaysOnSampler()
tracer = tracer_module.Tracer(sampler=sampler)
{{</highlight>}}

{{<highlight cpp>}}
// Samplers are potentially expensive to construct. Use one long-lived
// sampler instead of constructing one for every Span.
static opencensus::trace::AlwaysSampler sampler;
{{</highlight>}}

{{<highlight js>}}
const root = new RootSpan(tracer);
const sampler = SamplerBuilder.getSampler(1); // Always samples when value is >= 1
const samplerShouldSample = sampler.shouldSample(root.traceId);
{{</highlight>}}
{{</tabs>}}

### Reference
Resource|URL
---|---
Go AlwaysSample|[trace.AlwaysSample](https://godoc.org/go.opencensus.io/trace#AlwaysSample)
Python samplers|[trace.samplers](https://github.com/census-instrumentation/opencensus-python/blob/master/opencensus/trace/samplers/always_on.py)
Java AlwaysSample|[trace.AlwaysSample](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/samplers/Samplers.html#alwaysSample--)
C++ AlwaysSample|[trace.AlwaysSample](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/sampler.h#L69)
Node.js TracerConfig|[trace.TracerConfig](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/trace/config/types.ts#L35)
