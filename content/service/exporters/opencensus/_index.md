---
title: "OpenCensus"
date: 2019-02-14T12:13:58-08:00
aliases: [/agent/exporters/opencensus]
logo: /images/opencensus-logo.png
---

- [Introduction](#introduction)
- [Use cases](#use-cases)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
    - [Notes](#notes)
- [References](#references)

### Introduction

The OpenCensus exporter allows you to export traces and metrics from the
OpenCensus Service to a service of your choice.

### Use cases

* Your backend could be [OpenCensus Protocol compliant](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent).
* You might want to [daisy
chain](https://en.wikipedia.org/wiki/Daisy_chain_(electrical_engineering))
various Collectors and then export once (for example to preserve bandwidth or
connections or create a mesh network to batch data and piggyback due to
connection limits with the outside world/APM backend).

### Configuration

In Service's YAML configuration file, under section "exporters" and sub-section "opencensus", configure these fields:

### Format

```yaml
exporters:
  opencensus:
    endpoint: "<host:port>"
    compression: "<compression e.g. gzip>"
```

### Example
```yaml
exporters:
  opencensus:
    endpoint: "localhost:44788"
```

### Notes
{{% notice warning %}}
* Please ensure that `endpoint` DOES NOT point to the same address as that of the [OpenCensus receiver.address](/collector/receivers/opencensus/#format) to avoid a [SELF-DOS LOOP](https://en.wikipedia.org/wiki/Denial-of-service_attack)
{{% /notice %}}


### References

Resources|URL
---|---
OpenCensus Protocol|[OpenCensus Protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)
