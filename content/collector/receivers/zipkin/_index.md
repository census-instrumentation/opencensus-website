---
title: "Zipkin"
date: 2019-02-12T17:25:23-08:00
logo: /img/zipkin-logo.jpg
---

- [Introduction](#introduction)
- [Accepted formats](#accepted-formats)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
- [Defaults](#defaults)
- [References](#references)

### Introduction
The OpenCensus Zipkin receiver allows OpenCensus Collector to capture traces
that were initially destined for [Zipkin](https://zipkin.io/)

### Accepted formats

The Collector receives a variety of Zipkin data serialized in the following formats:

Zipkin API version|Data format
---|---
v1|JSON
v1|Apache Thrift
v2|JSON
v2|Protocol Buffers
v2|Scribe

### Configuration
A Zipkin receiver can be turned on by using the configuration file sub-section "zipkin" under "receivers"

### Format

```yaml
receivers:
  zipkin:
    address: <host:port>

  zipkin-scribe:
    port: <port>
    category: <category>
```

#### Example

```yaml
receivers:
  zipkin:
    address: "localhost:9411"

  zipkin-scribe:
    port: 9410
    category: "agent"
```

and when Collector is re-run, it should produce such output
```shell
{"level":"info","ts":1551744415.5136526,"caller":"opencensus/receiver.go:62","msg":"OpenCensus receiver is running.","port":55678}
{"level":"info","ts":1551744414.5134265,"caller":"zipkin/receiver.go:51","msg":"Zipkin receiver is running.","port":9411}
```

### Notes
"zipkin" and "zipkin-scribe" are two different receivers.

### References
Resource|URL
---|---
Zipkin project|https://zipkin.io/
