+++
title = "Glossary"
Description = "glossary"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "glossary"
date = "2018-05-14T16:11:08-05:00"
+++

**Tracing**  
Tracking the entire path of execution of a service or a function from start until end. e.g. During an upload, tracking when a file handle is received, opened, sanitized and uploaded to the cloud.  

---

**Span**  
The unit of traversal during tracing. Each span might have a children spans within it or it might be the first in its generation and called a root.  

---

**Root Span**  
The first span in a trace; this span does not have a parent.  

---

**Child Span**  
A span with a parent span; it represents a call that originates from an already traced one.  

A span MAY or MAY NOT be a child and spans can coexist as siblings on the same level.  

---

**Trace**  
A tree of spans. A trace has a root span that encapsulates all the spans from start to end, and the children spans being the distinct calls invoked in between.  

---

**Sampling**  
Is the mechanism that determines how often the system will trace a request.  
There are  3 types of sampling:  

1. **Always sample:**  
  
    - With this sampling, every single request is traced.  
		
2. **Probabilistic sampling:**  
	
	- Here a probability is set e.g specify 1 in 10000 or 0.0001 and the system will sample only 1 in 10000 requests. This entirely depends on your QPS.  
		
3. **Never sample:**  
	
	- Here you’ve asked that the system never traces any request.  

---

**Measure**  
Any quantifiable measurement/metric that you would like to track, it could be number of requests, number of failed responses, bytes downloaded, cache misses, number of radios purchsed etc.  

---

**Aggregation**  
The style of characterizing measures. We have 4 types of Aggregations:  

1. **Count Aggregation:**  

    - Characterizing measures as a sum of increasing quantiles e.g number of requests overtime always increases and is quantified by a natural number.  
	i.e. >= 1  
  
2. **Distribution Aggregation:**  

    - Characterizing measures as belonging to buckets with ranges on sharp boundaries e.g. <10, <100, <1000 which distinctly identify values of 112, 99, 17 as belonging to buckets <1000, <100 and <10 respectively.  
  
3. **Mean Aggregation:**  

    - Characterizing measures over the mean of all of the values and maintains the mean value.  
  
4. **Sum Aggregation:**  

    - Characterizing measures over the total of values and maintains the value as a sum.  

---

**Tags**  
Tags are key-value pairs that are used to store information about metrics for example;  

+ ip=10.32.103.12  

+ user-agent=curl/1.0  

+ coupon=discount-1f1acdbe3  

---

**Views**  
A view is a mechanism for grouping measures, aggregations, tags as well as the timing information, essentially characterizing your metrics for visualization and inspection.  

---

**View Data**  
The grouping of a set of rows that uniquely describe the collection of a measure, its start and end times and the associated view.  

---

**Row**  
It groups the data aggregation with distinct tags.  

---

**RPC**

Remote Procedure Call. The mechanism of invoking a procedure/subroutine in a different scope/address space.  

---

**Context Propagation**  
The mechanism by which identifiable information about a span, e.g. traceId, spanId and traceOptions are sent over RPC scope boundaries. This span can then be linked as a remote parent. This movement could translate to getting information such as “the data storage team” invoked delete on the “database records” service which then invoked the “data consistency service”.  

---

**Exporters**  
The adapters that allow for metrics and traces collected by OpenCensus to be consumed by other services.  
OpenCensus adds minimal overhead to your applications while still giving you the ability to export metrics and traces in near real-time to various backends of your choice, simultaneously e.g Stackdriver Monitoring and Tracing, Prometheus, SignalFX, Jaeger. The multiplicity and convenience enables many application performance monitoring teams and even administrators visualize your applications. Your teams don’t have to expend precious time in maintenance and integration; OpenCensus should just work. We have some examples that you can check out to instrument your backends too. With the ability to introspect your applications, you can apply sound engineering practices making your teams even more productive.  
