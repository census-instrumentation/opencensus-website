---
title: "Jaeger"
weight: 2
date: 2019-02-13T11:51:11-08:00
logo: /img/partners/jaeger_logo.svg
---

- [Introduction](#introduction)
- [Accepted formats](#accepted-formats)
- [Configuration](#configuration)
    - [Format](#format)
    - [Defaults and custom configurations](#defaults-and-custom-configurations)
    - [Example](#example)
- [References](#references)

### Introduction
The OpenCensus Jaeger receiver allows the OpenCensus Collector to capture traces that were initially destined for [Jaeger](https://www.jaegertracing.io)

### Accepted formats

The OpenCensus Jaeger receiver can act as the following:

* Jaeger agent
* Jaeger HTTP collector
* Jaeger Compact Thrift collector
* Jaeger Binary Thrift collector
* Jaeger Zipkin Thrift UDP agent

### Configuration
A Jaeger receiver can be turned on by using the configuration file sub-section "jaeger" under "receivers".

### Format

```yaml
receivers:
  jaeger:
    jaeger-thrift-tchannel-port: <port>
    jaeger-thrift-http-port: <port>
```

### Defaults and custom configurations

If a Jaeger receiver is specified, it will start the following

YAML Field|Description|Default Port
---|---|---
`thrift-tchannel_port`|Compact Thrift collector|14267
`thirft-http-port`|Binary Thrift collector|14268

#### Example

```yaml
receivers:
  jaeger: {}
```

and when Collector is re-run, it should produce such output
```shell
{"level":"info","ts":1551744415.5136526,"caller":"opencensus/receiver.go:62","msg":"OpenCensus receiver is running.","port":55678}
{"level":"info","ts":1551744414.5134265,"caller":"jaeger/receiver.go:58","msg":"Jaeger receiver is running.","thrift-tchannel-port":14267,"thrift-http-port":14268}
```

### References
Resource|URL
---|---
Jaeger project home|https://www.jaegertracing.io
