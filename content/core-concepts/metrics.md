---
title: "Metrics"
weight: 20
---

Application and request metrics are important indicators
of availability. Custom metrics can provide insights into
how availability indicators impact user experience or the business.
Collected data can help automatically
generate alerts at an outage or trigger better scheduling
decisions to scale up a deployment automatically upon high demand.


Stats collection allows users to collect custom metrics and provide
a set of predefined metrics through the framework integrations.
Collected data can be multidimensional and
it can be filtered and grouped by [tags](/core-concepts/tags).

Stats collection requires two steps:  

* Definition of measures and recording of data points.
* Definition and registration of views to aggregate the recorded values.

#### Measures  

A measure represents a metric type to be recorded. For example, request latency
in µs and request size in KBs are examples of measures to collect from a server.

All measures are identified by a name and also have a description and a unit.
Libraries and frameworks can define and export measures for their end users to
collect data on the provided measures.  

Below, is an example measure that represents HTTP latency in ms:

```go
RequestLatency = {
  Name="http/request_latency",
  Description="HTTP request latency in microseconds",
  Unit="ms",
}
```

#### Recording
Measurement is a data point to be collected for a measure. For example, for a latency (ms) measure, 100 is a measurement that represents a 100 ms latency event. Users collect data points on the existing measures with the current context. Tags from the current context are recorded with the measurements if they are any.  
A measure produces a `Measurement` which is just a raw statistic, but when aggregated as we shall see below,
Measurements produce Metrics.

Libraries can record measurements and provide measures,
and end-users can later decide on which measures
they want to collect.  

#### Views

In order to aggregate measurements and export, users need to define views.
A view allows recorded measurements to be aggregated with a one of the
aggregation methods set by the user cumulatively.
All recorded measurements are broken down by user-provided [tag](/core-concepts/tags) keys.

The following aggregation methods are supported:

* **Count**: The count of the number of measurement points.
* **Distribution**: Histogram distribution of the measurement points.
* **Sum**: A sum up of the measurement points.
* **LastValue**: Keeps the last recorded value, drops everything else.

Users can dynamically create and delete views at runtime. Libraries may
export their own views and claim the view names by registering them.  

#### Sampling

Stats are NOT sampled to be able to represent uncommon
cases hence, stats are ALWAYS recorded unless [\[1\] dropped](#1-dropped).

The reasoning behind this is that outlier statistics such as "99th latency event"
occur rarely but also occur unpredictably. If our recording system has a low sampling,
we are most likely to miss recording such events. In addition, unlike spans, recording
measurements only requires updating aggregated data (view data) rather than creating 
new objects, so it is relatively light-weight even always sampled. Hence this is the 
reason why stats are NOT sampled but are ALWAYS recorded.

This video ["How NOT to Measure Latency" by Gil Tene](https://www.youtube.com/watch?v=lJ8ydIuPFeU) might help with understanding this decision.

#### Exporting

Collected data is aggregated and exported to stats collection
backends of your choice, by registering an exporter.

Exporting every individual measurement would be very expensive in terms of network bandwidth and CPU costs.
This is why stats collection aggregates data in the process and exports only the aggregated data.

Multiple exporters can be registered to upload the data to various different backends.
Users can unregister the exporters if they no longer are needed.
See [exporters](/core-concepts/exporters) to learn more about exporters.

###### [1] dropped:
Measurements are dropped if the user is not aggregating them using [Views](#views)
