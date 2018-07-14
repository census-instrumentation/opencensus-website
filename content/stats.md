+++
title = "Stats"
type = "leftnav"
+++

Application and request metrics are important indicators
to determine whether a service is working as expected or not.
Custom metrics can provide insights into how availability indicators
impact the business. Collected data can help automatically
generate alerts at an outage or trigger better scheduling
decisions to scale up a service automatically upon high demand.

Stats collection allows users to collect custom metrics and provide
a set of predefined metrics through the framework integrations.
Collected data can be multidimensional and
it can be filtered and grouped by [tags](/tags).

Stats collection separates:  

* Definition of measures and recording of data points.
* Definition of views and aggregation of the recorded data.

---

## Measures  

A measure represents a type of metric to be recorded. For example, request latency
in µs and request size in kB/s are examples of measures to collect from a server.
All measures are identified by a name and also have a description and a unit.
Libraries and frameworks can define and export measures for their end users to
collect data on the provided measures.  

Below, there is an example measure for HTTP latency in microseconds:

```
RequestLatecy = { 
  "http/request_latency",
  "HTTP request latency in microseconds",
  "microsecs",
}
```
---

## Recording  
Measurement is a data point to be collected for a measure. For example, for a latency (ms) measure, 100 is a measurement that represents a 100 ms latency event. Users collect data points on the existing measures with the current context. Tags from the current context are recorded with the measurements if they are any.  

Recorded measurements are dropped immediately if user is not aggregating them via views. Users don’t necessarily need to conditionally enable/disable recording to reduce cost. Recording of measurements is cheap.  

Libraries can record measurements and provide measures,
and end-users can later decide on which measurements
they want to collect later.  

---

## Views

In order to aggregate measurements and export, users need to define views.
A view allows recorded measurements to be aggregated with a one of the
aggregation methods set by the user cumulatively.
All recorded measurements is broken down by user-provided [tag](/tags) keys.  

Several aggregation method are supported:  

* **Count**: The count of the number of measurement points.
* **Distribution**: Histogram distribution of the measurement points.
* **Sum**: A sum up of the measurement points.
* **LastValue**: Keeps the last recorded value, drops everything else.

Users can dynamically create and delete views at runtime. Libraries may
export their own views and claim the view names by registering them.  

---

## Exporting 

Collected and aggregated data can be exported to a stats collection backend by registering an exporter.  

Multiple exporters can be registered to upload the data to various different backends. Users can unregister the exporters if they no longer are needed. 