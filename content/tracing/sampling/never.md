---
date: 2018-10-25T20:01:43-07:00
title: "Never"
weight: 2
aliases: [/core-concepts/tracing/sampling/never]
---

### Never sampler
The Never sampler always returns a decision of False for any sampling decision

{{<tabs Go Java Python CplusPlus NodeJS>}}
{{<highlight go>}}
import "go.opencensus.io/trace"

_ = trace.NeverSample()
{{</highlight>}}

{{<highlight java>}}
Samplers.neverSample();
{{</highlight>}}

{{<highlight python>}}
from opencensus.trace.samplers import always_off
from opencensus.trace import tracer as tracer_module

sampler = always_off.AlwaysOffSampler()
tracer = tracer_module.Tracer(sampler=sampler)
{{</highlight>}}

{{<highlight cpp>}}
// Samplers are potentially expensive to construct. Use one long-lived
// sampler instead of constructing one for every Span.
static opencensus::trace::NeverSampler sampler;
{{</highlight>}}

{{<highlight js>}}
const root = new RootSpan(tracer);
const sampler = SamplerBuilder.getSampler(0); // Never samples when value is <= 0
const samplerShouldNotSample = sampler.shouldSample(root.traceId);
{{</highlight>}}
{{</tabs>}}

### Reference
Resource|URL
---|---
Go NeverSample|[trace.NeverSample](https://godoc.org/go.opencensus.io/trace#NeverSample)
Python samplers|[trace.samplers](https://github.com/census-instrumentation/opencensus-python/blob/master/opencensus/trace/samplers/always_off.py)
Java NeverSample|[trace.NeverSample](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/samplers/Samplers.html#neverSample--)
C++ NeverSample|[trace.NeverSample](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/sampler.h#L83)
Node.js TracerConfig|[trace.TracerConfig](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/trace/config/types.ts#L35)
