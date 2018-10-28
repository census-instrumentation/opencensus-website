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
