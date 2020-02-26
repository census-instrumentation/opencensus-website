---
title: "OpenCensus"
weight: 1
date: 2019-02-12T18:27:23-08:00
aliases: [/agent/receivers/opencensus]
logo: /images/opencensus-logo.png
---

- [Introduction](#introduction)
- [Accepted formats](#accepted-formats)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
- [Application level exporters](#application-level-exporters)
- [References](#references)

### Introduction
The OpenCensus receiver allows the OpenCensus Service to capture traces and metrics from
applications that implement the [OpenCensus
Protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)

### Accepted formats
By default, the OpenCensus Service listens on TCP port `55678` and receives traffic from:

* HTTP/2 clients with Protobuf messages
* HTTP/1 clients that use the [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway)

### Configuration
An OpenCensus receiver can be turned on by using the configuration file
sub-section "opencensus" under "receivers"

### Format

```yaml
receivers:
  opencensus:
    address: <host:port>
```

#### Example

```yaml
receivers:
  opencensus:
    address: "localhost:55678"
```

and when OpenCensus Service is re-run, it should produce such output

##### Agent

```shell
2019/02/12 18:57:25 Running OpenCensus Trace and Metrics receivers as a gRPC service at "localhost:55678"
2019/02/12 18:57:25 Running zPages at ":55679"
```

##### Collector

```shell
{"level":"info","ts":1551744415.5136526,"caller":"opencensus/receiver.go:62","msg":"OpenCensus receiver is running.","port":55678}
```

### Application level exporters
To use OpenCensus in your applications and directly export the collected
traces, stats and metrics to the OpenCensus Service, please look at these respective
language guides:

Language|Reference
---|---
Go|[opencensus-go-exporter](/exporters/supported-exporters/go/ocagent/)
Python|[opencensus-python-exporter](https://github.com/census-instrumentation/opencensus-python/tree/master/opencensus/trace/exporters/ocagent)
Java|[opencensus-java-trace-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/trace/ocagent) and [opencensus-java-metrics-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/metrics/ocagent)
Node.js|[opencensus-node-exporter](https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-exporter-ocagent)

### References
Resource|URL
---|---
OpenCensus Protocol|[opencensus protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)
grpc-gateway|https://github.com/grpc-ecosystem/grpc-gateway
Go exporter|[opencensus-go-exporter](/exporters/supported-exporters/go/ocagent/)
Python exporter|[opencensus-python-exporter](https://github.com/census-instrumentation/opencensus-python/tree/master/opencensus/trace/exporters/ocagent)
Java exporter|[opencensus-java-trace-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/trace/ocagent) and [opencensus-java-metrics-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/metrics/ocagent)
Node exporter|[opencensus-node-exporter](https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-exporter-ocagent)
