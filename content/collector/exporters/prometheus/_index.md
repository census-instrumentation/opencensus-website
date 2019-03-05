---
title: "Prometheus"
date: 2019-02-13T16:14:17-08:00
logo: /img/prometheus-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
- [References](#references)

### Introduction

The OpenCensus Collector allows you to export metrics that are collected to Prometheus.

### Configuration

In the Collector's YAML configuration file, under section "exporters" and sub-section "prometheus"

#### Format
With these fields below

```yaml
exporters:
  prometheus:
    namespace: "<namespace>"
    address: "<port:host>"
    const_labels: {
        "<key1>":"<value1>",
        "<key2>":"<value2>"
    }
```

### References

Resource|URL
---|---
Prometheus project home|https://prometheus.io
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
