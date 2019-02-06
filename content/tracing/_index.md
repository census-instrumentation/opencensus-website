---
title: "Tracing"
weight: 3
aliases: [/core-concepts/tracing]
---

- [Tracing](#tracing)
- [Trace](#trace)
- [References](#references)

### Tracing

Tracing tracks the progression of a single user request
as it is handled by other services that make up an application.

Each unit work is called a [Span](/tracing/span) in a [trace](#trace). Spans include metadata about the work,
including the time spent in the step (latency), status, time events, attributes, links.
You can use tracing to debug errors and latency issues in your applications.

### Trace

A trace is a tree of [spans](/tracing/span). It is a collective of observable signals showing the path of work through a system.
A trace on its own is distinguishable by a unique 16 byte sequence called a `TraceID`.

This `TraceID` groups and distinguishes [spans](/tracing/span). We'll learn about spans shortly.

This is an example of what a trace looks like:

![A trace](/img/trace-trace.png)

Above, you see a trace with various spans. In order to respond
to `/messages`, several other internal requests are made. Firstly,
we check if the user is authenticated. Next we check if their
messages were cached. Since their message wasn't cached, that's
a cache miss and we then fetch their content from MySQL, cache it
and then provide the response containing their messages.

### Exporting

Recorded spans can be exported by registered exporters.

Multiple exporters can be registered to upload the data to
various different backends. Users can unregister the exporters
if they are no longer needed.

Please visit the page [exporters](/exporters) to learn more about exporters.

### References

Resource|URL
---|---
Trace specs|[specs/Trace](https://github.com/census-instrumentation/opencensus-specs/tree/master/trace)
Trace proto definition|[proto/Trace/v1](https://github.com/census-instrumentation/opencensus-proto/tree/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1)
