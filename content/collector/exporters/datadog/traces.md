---
title: "Trace"
date: 2019-02-14T14:24:41-08:00
logo: /img/partners/datadog_logo.svg
---

### Introduction
The OpenCensus Datadog exporter allows the OpenCensus Collector to export
traces to Datadog's backend.

### Configuration

In the Collector's YAML configuration file, under section "exporters" and sub-section "datadog", please configure these fields:

#### Format
```yaml
exporters:
  datadog:
    namespace: "<namespace>"
    trace_addr: "<address or host:port>"
    enable_tracing: <true or false>
```

#### Example
```yaml
exporters:
  datadog:
    namespace: "oc_pool"
    trace_addr: "localhost:8126"
    enable_tracing: true
```

### References
Resource|URL
---|---
Datadog Tracing|https://docs.datadoghq.com/tracing/
