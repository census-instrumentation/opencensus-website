---
date: 2018-10-25T20:01:43-07:00
title: "Time events"
weight: 6
aliases: [/core-concepts/tracing/span/time_events]
---

### Time event

It describes an event that happened at a point in time during a span's lifetime.
A time event can consist of EITHER of these fields but NOT BOTH
{{% children %}}

#### Time events
Time events are a collection of time event values but also retains information about the number of dropped
annotations as well as number of dropped time events

Succinctly, time events contain these fields:

* A collection of [Time events](#time-event)
* Number of dropped [annotations](/tracing/span/time_events/annotation/)
* Number of dropped [message events](/tracing/span/time_events/message_event/)

### References

Resource|URL
---|---
Data model reference|[proto/trace/v1/trace.proto#TimeEvents](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L141-L213)
