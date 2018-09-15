---
title: "Tracing"
weight: 20
---


- [Introduction](#introduction)
- [Span](#span)
    - [Name](#name)
    - [Status](#status)
    - [Annotations](#annotations)
    - [Message event](#message-event)
    - [Attributes](#attributes)
    - [Link](#link)
    - [SpanKind](#spankind)
    - [Time events](#time-events)
    - [Tracestate](#tracestate)
- [Sampling](#sampling)
- [References](#references)

### Introduction

Tracing tracks the progression of a single user request
as it is handled by other services that make up an application.

Each unit work is called a [span](#span) in a [trace](#trace). Spans include metadata about the work,
including the time spent in the step (latency), status, time events, attributes, links.
You can use tracing to debug errors and
latency issues of your application.

### Span

A trace is a tree of spans.

A span is the unit work represented in a trace. A span may
represent a HTTP request, an RPC, a server handler,
a database query or a section customly marked in user code.

For example:

![A trace](/img/trace-trace.png)

Above, you see a trace with various spans. In order to respond
to `/messages`, several other internal requests are made. Firstly,
we check if the user is authenticated. Next we check if their
messages were cached. Since their message wasn't cached, that's
a cache miss and we then fetch their content from MySQL, cache it
and then provide the response containing their messages.

A span may or may not have a parent span:

* A span without a parent is called a **"root span"** for example span "/messages"
* A span with a parent is called a **"child span"** for example spans "auth", "cache.Get", "mysql.Query", "cache.Put"

Spans are identified with a SpanID and each span belongs to a single trace.
Each trace is uniquely identified by a TraceID which all constituent spans will share.

These identifiers and options byte together are called **Span Context**.
Inside the same process, **Span context** is propagated in a context
object. When crossing process boundaries, it is serialized into
protocol headers. The receiving end can read the **Span context** and create child spans.


#### Name

Span names are symbolic of the what span does. Span names should
be statistically meaningful. Most tracing backend and analysis
tools use span names to auto generate reports for the
represented work.

Examples of span names:

* "cache.Get" represents the Get method of the cache service.
* "/messages" represents the messages web page.
* "/api/user/(\\d+)" represents the user detail pages.

#### Status

Status represents the current state of the span.
It is represented by a canonical status code which maps onto a
predefined set of error values and an optional string message.

Status allows tracing visualization tools to highlight
unsuccessful spans and helps tracing users to debug errors.

![A trace with an error span](/img/trace-errorspan.png)

Above, you can see `cache.Put` errored the request violated the preset key size limit.
As a result of this error,  `/messages` request responded with an error to the user.

#### Annotations

Annotations are timestamped strings with optional attributes.
Annotations are used like log lines, but centric to the span.
Annotations contain a "Description" which help tell the story of the event that occured.

Example annotations include:

* 0.001s Evaluating database failover rules.
* 0.002s Failover replica selected. attributes:`{replica:ab_001 zone:"xy"}`
* 0.006s Response received.
* 0.007s Response requires additional lookups. attributes:`{fanout:4}`

Annotations provide rich details to debug problems in the scope of a span.

#### Attributes

Attributes are additional information that is included in the
span which can represent arbitrary data assigned by the user.
They are key value pairs with the key being a string and the
value being either a string, boolean, or integer.  

Examples of attributes:

* {http_code: 200}
* {zone: "us-central2"}
* {container_id: "replica04ed"}

Attributes can be used to query the tracing data and allow
users to filter large volume tracing data. For example, you can
filter the traces by HTTP status code or availability zone by
using the example attributes above.

#### Message event

Message event describes a message sent/received between spans.
It consists of fields:

* Type, which is an enumeration of `SENT`, `RECEIVED` or `UNSPECIFIED`
* Id
* Uncompressed size, in bytes
* Compressed size, in bytes
* Value, which can either be an [Annotation](#annotation) or another [Message Event](#message-event)

#### Link

A link describes a cross-relationship between spans in either the same or different trace.
For example if a batch operation were performed, comprising of different traces or different
processes, a link from one span to another can help correlate related spans.

It consists of fields:

* TraceID
* SpanID
* Type which can either be `CHILD`, `PARENT` or `UNKNOWN`
* [Attributes](#attributes)

#### SpanKind

SpanKind details the relationships between spans in addition to the parent/child relationship.
SpanKind is enumerated by the following values:

* `SERVER`
* `CLIENT`
* `UNKNOWN`

For example given two spans that share the same name and traceID, if a trace starts
on the client and then progresses to the server for continuity, their `SpanKind`-s
can be set as `CLIENT` and `SERVER` respectively

#### Time events
Time events consist of time-stamped annotations on a span, which could either be
user supplied key-value pairs or [Message Events](#message-event) sent between spans.
A time event consists of a description and the various [attribues](#attribute), for example:

Description: "Cache hit"

Attributes:

    - driver: "memcached"
    - authenticated: false
    - timeout_ms: 97

#### Tracestate
Tracestate conveys information about the position/ordering of a request in multiple distributed tracing graphs.
It consists of a list of at most 32 ordered [Tracestate entries](#tracestate-entry).

##### Tracestate entry
A tracestate entry is a key-value pair used to annotate a positional state. It consists of:

* Key: a collection of characters that MUST begin with a lower case letter, can contain lowercase alphanumeric, dashes, asteriks and forward slashes 
* Value: a collection of printable ASCII characters

### Sampling

Trace data is often very large in size and is expensive to collect.
This is why rather than collecting traces for every request, downsampling
is prefered. By default, OpenCensus provides a probabilistic sampler that
will trace once in every 10,000 requests.

You can set a custom probablistic sampler, prefer to always sample or
not sample at all.
There are two ways to set samplers:

* **Global sampler**: Global sampler is the global default.
* **Span sampler**: When starting a new span, a custom
  sampler can be provided. If no custom sampling is
  provided, the global sampler is used. Span samplers are
  useful if you want to over-sample some sections of your
  code. For example, a low throughput background service
  may use a higher sampling rate than a high-load RPC
  server.

### Exporting

Recorded spans will be reported by the registered exporters.

Multiple exporters can be registered to upload the data to
various different backends. Users can unregister the exporters
if they are no longer needed.

Please visit the page [exporters](/core-concepts/exporters) to learn more about exporters.

### References

Resource|URL
---|---
OpenCensus specification|https://github.com/census-instrumentation/opencensus-specs
OpenCensus Proto definitions|https://github.com/census-instrumentation/opencensus-proto
