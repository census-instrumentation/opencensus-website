---
title: "Feature Matrix"
date: 2019-02-01T12:15:00-07:00
draft: false
weight: 100
---

This matrix shows feature compatibility for OpenCensus languages.
{{% tabs Tracing Tags Stats Metrics Resource Exporters%}}

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
<b>Core Data Models</b>|
SpanContext|Yes|Yes|Yes|Yes|Yes
Tracestate|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Attributes (String/Bool/Int)|Yes|Yes|Yes|Yes|<span style="color: #CF7675">String Only</span>
Attributes Double/Float64|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
Link|Yes|Yes|Yes|Yes|Yes
Annotation|Yes|Yes|Yes|Yes|Yes
SpanKind|Yes|Yes|Yes|Yes|Yes
MessageEvent|Yes|Yes|Yes|Yes|Yes
Start/End Time|Yes|Yes|Yes|Yes|Yes
SpanData (for exporting)|Yes|Yes|Yes|Yes|Yes
Status|Yes|Yes|Yes|Yes|Yes
<b>Trace Configs</b>|
TraceParam Limits (Attributes, Annotations, etc.)|Yes|Yes|<span style="color: #CF7675">No</span>|Yes|<span style="color: #CF7675">No</span>
Rate-limited Sampler|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|Yes<span style="color: #6bb1e0"> (requires PSR-6 cache)</span>
<b>Basic Operations</b>|
Create a root span|Yes|Yes|Yes|Yes|Yes
Put span into/get span from current context|Yes|Yes|Yes|Yes|Yes
Create a span from current context|Yes|Yes|Yes|Yes|Yes
Create a span with explicit parent|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Add attributes, links, annotations, message events|Yes|Yes|Yes|Yes|Yes
Register/Unregister Exporters|Yes|Yes|Yes|Yes|<span style="color: #CF7675">Register only (use Agent)</span>
Child Span Count|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #6bb1e0">In Progress</span>|No
End a span with an error status|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
Override sampling for a span|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #6bb1e0">In Progress</span>|<span style="color: #CF7675">No</span>
<b>Propagation</b>|
Binary Format - gRPC|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #6bb1e0">Client only</span>
W3C TraceContext Format - HTTP|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
B3 Format - HTTP|Yes|Yes|Yes|Yes|<span style="color: #6bb1e0">In Progress</span>
Google Cloud Text Format|Yes|Yes|Yes|Yes|Yes

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
<b>Core Data Models</b>|
Tag|Yes|Yes|Yes|Yes|Yes
TagKey (restrictions apply)|Yes|Yes|Yes|Yes|Yes
TagValue (restrictions apply)|Yes|Yes|Yes|Yes|Yes
TagMap|Yes|Yes|Yes|Yes|Yes
TagScope|<span style="color: #6bb1e0">In Progress</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
<b>Basic Operations</b>|
Validate TagKey and TagValue|Yes|Yes|Yes|Yes|Yes
Insert a list of Tags into current context|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|Yes
Get Tags from current context|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
Update Tags in current context|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
<b>Propagation</b>|
Binary Format|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
Text Format (W3C)|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
gRPC Propagation|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
HTTP Propagation|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
<b>Core Data Models</b>|
Measure (Int64 and Double)|Yes|Yes|Yes|Yes|Yes
Measurement (Int64 and Double)|Yes|Yes|Yes|Yes|Yes
MeasureMap or equivalent (allow for batch recording)|Yes|Yes|Yes|Yes|Yes
Aggregation (Count, Sum, LastValue, Distribution)|Yes|Yes|Yes|Yes|Yes
Bucket Boundaries (only with postive bounds)|Yes|Yes|Yes|Yes|Yes
AggregationData (Count, Sum, LastValue, Distribution)|Yes|Yes|Yes|Yes|Yes
View|Yes|Yes|Yes|Yes|Yes
ViewData|Yes|Yes|Yes|Yes|Yes
<b>Basic Operations</b>|
Create Int64 or Double Measurements|Yes|Yes|Yes|Yes|Yes
Validate Measurements (no negative values)|Yes|Yes|Yes|Yes|Yes
Batch recording Measurements|Yes|Yes|Yes|Yes|Yes
Record against explicit context|Yes|Yes|Yes|Yes|Yes
Record against implicit (current) context|Yes|Yes|Yes|<span style="color: #CF7675">No</span>|Yes
Record with additional attachments (e.g SpanContext)|Yes|Yes|Yes|Yes|Yes
Define and register Views|Yes|Yes|Yes|Yes|Yes
Apply Aggregation to Measurements according to View definitions|Yes|Yes|Yes|Yes|Yes
Validate bucket boundaries for a Distribution|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Retrieve aggregated data for a given View|Yes|Yes|Yes|Yes|Yes
<b>Stats Plug-in</b>|
gRPC plug-in for Metrics|Yes|Yes<span style="color: #CF7675"> (missing started_rpcs metrics)</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>
HTTP plug-in for Metrics|Yes|Yes|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>|<span style="color: #CF7675">No</span>

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
<b>Core Data Models</b>|
LabelKey|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
LabelValue|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Double and Int64 Value|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Summary Value|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Distribution Value (including BucketOptions and Exemplar.)|Yes|Yes|Yes|Yes<span style="color: #CF7675"> (without exemplar)</span>|<span style="color: #CF7675">No</span>
Point|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
TimeSeries|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
MetricDescriptor|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Metric|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
Double and Long Gauge|Yes|Yes|<span style="color: #6bb1e0">In Progress</span>|Yes|<span style="color: #CF7675">No</span>
MetricProducer|Yes|Yes|Yes|Yes|<span style="color: #CF7675">No</span>
<b>Basic Operations</b>|
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
Add resource labels to span|Yes|No|Yes <span style="color: #CF7675"> (without new names)</span>|Yes|No

Feature|Java|Go|Python|Nodejs|PHP
---|---|---|---|---|---
<b>Metrics</b>|
Stackdriver Monitoring|Yes|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes|Yes<span style="color: #6bb1e0"> (using Go Daemon)</span>
Prometheus|Yes|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes<span style="color: #CF7675"> (using ViewData)</span>|Yes<span style="color: #6bb1e0"> (using Go Daemon)</span>
<b>Tracing</b>|
Strackdriver Trace|Yes|Yes|Yes|Yes|Yes
Jaeger|Yes|Yes|Yes|Yes|Yes
Zipkin|Yes|Yes|Yes|Yes<span style="color: #CF7675"> (missing fields)</span>|Yes
{{% /tabs %}}
