---
date: 2018-10-27T16:03:20-07:00
title: "ParentSpanID"
weight: 4
aliases: [/core-concepts/tracing/span/parentspanid]
---

- [ParentSpanID](#parentspanid)
- [Relation to SpanID](#relation-to-spanid)
- [References](#references)

### ParentSpanID

ParentSpanID can either but NULL/empty or contain the 8 byte [SpanID](/tracing/span/spanid) of the span that caused
this span.

- A span without a ParentSpanID is called a "Root span"
- A span with a ParentSpanID is called a "Child span"
- Many spans can have the same ParentSpanID and they are all children of the parent
- A span can ONLY have one parent
- A child span can also be a parent of a span that it spawns

### References

Resource|URL
---|---
ParentSpanID in specs|[specs/Trace/Span.ParentTraceID](https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/Span.md#spanid)
ParentSpanID proto definition|[specs/Trace/Span.ParentSpanID](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L74-L76)
