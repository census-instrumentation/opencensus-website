---
title: "Stats"
---

An application metric records information about some part of your application
system: the number of orders received, the number of failed authentications, the
number of RPC connections received, and so on. You use this information to track
usage trends and to detect anomalies that might indicate a problem.

Examples of metrics analysis backends are Prometheus, Nagios, Datadog, and
Stackdriver Monitoring.

OpenCensus collects application metrics and a set of predefined metrics from certain
runtime libraries.

OpenCensus metric collection happens in three primary stages:

* Definition of measures and recording of data points
* Definition of views to collect recorded data
* Exporting the recorded data

Users to create typed measures, record measurements,
aggregate the collected data, and export the collected data.

## Measures

A measure represents a type of metric to be tracked and recorded.
For example, request latency, request size in Mb/s are a few examples
of measures to collect from a server.

Each registered measure needs to be unique by name. Measures also have
a description and a unit.

Libraries and frameworks can define and export measures for their end users to
create views and collect instrumentation data.

```
latencyMeasure = Measure.create("my.org/measures/request_latency",
    "Request latency in nanoseconds",
    "nanoseconds")
```

## Recording measurements

Measurement is a data point to be collected for a measure. For example, for a
latency (ms) measure, 100 is a measurement that represents a 100ms latency event.
Users collect data points on the existing measures with the current context.
Tags from the current context are recorded with the measurements if they are any.

Recorded measurements are dropped immediately if user is not aggregating them
via views. Users don't necessarily need to conditionally enable/disable
recording to reduce cost. Recording of measurements is cheap.

Libraries can always record measurements, and end-users can later
decide on which measurements they want to collect by registering views.
This allows libraries to turn on the instrumentation by default.


## Views

In order to collect measurements, views need to be defined and registered.
A view allows recorded measurements to be filtered and aggregated over a time window.

All recorded measurements is broken down by tag keys.

OpenCensus provides several aggregation methods:

* Count: The count of the number of measurement points.
* Distribution: Statistical summary of the measurement points.
* Sum: A sum up of the measurement points.
* Mean: Mean of the recorded measurements.

Users can dynamically create and delete views in runtime.

Libraries can export their own views and claim the
view names by registering them themselves.

## Exporting

Collected and aggregated data can be exported to a metric
collection backend by registering an exporter.

Multiple exporters can be registered to upload the data to
various different backends. Users can unregister the
exporters if they no longer are needed.