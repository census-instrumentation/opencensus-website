---
date: 2018-10-25T20:01:43-07:00
title: "Link"
weight: 7
aliases: [/core-concepts/tracing/span/link]
---

- [Link](#link)
- [Constituents](#constituents)
- [Uses and advisory](#uses-and-advisory)
- [Source code samples](#source-code-samples)
- [Visuals](#visuals)
- [References](#references)

#### Link

A link describes a cross-relationship between spans in either the same or different trace.
For example if a batch operation were performed, comprising of different traces or different
processes, a link from one span to another can help correlate related spans.

#### Constituents
It consists of fields:

* TraceID
* SpanID
* Type which can either be `CHILD`, `PARENT` or `UNKNOWN`
* [Attributes](#attributes)


#### Uses and advisory

* Linking spans is especially useful for RPCs that might cross trust boundaries. For example, if your API
client libraries in your customers' applications and in the wild make calls to your cloud, you could choose to
create a span when the request hits your cloud's frontend server but not show it to the user, or at least prevent
the trace from the wild from being the parent span to your internal spans

* Links can also be used in tracing streaming requests such as with [gRPC](/guides/grpc) where tracing
a long-lived request doesn't provide valuable insight but per-message streaming will provide
information about the latencies. On receiving a streamed message, you'll need to link the
trace that started this message

* Links can also be used in batching operations or with asynchronous processing whereby a single trace
spawned work that gets performed later. A link is important to help find the source of the trace that
started the long-lived operations

Please also take a look at [specs/utils.HandlingUntrustedRequests](https://github.com/census-instrumentation/opencensus-specs/blob/8600b7497457a277e681552005556407e9666997/utils/HandleUntrustedRequests.md#what-to-do-with-trace-headers-from-an-untrusted-request)


#### Source code samples

In these source code samples, we have two spans:

Name|Description
---|---
SpanA|Started from an untrusted boundary e.g. a client request to your cloud
SpanB|Started from a trusted boundary e.g. from the frontend server of your service/cloud

{{% tabs Go Java Python NodeJS %}}
```go
// SpanA started say on the client side
_, spanA := trace.StartSpan(context.Background(), "SpanA")
spanASC := spanA.SpanContext()

_, spanB := trace.StartSpan(context.Background(), "SpanB")
spanB.AddLink(trace.Link{
        TraceID: spanASC.TraceID,
        SpanID:  spanASC.SpanID,
        Type:    trace.LinkTypeChild,
        Attributes: map[string]interface{}{
                "reason": "client-RPC unverified source",
        },
})
```

```java
// SpanA started say on the client side
// SpanB started on the server side
Scope s1 = tracer.spanBuilder("SpanA").startScopedSpan();
SpanContext spanASC = tracer.getCurrentSpan().getContext();
s1.close();

Scope s2 = tracer.spanBuilder("SpanB").startScopedSpan();
Map<String, AttributeValue> linkAttributes = new HashMap<>();
linkAttributes.put("reason", AttributeValue.stringAttribute("client-RPC unverified source"));
tracer.getCurrentSpan().addLink(
  Link.fromSpanContext(spanASC, Link.Type.CHILD_LINKED_SPAN, linkAttributes));
s2.close();
```

```py
# SpanA started say on the client side
# SpanB started on the server side
spanA = tracer.start_span(name='SpanA')
tracer.end_span()

spanB = tracer.start_span(name='SpanB')
linkAttributes = attributes.Attributes(reason="client-RPC unverified source")
spanB.add_link(Link(
  trace_id=spanA.context_tracer.trace_id,
  span_id=spanA.span_id,
  attributes=linkAttributes
))
tracer.end_span()
```

```js
let spanATraceId;
let spanASpanId;

// SpanA started say on the client side
tracer.startRootSpan({name: 'SpanA', samplingRate: 1.0}, spanA => {
  spanATraceId = spanA.traceId;
  spanASpanId = spanA.id;
  // Do something with spanA
  spanA.end();
});

// SpanB started on the server side
tracer.startRootSpan({name: 'SpanB', samplingRate: 1.0}, spanB => {
  linkAttributes = {'reason': 'client-RPC unverified source'};
  spanB.addLink(spanATraceId, spanASpanId, linkAttributes);
  // Do something with spanB
  spanB.end()
});
```
{{% /tabs %}}

#### Visuals

When examined after being [exported](/exporters)
![](/img/span-link.png)

#### References

Resource|URL
---|---
Handling untrusted requests|[specs/utils.HandlingUntrustedRequests](https://github.com/census-instrumentation/opencensus-specs/blob/8600b7497457a277e681552005556407e9666997/utils/HandleUntrustedRequests.md)
Data model|[proto/trace/v1.Link](https://github.com/census-instrumentation/opencensus-proto/blob/b11a67434194733b34c11f206938263fa16ad1cf/src/opencensus/proto/trace/v1/trace.proto#L215-L259)
Go API reference|[Span.AddLink](https://godoc.org/go.opencensus.io/trace#Span.AddLink) and [Link](https://godoc.org/go.opencensus.io/trace#Link)
Java API reference|[Span.addLink](https://static.javadoc.io/io.opencensus/opencensus-api/0.17.0/io/opencensus/trace/Span.html#addLink-io.opencensus.trace.Link-) and [Link](https://static.javadoc.io/io.opencensus/opencensus-api/0.17.0/io/opencensus/trace/Link.html)
Python API reference|[Span.add_link](https://github.com/census-instrumentation/opencensus-python/blob/87a70bbc21a678d3e57ba85f1fd0ab1c76acbe57/opencensus/trace/span.py#L214) and [Link](https://github.com/census-instrumentation/opencensus-python/blob/87a70bbc21a678d3e57ba85f1fd0ab1c76acbe57/opencensus/trace/link.py#L31-L51)
Node.js API reference|[Span.addLink](https://github.com/census-instrumentation/opencensus-node/blob/59bd2161ceeb60ddb8861f38675f42409088021e/packages/opencensus-core/src/trace/model/types.ts#L191-L193) and [Link](https://github.com/census-instrumentation/opencensus-node/blob/c2764ae6c18a6ff3cefc9a9738ea53f4e7e5af07/packages/opencensus-exporter-ocagent/src/types/opencensus.ts#L159-L166)
