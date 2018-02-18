---
title: "Overview"
---

## Tags

OpenCensus allows systems to associate measurements with dimensions as they are recorded.
Recorded data allows us to breakdown the utilization measurements, analyze them
from various different perspectives and be able to target specific cases in
isolation even in highly interconnected and complex systems.
[Read more](/tags).

## Signals

OpenCensus is a holistic framework that support multiple signal types.
Currently, stats collection and distributed tracing support are provided.

* **Stats** collection allow library and application authors to
  record measurement, aggregate the measurements and export them. [Read more](/stats).

* **Distributed traces** track the progression of a single user
  request as it is handled by the internal services until the user
  request is responded. [Read more](/trace).

## Exporters

OpenCensus is vendor-agnostic and can upload data to any backend with
various exporter implementations. Even though, OpenCensus provides
support for many backends, users can also implement their
own exporters for proprietary and unsupported backends.

## Introspection

OpenCensus provides in-process dashboards that displays diagnostics
data from the process. These pages are called z-pages and they are
quite useful to understand to see collected data from a specific process
without having to depend on any metric collection or distributed tracing backend.

More details and implementation details are documented at
[opencensus-specs](https://github.com/census-instrumentation/opencensus-specs).
