+++
Description = "trace"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"

title = "Trace"
date = "2018-05-30T15:37:24-05:00"
+++

A distributed trace tracks the progression of a single user request as it is handled by the services and processes that make up an application. Each step is called a span in the trace. Spans include metadata about the step, including especially the time spent in the step, called the span’s latency. You can use this information to tune the performance of your application.  
&nbsp;  

---
&nbsp;  
#### Overview  

In a modern system, a single user request may require many microservices, running across many machines, to service it.  
&nbsp;  

__Distributed Tracing__ tracks the progression of a request as it is handled by the services and processes that make up a distributed system. Each step in the Trace is called a Span. Each Span contains metadata, such as the length of time spent in the step, and optionally __Annotations__ about the work being performed. This information can be used for debugging and performance tuning of distributed systems.  
&nbsp;  

---
&nbsp;  
#### Motivating Example  

Picture a three-tier web application:  
&nbsp;  
{{% sc_ulist %}}User requests arrive at a load balancer.{{% /sc_ulist %}}
{{% sc_ulist %}}The load balancer forwards the request to an application server.{{% /sc_ulist %}}
{{% sc_ulist %}}The application server sends two database requests, then returns a webpage.{{% /sc_ulist %}}  

The database requests can be issued concurrently, but both have to complete before the webpage can be built. In this architecture, a single user request passes through four distinct systems, each is probably sharded into multiple replicas, and running across more than four machines.  
&nbsp;  

If a user request is slow, how do we determine why?  
&nbsp;  
{{% sc_ulist %}}Maybe one of the two database lookups was slow. Which one?{{% /sc_ulist %}}
{{% sc_ulist %}}Maybe the app server responded in time and the load balancer caused the slow-down.{{% /sc_ulist %}}  

Given a distributed trace of the slow user request, we can tell at a glance what happened.  
&nbsp;  

---
&nbsp;  
#### Tracing Concepts  

What follows is a list of all Tracing concepts and how to apply them:  
&nbsp;  

__Trace__  
A Trace is a collection of nested Spans. Traces often extend across multiple nodes in a distributed system. Traces are uniquely identified by a TraceId and all Spans within a Trace will have the same TraceId.  
&nbsp;  

__Span__  
A Span represents an operation or a unit of work. Multiple spans can be part of a "Trace", which represents an execution path (usually distributed) across multiple processes/nodes. Spans are uniquely identified by a SpanId and a TraceId. Spans within the same trace have the same TraceId.  
&nbsp;  

All completed Spans have:  
&nbsp;  
{{% sc_ulist %}}TraceId{{% /sc_ulist %}}
{{% sc_ulist %}}SpanId{{% /sc_ulist %}}
{{% sc_ulist %}}Start Time{{% /sc_ulist %}}
{{% sc_ulist %}}End Time{{% /sc_ulist %}}
{{% sc_ulist %}}Status{{% /sc_ulist %}}
&nbsp;  

Spans can optionally have:  
&nbsp;  
{{% sc_ulist %}}Parent SpanId{{% /sc_ulist %}}
{{% sc_ulist %}}Remote Parent{{% /sc_ulist %}}
{{% sc_ulist %}}Attributes{{% /sc_ulist %}}
{{% sc_ulist %}}Annotations{{% /sc_ulist %}}
{{% sc_ulist %}}Message Events{{% /sc_ulist %}}
{{% sc_ulist %}}Links{{% /sc_ulist %}}
&nbsp;  

__Starting/Ending Spans__  
When a Span starts, it records a start time.  When a Span ends, the end time is recorded. Latency is calculated by the difference between the start and end times.  Spans will only be exported to exporting services after they have ended. Attributes, annotations, message events, etc. can only be added to span that is active (i.e. has started but has not ended).  
&nbsp;  

__Status__  
Status represents the current state of the span. It is represented by a canonical status code which maps onto a predefined set of error values and an optional string message.  
&nbsp;  

e.g. OK  
e.g. { PERMISSION_DENIED, "User foo does not have access to resource bar." }  
&nbsp;  

__Parent Span__  
A Span can have a parent Span, e.g. a database query that needed to read from disk might be expressed as a parent Span for the query and a child Span for the disk read. The initial Span in a Trace is the "root span" and has no parent Span.  
&nbsp;  

__Remote Parent__  
If the parent Span is in another process, it is considered a remote parent. Often, this means the parent Span ran on a different machine.  
&nbsp;  

__SpanContext__  
A SpanContext is a combination of TraceId, SpanId, and TraceOptions. Every Span has a SpanContext.  
&nbsp;  

The SpanContext represents the state information that must be propagated to child Spans and between processes to maintain a Trace, e.g. a Span causing a network operation sends its SpanContext, and the receiver uses it to create a child Span.  
&nbsp;  

Example:  
TraceId-SpanId-Options: 3563a30535bddcaeca5dd00bc84f29ba-90a9d220f553e7fc-01  
&nbsp;  

__TraceId__  
An opaque 128-bit blob, expected to be randomly generated and globally(?) unique for each Trace.  
&nbsp;  

__SpanId__  
An opaque 64-bit blob, expected to be randomly generated and unique across all Spans within a Trace.  
&nbsp;  

__TraceOptions__  
A set of options that are enabled for this Span. Currently the only defined option is "enable tracing." When a microservice receives a request with this bit enabled, it should trace its operations, and also propagate the bit to any requests it makes while servicing the original request.  
&nbsp;  

__Attributes__  
Attributes are additional information that is included in the span which can represent arbitrary data assigned by the user.  They are key value pairs with the key being a string and the value being either a string, boolean, or integer.  
&nbsp;  

__Annotations__  
Annotations are a very useful and important concept in tracing. An Annotation is a timestamped string, with optional attributes. Annotations are used like log lines, but the log is per-Span.  
&nbsp;  

Example:  
&nbsp;  
{{% sc_ulist %}}0.001s Evaluating database failover rules.{{% /sc_ulist %}}
{{% sc_ulist %}}0.002s Failover replica selected. attributes:{replica:ab_001 zone:xy}{{% /sc_ulist %}}
{{% sc_ulist %}}0.006s Response received.{{% /sc_ulist %}}
{{% sc_ulist %}}0.007s Response requires additional lookups. attributes:{fanout:4}{{% /sc_ulist %}}

__Message Events__  
Message events represent messages sent/received between spans. It records whether the message was sent/received, its ID, and optionally the message size.  

Usually, Message Events are added to a Span by the RPC framework to track when frames(?) are sent and received.  
&nbsp;  

__Links__  
Links represent a connection between to a Span in a different Trace. The linked Span can be either a parent or child.  

For example: the current Span is a database write in the service of a user request, it has a Link to a child Span in another Trace because it created work to the side, like a write to a shared forward journal.  
&nbsp;  

__Sampler__  
Tracing every Span can incur a large overhead, so sampling is often employed. Samplers decide whether or not given Span will be sampled. The default sampler is a probabilistic one with a configurable probability threshold. Users can write their own samplers as well.  

Sampling can be changed at runtime, e.g. sample 100% of requests for 30 seconds to debug a problem that's currently happening.  
&nbsp;  

__TraceConfig__  
TraceConfig holds the global default TraceParams which control tracing. It is the interface to change the parameters dynamically, during runtime.  
&nbsp;  

__TraceParams__  
TraceParams defines limits enforced by tracing. It sets the maximum number of attributes, annotations, message events, and links per span as well as the default sampling probability.  
&nbsp;  

__Exporter__  
Code that sends completed Spans to a storage system such as Stackdriver or Zipkin.  
&nbsp;  

__Plugin__  
Instrumentation for a framework. e.g. The gRPC plugin creates a Span for every RPC sent and received.  
&nbsp;  
