---
title: "Installing it"
weight: 1
date: 2019-02-11T13:42:17-08:00
---

- [Download](#download)
- [Deployment](#deployment)
    - [Requirements](#requirements)
    - [Building it](#building-it)
- [Testing it out](#testing-it-out)
- [References](#references)

### Download
For every release of the OpenCensus Collector we link Docker images to:

https://github.com/census-instrumentation/opencensus-service/releases

### Deployment

#### Kubernetes

An example YAML file for kubernetes is provided
[here](https://github.com/census-instrumentation/opencensus-service/blob/master/example/k8s.yaml).
It makes use of configmaps to configure the Collector.

#### Docker

Alternatively, the Collector can be run as a standalone Docker container. In this case, you can either pass a configuration:

```shell
$ docker run \
    --rm \
    --interactive \
    -- tty \
    --publish 55678:55678 --publish 8888:8888 \
    --volume $(pwd)/occollector-config.yaml:/conf/occollector-config.yaml \
    occollector \
    --config=/conf/occollector-config.yaml
```
or leverage the available flags:

```text
Usage:
  occollector [flags]

Flags:
      --config string                 Path to the config file
      --debug-processor               Flag to add a debug processor (combine with log level DEBUG to log incoming spans)
      --health-check-http-port uint   Port on which to run the healthcheck http server. (default 13133)
  -h, --help                          help for occollector
      --http-pprof-port uint          Port to be used by golang net/http/pprof (Performance Profiler), the profiler is disabled if no port or 0 is specified.
      --log-level string              Output level of logs (TRACE, DEBUG, INFO, WARN, ERROR, FATAL) (default "INFO")
      --metrics-level string          Output level of telemetry metrics (NONE, BASIC, NORMAL, DETAILED) (default "BASIC")
      --metrics-port uint             Port exposing collector telemetry. (default 8888)
      --receive-jaeger                Flag to run the Jaeger receiver (i.e.: Jaeger Collector), default settings: {ThriftTChannelPort:14267 ThriftHTTPPort:14268}
      --receive-oc-trace              Flag to run the OpenCensus trace receiver, default settings: {Port:55678} (default true)
      --receive-zipkin                Flag to run the Zipkin receiver, default settings: {Port:9411}
      --receive-zipkin-scribe         Flag to run the Zipkin Scribe receiver, default settings: {Address: Port:9410 Category:zipkin}
      --tail-sampling-always-sample   Flag to use a tail-based sampling processor with an always sample policy, unless tail sampling setting is present on configuration file.
```
### References

Resource|URL
---|---
OpenCensus Service on Github|[Github repository](https://github.com/census-instrumentation/opencensus-service)
OpenCensus Service releases|https://github.com/census-instrumentation/opencensus-service/releases
