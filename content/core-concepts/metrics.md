---
title: "Metrics"
date: 2018-07-16T14:28:40-07:00
draft: false
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
it can be filtered and grouped by [tags](/tags).

Stats collection requires two steps:  

* Definition of measures and recording of data points.
* Definition and registration of views to aggregate the recorded values.

#### Measures  

A measure represents a metric type to be recorded. For example, request latency
in µs and request size in KBs are examples of measures to collect from a server.
All measures are identified by a name and also have a description and a unit.
Libraries and frameworks can define and export measures for their end users to
collect data on the provided measures.  

Below, there is an example measure that represents HTTP latency in ms:

```go
RequestLatecy = {
  "http/request_latency",
  "HTTP request latency in microseconds",
  "microsecs",
}
```

#### Recording
Measurement is a data point to be collected for a measure. For example, for a latency (ms) measure, 100 is a measurement that represents a 100 ms latency event. Users collect data points on the existing measures with the current context. Tags from the current context are recorded with the measurements if they are any.  

Recorded measurements are dropped if user is not aggregating them via views. Users don’t necessarily need to conditionally enable/disable recording to reduce cost. Recording of measurements is cheap.  

Libraries can record measurements and provide measures,
and end-users can later decide on which measures
they want to collect.  

#### Views

In order to aggregate measurements and export, users need to define views.
A view allows recorded measurements to be aggregated with a one of the
aggregation methods set by the user cumulatively.
All recorded measurements is broken down by user-provided [tag](/core-concepts/tags) keys.  

Following aggregation methods are supported:  

* **Count**: The count of the number of measurement points.
* **Distribution**: Histogram distribution of the measurement points.
* **Sum**: A sum up of the measurement points.
* **LastValue**: Keeps the last recorded value, drops everything else.

Users can dynamically create and delete views at runtime. Libraries may
export their own views and claim the view names by registering them.  

#### Sampling

Stats are NOT sampled to be able to represent uncommon
cases. For example, a [99th percentile latency issue](https://www.youtube.com/watch?v=lJ8ydIuPFeU)
is rare. Combined with a low sampling rate,
it might be hard to capture it. This is why stats are not sampled.

On the other hand, exporting every individual measurement would
be very expensive in terms of network traffic. This is why stats
collection aggregates data in the process and exports only the
aggregated data.

#### Exporting

Collected and aggregated data can be exported to a stats collection
backend by registering an exporter.  

Multiple exporters can be registered to upload the data to various different backends.
Users can unregister the exporters if they no longer are needed.

See [exporters](/core-concepts/exporters) to learn more.
