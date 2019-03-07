---
title: "Zipkin"
date: 2019-02-13T22:23:58-08:00
aliases: [/agent/exporters/zipkin]
logo: /img/zipkin-logo.jpg
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
    - [Notes](#notes)
- [End to end example](#end-to-end-example)
    - [Running Zipkin](#running-zipkin)
    - [Running OpenCensus Service](#running-opencensus-service)
    - [Running Application Code](#running-application-code)
- [Results](#results)
    - [All traces](#all-traces)
    - [Single trace](#single-trace)
    - [Trace detail](#trace-detail)
- [References](#references)


### Introduction

The OpenCensus Service allows one to export traces to Zipkin

### Configuration

In the Service's YAML configuration file, under section "exporters" and sub-section "zipkin" configure fields:

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
* Please ensure that `endpoint` DOES NOT point to the same address as that of the [Zipkin receiver](/service/receivers/zipkin/#format)
{{% /notice %}}

### End to end example

In this end-to-end example, we'll have the OpenCensus Service running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over traces to OpenCensus Service and then to Zipkin.

### Running Zipkin
First, we need to get Zipkin running

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.
{{% /notice %}}

With Zipkin running, we are ready to proceed with running the demo.

### Running OpenCensus Service

The OpenCensus Service will run with Zipkin as the only exporter, but receive traffic from ocagent-exporter-using applications.

On starting the OpenCensus Service with the configuration below:
```yaml
exporters:
  zipkin:
    service_name: "opencensus"
    endpoint: "http://localhost:9411/api/v2/spans"
    upload_period: 4s
    local_endpoint: "localhost:5544"
```

On running the OpenCensus Service:

```shell
{"level":"info","ts":1550128147.9330611,"caller":"config/config.go:424","msg":"Trace Exporter enabled","exporter":"zipkin"}
```

#### Running Application Code

And then running the `ocagent-go-exporter` [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) application

{{% notice tip %}}
The `ocagent.WithAddress` can be changed in [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) to point to the OpenCensus Collector directly if desired.
{{% /notice %}}

```shell
$ GO111MODULE=on go run example/main.go
Latency: 861.160ms
#0: LineLength: 432By
#1: LineLength: 366By
#2: LineLength: 765By
Latency: 11551.507ms
#0: LineLength: 920By
#1: LineLength: 921By
Latency: 7655.319ms
#0: LineLength: 558By
#1: LineLength: 725By
#2: LineLength: 508By
Latency: 651.339ms
```

### Results

On navigating to the Zipkin UI at http://localhost:9411/zipkin

####  All traces
![](/images/ocagent-exporter-zipkin-all-traces.png)

#### Single trace
![](/images/ocagent-exporter-zipkin-single-trace.png)

#### Trace detail
![](/images/ocagent-exporter-zipkin-trace-detail.png)

### References

Resource|URL
---|---
Zipkin project home|https://zipkin.io/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
