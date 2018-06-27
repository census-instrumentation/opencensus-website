+++
Description = "stats"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"

title = "Stats"
date = "2018-05-30T14:53:59-05:00"
+++

OpenCensus collects application stats and a set of predefined stats from certain libraries and frameworks.  

OpenCensus is a low-overhead framework even if instrumentation is always enabled. In order to be so, it is optimized to make recording of data points fast and separate from the data aggregation.  

OpenCensus stats collection happens in two stages:  

* Definition of measures and recording of data points
* Definition of views and aggregation of the recorded data
&nbsp;  

---

#### Measures  

A measure represents a type of metric to be recorded. For example, request latency in µs and request size in kB/s are examples of measures to collect from a server.  

All measures are identified by a name and also have a description and a unit.  

Libraries and frameworks can define and export measures for their end users to collect data on the provided measures.  

```
latency = Measure.create("my.org/measures/request_latency",
 "Request latency in nanoseconds",
 "nanoseconds")
```
---

#### Recording Measurements  
Measurement is a data point to be collected for a measure. For example, for a latency (ms) measure, 100 is a measurement that represents a 100 ms latency event. Users collect data points on the existing measures with the current context. Tags from the current context are recorded with the measurements if they are any.  

Recorded measurements are dropped immediately if user is not aggregating them via views. Users don’t necessarily need to conditionally enable/disable recording to reduce cost. Recording of measurements is cheap.  

Libraries can record measurements, and end-users can later decide on which measurements they want to collect later.  

---

#### Views  
In order to collect and aggregate measurements, views need to be defined. A view allows recorded measurements to be aggregated with a one of the aggregation methods set by the user cumulatively. All recorded measurements is broken down by user-provided tag keys.  

OpenCensus provides several aggregation methods:  

* Count: The count of the number of measurement points.
* Distribution: Statistical summary of the measurement points.
* Sum: A sum up of the measurement points.
* Mean: Mean of the recorded measurements.

Users can dynamically create and delete views in runtime.  

Libraries may export their own views and claim the view names by registering them.  

---

#### Exporting  
Collected and aggregated data can be exported to a stats collection backend by registering an exporter.  

Multiple exporters can be registered to upload the data to various different backends. Users can unregister the exporters if they no longer are needed. 