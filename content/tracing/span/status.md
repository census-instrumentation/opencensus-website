---
date: 2018-10-25T20:01:43-07:00
title: "Status"
weight: 5
aliases: [/core-concepts/tracing/span/status]
---

- [Status](#status)
- [Status code mapping](#status-code-mapping)
- [Source code samples](#source-code-samples)
- [Visuals](#visuals)
- [References](#references)

### Status

Status defines a logical error model to represent a filterable state of the span at a point in time.

It consists of a code whose type is `int32` as well as the descriptive message.

Status allows tracing visualization tools to highlight unsuccessful spans and helps in debugging errors.

### Status code mapping
For a uniform mapping of status code in various RPC systems, we use the following enumerations
alongside description to describe the state of the system in span, as per:

State|Code|Description|HTTP status code equivalent
---|---|---|---
OK|0|Not an error, returned on success|200 and 2XX HTTP statuses
CANCELLED|1|The operation was cancelled, typically by the caller|499
UNKNOWN|2|An unknown error raised by APIs that don't return enough error information|500
INVALID_ARGUMENT|3|The client specified an invalid argument|400
DEADLINE_EXCEEDED|4|The deadline expired before the operation could succeed|504
NOT_FOUND|5|Content was not found or request was denied for an entire class of users|404
ALREADY_EXISTS|6|The entity attempted to be created already exists|409
PERMISSION_DENIED|7|The caller doesn't have permission to execute the specified operation|403
RESOURCE_EXHAUSTED|8|The resource has been exhausted e.g. per-user quota exhausted, file system out of space|429
FAILED_PRECONDITION|9|The client shouldn't retry until the system state has been explicitly handled|400
ABORTED|10|The operation was aborted|409
OUT_OF_RANGE|11|The operation was attempted past the valid range e.g. seeking past the end of a file|400
UNIMPLEMENTED|12|The operation is not implemented or is not supported/enabled for this operation|501
INTERNAL|13|Some invariants expected by the underlying system have been broken. This code is reserved for serious errors|500
UNAVAILABLE|14|The service is currently available e.g. as a transient condition|503
DATA_LOSS|15|Unrecoverable data loss or corruption|500
UNAUTHENTICATED|16|The requester doesn't have valid authentication credentials for the operation|401

### Source code samples

{{<tabs Go Java Python CplusPlus NodeJS>}}
{{<highlight go>}}
span.SetStatus(trace.Status{Code: int32(trace.StatusCodeNotFound), Message: "Cache miss"})
{{</highlight>}}

{{<highlight java>}}
span.setStatus(status.NOT_FOUND.withDescription("Cache miss"))
{{</highlight>}}

{{<highlight python>}}
span.status = Status(5, "Cache miss")
{{</highlight>}}

{{<highlight cpp>}}
span.SetStatus(StatusCode.NOT_FOUND, "Cache miss");
{{</highlight>}}

{{<highlight js>}}
// Not implemented at this time
{{</highlight>}}
{{</tabs>}}

### Visuals
* Not found on cache miss
![](/images/span-status-sample.png)

As you can see above, we set the status with a message of "Cache miss" and a code of `NOT_FOUND`

### References
Resource|URL
---|---
Status in OpenCensus datamodel|[proto/v1/Status](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L274-L285)
RPC code mappings|[Code enumerations rpc/code.proto](https://github.com/googleapis/googleapis/blob/caa431d9ddb71a29b14ff6bfa6ccd7c044cf9697/google/rpc/code.proto#L33-L186)
Go API|[Span.SetStatus](https://godoc.org/go.opencensus.io/trace#Span.SetStatus)
Java API|[Span.SetStatus](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/Span.html#setStatus-io.opencensus.trace.Status-)
Python API|[Status](https://github.com/census-instrumentation/opencensus-python/blob/d9384fdfafebe678aef0d28a237d098f4e240ad7/opencensus/trace/status.py#L18-L64)
C++ API|[Span.SetStatus](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/span.h#L142-L144)
