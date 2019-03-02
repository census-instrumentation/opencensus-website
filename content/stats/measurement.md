---
title: "Measurement"
weight: 1
aliases: [/core-concepts/metrics/measurement]
---

### Measurement

Measurement is a data point produced after recording a quantity by a [measure](/stats/measure).
A measurement is just a raw statistic.

For example, for a latency (ms) measure, 100 is a measurement that represents a 100 ms latency event. 

Users collect data points on the existing measures with the current context. 
Tags from the current context are recorded with the measurements if there are any.  

Measurements are produced by [Measures](/stats/measure)

Libraries can record measurements and provide measures,
and end-users can later decide on which measures
they want to collect.  
