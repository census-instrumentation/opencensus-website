---
date: 2018-10-25T20:01:43-07:00
title: "Link"
weight: 7
aliases: [/core-concepts/tracing/span/link]
---

#### Link

A link describes a cross-relationship between spans in either the same or different trace.
For example if a batch operation were performed, comprising of different traces or different
processes, a link from one span to another can help correlate related spans.

It consists of fields:

* TraceID
* SpanID
* Type which can either be `CHILD`, `PARENT` or `UNKNOWN`
* [Attributes](#attributes)


It is especially useful for linking spans that perhaps might cross trust boundaries. For example, if your API
client libraries in your customers' applications and the wild make calls to your cloud, you could choose to
create a span when the request hits your cloud's frontend server but not show it to the user. By linking
the user's span

#### Source code samples

{{% tabs Go Java Python Node %}}
```go
_, span := trace.StartSpan(context.Background(), "Span A")
spanContext := span.SpanContext()
span.End()

_, span := trace.StartSpan(context.Background(), "Linked to Span A")
span.AddLink(trace.Link{
  TraceID: spanContext.TraceID,
  SpanID:  spanContext.SpanID,
  Type:    trace.LinkTypeChild,
})
span.End()
```

```java
Scope s1 = tracer.spanBuilder("Span A").startScopedSpan();
SpanContext spanContext = tracer.getCurrentSpan().getContext();
s1.close();

Scope s2 = tracer.spanBuilder("Linked to Span A").startScopedSpan();
tracer.getCurrentSpan().addLink(
  Link.fromSpanContext(spanContext, Link.Type.CHILD_LINKED_SPAN));
s2.close();
```

```py
spanA = tracer.start_span(name='Span A')
tracer.end_span()

spanB = tracer.start_span(name='Linked to Span A')
spanB.add_link(Link(
  trace_id=spanA.context_tracer.trace_id,
  span_id=spanA.span_id
))
tracer.end_span()
```

```js
let traceId;
let spanId;

tracer.startRootSpan({name: 'Span A', samplingRate: 1.0}, rootSpan => {
  traceId = rootSpan.traceId;
  spanId = rootSpan.id;
  rootSpan.end();
});

tracer.startRootSpan({name: 'Linked to Span A', samplingRate: 1.0}, rootSpan => {
  rootSpan.addLink(traceId, spanId);
  rootSpan.end()
});
```

{{% /tabs %}}
