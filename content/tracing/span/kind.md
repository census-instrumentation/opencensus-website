---
date: 2018-10-25T20:01:43-07:00
title: "SpanKind"
weight: 20
aliases: [/core-concepts/tracing/span/kind]
---

- [SpanKind](#spanKind)
- [Source code example](#source-code-example)
- [References](#references)

### SpanKind

SpanKind details the relationships between spans in addition to the parent/child relationship.
SpanKind is enumerated by the following values:

Type|Value|Meaning
---|---|---
SERVER|1|The span covers the server-side handling of an RPC
CLIENT|2|The span covers the client-side handling of an RPC
UNSPECIFIED|0|Unspecified

For example, given two spans that share the same name and traceID, if a trace starts
on the client and then progresses to the server for continuity, their Kind
can be set as `CLIENT` and `SERVER` respectively

### Source code example

{{<tabs Go Java Python CplusPlus NodeJS>}}
{{<highlight go>}}
// Started on the client
ctx, cSpan := trace.StartSpan(ctx, "SpanStarted", trace.WithSpanKind(trace.SpanKindClient))

// Received from the server
ctx, sSpan := trace.StartSpan(ctx, "SpanStarted", trace.WithSpanKind(trace.SpanKindServer))
{{</highlight>}}

{{<highlight java>}}
import io.opencensus.common.Scope;
import io.opencensus.trace.Span.Kind;

// Started on the client
try (Scope ss = TRACER.spanBuilder("SpanStarted").setSpanKind(Kind.CLIENT).startSpan()) {
}

// Started on the server
try (Scope ss = TRACER.spanBuilder("SpanStarted").setSpanKind(Kind.SERVER).startSpan()) {
}
{{</highlight>}}

{{<highlight python>}}
from opencensus.trace.span import SpanKind

// Started on the client
with tracer.span("SpanStarted", span_kind=SpanKind.CLIENT) as span:
    pass

// Started on the server
with tracer.span("SpanStarted", span_kind=SpanKind.SERVER) as span:
    pass
{{</highlight>}}

{{<highlight cpp>}}
// Not yet available as per
// https://github.com/census-instrumentation/opencensus-cpp/issues/231
{{</highlight>}}

{{<highlight js>}}
tracer.startRootSpan({name: 'SpanStarted', kind: 'SERVER'}, rootSpan => {
});

tracer.startRootSpan({name: 'SpanStarted', kind: 'CLIENT'}, rootSpan => {
});
{{</highlight>}}
{{</tabs>}}

### References
Resource|URL
---|---
SpanKind proto|[proto/trace/v1.Span.SpanKind](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L88-L106)
Go API|[WithSpanKind option](https://godoc.org/go.opencensus.io/trace#WithSpanKind)
Java API|[Span.Kind JavaDoc](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/Span.Kind.html)
Python API|[span.SpanKind](https://github.com/census-instrumentation/opencensus-python/blob/fc42d70f0c9f423b22d0d6a55cc1ffb0e3e478c8/opencensus/trace/span.py#L29-L32)
Node.js API|[span.SpanKind](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/trace/model/types.ts#L73)
