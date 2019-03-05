---
title: "Zipkin"
date: 2019-02-13T22:23:58-08:00
logo: /img/zipkin-logo.jpg
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
    - [Notes](#notes)
- [References](#references)


### Introduction

The OpenCensus Collector allows one to export traces to Zipkin

### Configuration

In the Collector's YAML configuration file, under section "exporters" and sub-section "zipkin" configure fields: 

#### Format
```yaml
exporters:
  zipkin:
    service_name: "<service_name>"
    endpoint: "<endpoint_url_of_the_zipkin_server>"
    local_endpoint: "<local_endpoint_url with scheme>"
    upload_period: "<batching time as a string e.g. ms, s, m, h, d>"
```

#### Example
```yaml
# Saved in oca.yaml
exporters:
  zipkin:
    service_name: "opencensus"
    endpoint: "http://localhost:9411/api/v2/spans"
    upload_period: 4s
    local_endpoint: "localhost:5544"
```

### Notes
{{% notice warning %}}
* Please ensure that `endpoint` DOES NOT point to the same address as that of the [Zipkin receiver](/collector/receivers/zipkin/#format)
{{% /notice %}}

### References

Resource|URL
---|---
Zipkin project home|https://zipkin.io/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
