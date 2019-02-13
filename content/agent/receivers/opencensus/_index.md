---
title: "OpenCensus"
weight: 1
date: 2019-02-12T18:27:23-08:00
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
ocagent's OpenCensus receivers allows ocagent to capture traces and metrics from applications that implement
the [OpenCensus Agent Protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)

### Accepted formats
By default, ocagent runs on TCP port `55678` and receives traffic from:

* HTTP/2 clients with Protobuf messages
* HTTP/1 clients that use the [grpc-web-gateway](https://github.com/grpc-ecosystem/grpc-gateway)

### Configuration
An OpenCensus receiver can be turned on by using the configuration file sub-section "opencensus" under "receivers"

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

and when ocagent is re-run, it should produce such output
```shell
$ ./bin/ocagent_darwin --config=opencensus.yaml 
2019/02/12 18:57:25 Running OpenCensus Trace and Metrics receivers as a gRPC service at "localhost:55678"
2019/02/12 18:57:25 Running zPages at ":55679"
```

### Application level exporters
To use OpenCensus in your applications and directly export the collected traces, stats and metrics to ocagent, please look at these respective language guides:

Language|Reference
---|---
Go|[ocagent-go-exporter](/exporters/supported-exporters/go/ocagent/)
Python|[ocagent-python-exporter](https://github.com/census-instrumentation/opencensus-python/tree/master/opencensus/trace/exporters/ocagent)
Java|[ocagent-java-trace-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/trace/ocagent) and [ocagent-java-metrics-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/metrics/ocagent)
Node.js|[ocagent-node.js-exporter](https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-exporter-ocagent)

### References
Resource|URL
---|---
OpenCensus Agent Protocol|[ocagent protocol](https://github.com/census-instrumentation/opencensus-proto/tree/master/src/opencensus/proto/agent)
grpc-web-gateway|https://github.com/grpc-ecosystem/grpc-gateway
Go ocagent exporter|[ocagent-go-exporter](/exporters/supported-exporters/go/ocagent/)
Python ocagent exporter|[ocagent-python-exporter](https://github.com/census-instrumentation/opencensus-python/tree/master/opencensus/trace/exporters/ocagent)
Java ocagent exporter|[ocagent-java-trace-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/trace/ocagent) and [ocagent-java-metrics-exporter](https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/metrics/ocagent)
Node.js ocagent exporter|[ocagent-node.js-exporter](https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-exporter-ocagent)
