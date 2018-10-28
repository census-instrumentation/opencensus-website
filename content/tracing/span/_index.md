---
date: 2018-10-25T19:42:20-07:00
title: "Span"
weight: 1
aliases: [/core-concepts/tracing]
---

- [Span](#span)
- [References](#references)


### Span
A span represents a single operation in a trace. A span could be representative of an HTTP request,
a remote procedure call (RPC), a database query, or even the path that a code takes in user code, etc.

For example:

![A trace](/img/trace-trace.png)

Above, you can see a trace with various spans. In order to respond
to `/messages`, several other internal requests are made. Firstly,
we check if the user is authenticated. Next we check if their
messages were cached. Since their message wasn't cached, that's
a cache miss and we then fetch their content from MySQL, cache it
and then provide the response containing their messages.

A span may or may not have a parent span:

* A span without a parent is called a **"root span"** for example, span "/messages"
* A span with a parent is called a **"child span"** for example, spans "auth", "cache.Get", "mysql.Query", "cache.Put"

Spans are identified by a SpanID and each span belongs to a single trace.
Each trace is uniquely identified by a TraceID which all constituent spans will share.

These identifiers and options byte together are called **Span Context**.
Inside the same process, **Span context** is propagated in a context
object. When crossing process boundaries, it is serialized into
protocol headers. The receiving end can read the **Span context** and create child spans.

A span consists of the following fields:
{{% children %}}

### References

Resource|URL
---|---
Span specs|[specs/Tracing/Span](https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/Span.md#traceid)
Span proto definition|[proto/trace/v1/Span.proto](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L28-L300)
