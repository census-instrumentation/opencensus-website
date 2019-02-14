---
title: "OpenCensus"
date: 2019-02-14T12:13:58-08:00
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

ocagent's OpenCensus exporter allows it to export traces and metrics from ocagent to a service of your choice.

### Use cases

* Your backend could be [OpenCensus Agent Protocol compliant](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent).
![](/images/ocagent-exporter-opencensus-protocol-compliant-backend.png)

For example [Microsoft Azure's Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/opencensus-local-forwarder)

* You might want to [daisy chain](https://en.wikipedia.org/wiki/Daisy_chain_(electrical_engineering)) various ocagents and then export once

![](/images/ocagent-exporter-opencensus-daisy-chain.png)

for example to preserve bandwidth or connections or create a mesh network to batch data and piggyback due to connection limits with the outside world/APM backend..

### Configuration

In ocagent's YAML configuration file, under section "exporters" and sub-section "opencensus", configure these fields:

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
* Please ensure that `endpoint` DOES NOT point to the same address as that of the [OpenCensus receiver.address](/agent/receivers/opencensus/#format) to avoid a [SELF-DOS LOOP](https://en.wikipedia.org/wiki/Denial-of-service_attack)
{{% /notice %}}


### References

Resources|URL
---|---
OpenCensus Agent Protocol|[Agent Protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)
