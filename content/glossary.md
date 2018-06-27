+++
title = "Glossary"
Description = "glossary"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "glossary"
date = "2018-05-14T16:11:08-05:00"
+++

**Tracing**  

Distributed Tracing tracks the progression of a request as it is handled by the services and processes that make up a distributed system. Each step in the Trace is called a Span. Each Span contains metadata, such as the length of time spent in the step, and optionally annotations about the work being performed. This information can be used for debugging and performance tuning of distributed systems.

---

**Span**  

A unit work in a trace. Each span might have children spans within. If a span does not have a parent, it is called a root span.  

---

**Root Span**  
The first span in a trace; this span does not have a parent.  

---

**Child Span**  
A span with a parent span; it represents a unit of work that originates from an existing span.  
A span MAY or MAY NOT be a child and spans can coexist as siblings on the same level.  

---

**Trace**  
A tree of spans. A trace has a root span that encapsulates all the spans from start to end, and the children spans being the distinct calls invoked in between.  

---

**Sampling**

Sampling determines how often requests will be traced.
There are three types of sampling made available from OpenCensus libraries:  

* **Always sample:** With this sampling, every single request is traced.  
* **Probabilisticly sample:** A probability is set (e.g 0.0001) and the libraries will sample according to that probability (e.g. 1 in 10000 requests).
* **Never sample:** No request is traced.  

---

**Measure**  
Any quantifiable metric. Examples of measures are number of requests, number of failed responses, bytes downloaded, cache misses, number of transactions, etc.  

---

**Aggregation**

OpenCensus doesn't export each collected measurement. It preaggregates measurements in the process.
OpenCensus provides the following aggregations:  

* **Count:** Reports the count of the recorded data points. For example, number of requests.
* **Distribution:** Reports the histogram distribution of the recorded measurements.
* **Sum:** Reports the sum of the recorded measurements.
* **Last Value:** Reports on the last recorded measurement and drops everything else.

---

**Tags**

Tags are key-value pairs that can be recorded with measurements.
They are later used to breakdown the collected data in the metric collection backend.
Tags should be designed to meet the data querying requirements. Examples of tags: 

* ip=10.32.103.12
* version=1.23
* frontend=ios-10.3.1  

---

**Views**

A view manages the aggregation of a measure and exports the collected data.
Recordings on the measures won't be exported until a view is registered to
collect from the measure.

---

**View Data**

View Data is the exported data from a view.
It contains view information, aggregated data,
start and end time of the collection.

---

**Exporters**

Exporters allow for metrics and traces collected by
OpenCensus to be uploaded to the other services.  
Various providers have OpenCensus exporters, examples are
Stackdriver Monitoring and Tracing, Prometheus, SignalFX, Jaeger.

---

**Context Propagation**  

The mechanism to transmit identifiers or metadata on the wire
and in-process. For example, trace span identifier and stats tags
can be propagated in the process and among multiple processors.

---

**RPC**

Remote Procedure Call. The mechanism of invoking a procedure/subroutine in a different scope/address space.  

---