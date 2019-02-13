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
ocagent's Jaeger receiver allows ocagent to capture traces that were initially destined for [Jaeger](https://www.jaegertracing.io)

### Accepted formats

ocagent's Jaeger receiver can act as the following:

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
    tchannel_port: <port>
    collector_http_port: <port>
    agent_port: <port>
    agent_compact_thrift_port: <port>
    agent_binary_thrift_port: <port>
```

### Defaults and custom configurations

If a Jaeger receiver is specified, it will start the following

YAML Field|Description|Default Port
---|---|---
`tchannel_port`|Compact Thrift collector|14267
`collector_http_port`|Binary Thrift collector|14268
`agent_port`|Zipkin Thrift UDP port|5775
`agent_compact_thrift_port`|Compact Thrift UDP port|6831
`agent_binary_thrift_port`|Binary Thrift UDP port|6832

#### Example

```yaml
receivers:
  jaeger:
    tchannel_port: 14267
    collector_http_port: 14268
    agent_port: 5775
    agent_compact_thrift_port: 6831
    agent_binary_thrift_port: 6832
```

and when ocagent is re-run, it should produce such output
```shell
./bin/ocagent_darwin --config config.yaml
2019/02/13 12:33:38 Running zPages at ":55679"
2019/02/13 12:33:38 Running Jaeger receiver with CollectorThriftPort 0 CollectHTTPPort 14268
```

### References
Resource|URL
---|---
Jaeger project home|https://www.jaegertracing.io
