---
date: 2018-10-25T20:01:43-07:00
title: "Sampling"
weight: 2
aliases: [/core-concepts/tracing/sampling]
---

- [Sampling](#sampling)
- [Samplers](#samplers)
    - [Global sampler](#global-sampler)
    - [Per span sampler](#per-span-sampler)
- [Rules](#rules)
- [References](#references)

### Sampling

Trace data is often produced in large volumes, it is not only expensive to collect
and store but also expensive to transmit.

In order to strike a balance between observability and expenses, traces are
sampled. Sampling is the process by which a decision is made on whether to
process/export a span or not.

### Samplers

OpenCensus provides these types of samplers
{{% children %}}

A sampler's decision affects [Span.TraceOptions' sampling bit](/tracing/span/traceoptions) by setting or clearing it if the sampler returns True or False respectively.

There are 2 ways of setting a sampler to use:

#### Global sampler

The global sampler is a sampler that's set via the global [TraceConfig](/tracing/traceconfig.md)

{{<tabs Go Java CplusPlus>}}
{{<highlight go>}}
package main

import "go.opencensus.io/trace"

func main() {
    // Having already created your sampler "theSampler"
    trace.ApplyConfig(trace.Config{DefaultSampler: theSampler})
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.tutorials.tracing.sampling;

import io.opencensus.trace.config.TraceConfig;

public class App {
    public static void main(String[] args) {
        // Get the global TraceConfig
        TraceConfig globalTraceConfig = Tracing.getTraceConfig();

        // Now update the global TraceConfig
        globalTraceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder.setSampler(theSampler));
    }
}
{{</highlight>}}

{{<highlight cpp>}}
#include "opencensus/trace/sampler.h"
#include "opencensus/trace/trace_config.h"
#include "opencensus/trace/trace_params.h"

int main(int argc, char** argv) {
    opencensus::trace::ProbabilitySampler theSampler(theProbability);
    const struct opencensus::trace::TraceParams globalConfig = {
        .sampler=theSampler,
    };
    opencensus::trace::TraceConfig::SetCurrentTraceParams(globalConfig);
}
{{</highlight>}}
{{</tabs>}}

#### <a name="per-span-sampler"></a> Per span sampler aka "Span scoped"

This sampler is set when starting a span, via the constructor

{{<tabs Go Java CplusPlus>}}
{{<highlight go>}}
import "go.opencensus.io/trace"

func doWork() {
    // Having already created your sampler "theSampler" and "ctx"
    ctx, span := trace.StartSpan(ctx, "DoWork", trace.WithSampler(theSampler))
}

{{</highlight>}}
{{<highlight java>}}
package io.opencensus.tutorials.tracing.sampling;

import io.opencensus.trace.common.Scope;

void doWork() {
    // Having already defined "theSampler" and "tracer"
    try (Scope ss = tracer.spanBuilder("DoWork").setSampler(theSampler).startScopedSpan()){
    }
}
{{</highlight>}}

{{<highlight cpp>}}
void doWork() {
    // Having already defined "theSampler"
    opencensus::trace::Span theSpan = \
            opencensus::trace::Span::StartSpan("DoWork", nullptr, {&theSampler});
}
{{</highlight>}}
{{</tabs>}}

### Rules

* A sampling decision from a ParentSpan is ALWAYS inherited by all its regardless of the trace configuration.
This ensures continuity of traces -- for example, if a parent were sampled but one of its children were not,
we'd then lose parts of the trace, and vice versa if the parent weren't sampled yet one of its children were,
we wouldn't know where the span began


#### References
Resource|URL
---|---
TraceConfig in specs|[specs/trace/TraceConfig](https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/TraceConfig.md)
Per-Span sampler in specs|[specs/trace/Sampling](https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/Sampling.md#how-can-users-control-the-sampler-that-is-used-for-sampling)
GoDoc: ApplyConfig|[trace.ApplyConfig](https://godoc.org/go.opencensus.io/trace#ApplyConfig)
JavaDoc: TraceConfig|[io.opencensus.trace.config.TraceConfig](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/config/TraceConfig.html)
C++: TraceConfig|[opencensus::trace::TraceConfig](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/trace_config.h)
