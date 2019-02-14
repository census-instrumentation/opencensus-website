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
- [End to end example](#end-to-end-example)
    - [Running ocagent](#running-ocagent)
    - [Running Application Code](#running-application-code)
- [Results](#results)
    - [All traces](#all-traces)
    - [Single trace](#single-trace)
    - [Trace detail](#trace-detail)
- [References](#references)


### Introduction

ocagent allows one to export traces to Zipkin
![](/images/ocagent-exporter-zipkin-all-schematics.png)

### Configuration

In the ocagent's YAML configuration file, under section "exporters" and sub-section "zipkin" configure fields: 

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
    service_name: "agent_1"
    endpoint: "http://localhost:9411/api/v2/spans"
    upload_period: 4s
    local_endpoint: "localhost:5544"
```

### Notes
{{% notice warning %}}
* Please ensure that `endpoint` DOES NOT point to the same address as that of the [Zipkin receiver](/agent/receivers/zipkin/#format)
{{% /notice %}}

### End to end example

In this end-to-end example, we'll have ocagent running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over traces to ocagent and then to Zipkin.

### Running Zipkin
Firstly we need to get Zipkin running

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.
{{% /notice %}}

With Zipkin running, we are ready to proceed with running the demo.

### Running ocagent

ocagent will run with Zipkin as the only exporter, but receive traffic from ocagent-exporter-using applications.

On starting ocagent with the configuration below:
```yaml
# Saved in oca.yaml
exporters:
  zipkin:
    service_name: "agent_1"
    endpoint: "http://localhost:9411/api/v2/spans"
    upload_period: 4s
    local_endpoint: "localhost:5544"

receivers:
  opencensus:
    address: "localhost:55678"
```

On running ocagent:

```shell
$ ./bin/ocagent_darwin --config zipkin.yaml 
{"level":"info","ts":1550128147.9330611,"caller":"config/config.go:424","msg":"Trace Exporter enabled","exporter":"zipkin"}
2019/02/13 23:09:08 Running OpenCensus Trace and Metrics receivers as a gRPC service at "localhost:55678"
2019/02/13 23:09:08 Running zPages at ":55679"
```

#### Running Application Code

And then running the `ocagent-go-exporter` [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) application

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
