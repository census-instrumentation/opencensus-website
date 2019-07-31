---
date: 2018-10-25T20:01:43-07:00
title: "Tracestate"
weight: 20
aliases: [/core-concepts/tracing/span/tracestate]
---

- [Tracestate](#tracestate)
- [Entry](#entry)

#### Tracestate
Tracestate conveys information about the position/ordering of a request in multiple distributed tracing graphs.
It consists of a list of at most 32 ordered [Tracestate entries](#entry).

##### Entry
A tracestate entry is a key-value pair used to annotate a positional state. It consists of:

Field|Description|Restrictions
---|---|---
Key|a collection of characters|MUST begin with a lower case letter, can contain lowercase alphanumeric, dashes, asterisk and forward slashes 
Value|a collection of characters|ONLY printable ASCII characters
