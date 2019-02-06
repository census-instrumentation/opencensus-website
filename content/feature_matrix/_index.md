---
title: "Feature Matrix"
date: 2019-02-01T12:15:00-07:00
draft: false
weight: 100
---

This matrix shows feature compatibility for OpenCensus languages.
{{% tabs Tracing Tags Stats Metrics Resource Exporters%}}

Feature|Java|Go|Python|Nodejs
---|---|---|---|---
TraceParam Limits (Attributes, Annotations, etc.)|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #6bb1e0">In Progress</span>
Rate-limited Sampler|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
Status|Yes|Yes|Yes|Yes
Child Span Count|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
End a span with an error status|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Override sampling for a span|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
Binary Format - gRPC|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
B3 Format - HTTP|Yes|Yes|<span style="color: #CF7675">No</span>|Yes

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
Tag|Yes|Yes|Yes|Yes|Yes
TagKey (restrictions apply)|Yes|Yes|Yes|Yes|Yes
TagValue (restrictions apply)|Yes|Yes|Yes|Yes|Yes
TagScope|<span style="color: #6bb1e0">In Progress</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
Validate TagKey and TagValue|Yes|Yes|Yes|Yes|Yes
Insert a list of Tags into current context|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|Yes
Get Tags from current context|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
Update Tags in current context|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
Binary Format|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
Text Format (W3C)|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
gRPC Propagation|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
HTTP Propagation|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
MeasureMap or equivalent (allow for batch recording)|Yes|Yes|Yes|Yes|Yes
Batch recording Measurements|Yes|Yes|Yes|Yes|Yes
Record against implicit (current) context|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
Record with additional attachments (e.g SpanContext)|Yes|Yes|Yes|Yes
Define and register Views|Yes|Yes|Yes|Yes|Yes
gRPC plug-in for Metrics|Yes|Yes<span style="color: #CF7675"> (missing started_rpcs metrics)</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
HTTP plug-in for Metrics|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
Distribution Value (including BucketOptions and Exemplar.)|Yes|Yes|Yes|Yes<span style="color: #CF7675"> (without exemplar)</span>|<span style="color: #CF7675">No</span>
Double and Long Gauge|Yes|Yes|<span style="color: #6bb1e0">In Progress</span>|Yes|<span style="color: #CF7675">No</span>
MetricProducer|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Add/remove metric producers|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Retrieve metrics from each metric producer|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Register gauges to metric registry|Yes|Yes|<span style="color: #6bb1e0">In Progress</span>|Yes|<span style="color: #CF7675">No</span>

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
Top-level Resource API|Yes|Yes|<span style="color: #CF7675">No</span>|Yes|<span style="color: #CF7675">No</span>
Auto-detect GCE/GKE/AWS EC2 resources|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Set resources for custom environment|Yes|Yes|<span style="color: #CF7675">No</span>|Yes|<span style="color: #CF7675">No</span>
Encode and decode resource|Yes|Yes|<span style="color: #CF7675">No</span>|Yes|<span style="color: #CF7675">No</span>
Merge mutiple resources|Yes|Yes|<span style="color: #CF7675">No</span>|Yes|<span style="color: #CF7675">No</span>

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
<b>Metrics</b>|
Stackdriver Monitoring|Yes|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes|<span style="color: #CF7675">No</span>
Prometheus|Yes|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes<span style="color: #CF7675"> (using ViewData)</span>|<span style="color: #CF7675">No</span>
<b>Tracing</b>|
Strackdriver|Yes|Yes|Yes|<span style="color: #6bb1e0">In Progress</span> (using V1 API)|Yes
Jaeger|Yes|Yes|Yes|Yes|Yes
Zipkin|Yes|Yes|Yes|Yes<span style="color: #CF7675"> (missing fields)</span>|Yes
{{% /tabs %}}

