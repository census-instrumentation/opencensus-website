---
title: "Jaeger"
date: 2019-02-14T00:01:21-08:00
aliases: [/agent/exporters/jaeger]
logo: /images/jaeger-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
- [End to end example](#end-to-end-example)
    - [Running Jaeger](#running-jaeger)
    - [Running OpenCensus Service](#running-opencensus-service)
    - [Running Application Code](#running-application-code)
- [Results](#results)
    - [All traces](#all-traces)
    - [Single trace](#single-trace)
- [References](#references)


### Introduction

The OpenCensus Service allows one to export traces to Jaeger by sending traces to Jaeger's collector endpoint.

### Configuration

In the Service's YAML configuration file, under section "exporters" and sub-section "jaeger" configure fields:

#### Format
```yaml
exporters:
  jaeger:
    service-name: "<service_name>"
    collector-endpoint: "<endpoint_url_of_the_jaeger_server>"
    username: "<the_optional_username_to_access_your_collector>"
    password: "<the_optional_password_to_access_your_collector>"
```

#### Example
```yaml
exporters:
  jaeger:
    service-name: "agent_j"
    collector-endpoint: "http://localhost:14268/api/traces"
```

### End to end example

In this end-to-end example, we'll have OpenCensus Service running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over traces to OpenCensus Service and then to Jaeger.

### Running Jaeger
First, we need to get Jaeger running

{{% notice tip %}}
For assistance setting up Jaeger, [Click here](/codelabs/jaeger) for a guided codelab.
{{% /notice %}}

With Jaeger running, we are ready to proceed with running the demo.

### Running OpenCensus Service

The OpenCensus Service will run with Jaeger as the only exporter, but receive traffic from ocagent-exporter-using applications.

On starting the OpenCensus Service with the configuration below:

```yaml
exporters:
  jaeger:
    service_name: "opencensus"
    collector_endpoint: "http://localhost:14268/api/traces"
```

On running the OpenCensus Service:

```shell
{"level":"info","ts":1550129670.73966,"caller":"config/config.go:424","msg":"Trace Exporter enabled","exporter":"jaeger"}
```

#### Running Application Code

And then running the `ocagent-go-exporter` [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) application

{{% notice tip %}}
The `ocagent.WithAddress` can be changed in [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) to point to the OpenCensus Collector directly if desired.
{{% /notice %}}

```shell
$ GO111MODULE=on go run example/main.go
#0: LineLength: 669By
Latency: 123.240ms
#0: LineLength: 779By
#1: LineLength: 740By
Latency: 578.215ms
#0: LineLength: 420By
#1: LineLength: 932By
#2: LineLength: 363By
#3: LineLength: 5By
Latency: 10346.675ms
```

### Results

On navigating to the Jaeger UI at http://localhost:16686

####  All traces
![](/images/ocagent-exporter-jaeger-all-traces.png)

#### Single trace detail
![](/images/ocagent-exporter-jaeger-single-trace.png)

### References

Resource|URL
---|---
Jaeger project home|https://www.jaegertracing.io
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
