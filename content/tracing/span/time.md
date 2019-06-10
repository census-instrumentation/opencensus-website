---
date: 2018-11-01T01:13:43-07:00
title: "StartTime/EndTime"
weight: 5
aliases: [/core-concepts/tracing/span/time]
---

- [StartTime](#starttime)
- [EndTime](#endtime)
- [Latency](#latency)
- [Visual](#visual)
- [References](#references)

### StartTime
StartTime is a timestamp that records when the span was started.

### EndTime
EndTime is a timestamp that records when the span's operation has been ended

### Latency
Latency is the difference between the [EndTime](#endtime) and [StartTime](#starttime)

### Span Lifetime

Span lifetime represents the process of recording the start and the end timestamps to the Span object:

1. The start time is recorded when the Span is created. A span is only alive iff its [StartTime](#starttime) has been recorded.
2. The end time needs to be recorded when the operation is ended. It is important that a span be ended after its tracking operation ends.

The life of a span during an RPC or HTTP request is discussed under [context propagation](/advanced-concepts/context-propagation).

### Visual
The visual below shows a span "Recv./players" whose StartTime was `2018-11-01 (01:28:03.165)` and

-   Latency = EndTime - StartTime = 1.188ms

![](/images/span-start_time-example.png)

### References
Resource|URL
---|---
StartTime proto|[proto/v1.Span.StartTime](https://github.com/census-instrumentation/opencensus-proto/blob/61f8bc77ecef4a3c820b3e3069f8345f8e9611c6/src/opencensus/proto/trace/v1/trace.proto#L108-L111)
EndTime proto|[proto/v1.Span.EndTime](https://github.com/census-instrumentation/opencensus-proto/blob/61f8bc77ecef4a3c820b3e3069f8345f8e9611c6/src/opencensus/proto/trace/v1/trace.proto#L113-L116)
