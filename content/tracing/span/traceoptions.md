---
date: 2018-10-25T20:01:43-07:00
title: "TraceOptions"
weight: 20
aliases: [/core-concepts/tracing/span/traceoptions]
---

### TraceOptions
TraceOptions is a byte on each OpenCensus span. Currently its last bit is set iff
the span is sampled otherwise it is clear. Perhaps this table might help clarify better

State in hex|State in binary|Meaning
---|---|---
0x00|00000000|Span IS NOT sampled
0x01|00000001|Span IS sampled

### References

Resource|URL
---|---
TraceOptions in the OpenCensus specs|https://github.com/census-instrumentation/opencensus-specs/blob/master/trace/Span.md#traceoptions
