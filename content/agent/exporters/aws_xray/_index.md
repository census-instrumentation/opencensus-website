---
title: "AWS X-Ray"
date: 2019-02-14T18:49:58-08:00
logo: /images/aws_xray-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
- [End to end example](#end-to-end-example)
    - [Running ocagent](#running-ocagent)
    - [Running Application Code](#running-application-code)
- [Results](#results)
    - [All traces](#all-traces)
    - [Single trace](#single-trace)
    - [Trace detail](#trace-detail)
    - [Service Map](#service-map)
- [References](#references)


### Introduction
ocagent allows one to export traces to AWS X-Ray

![](/images/ocagent-exporter-aws_xray-architecture.png)

### Configuration

In the ocagent's YAML configuration file, under section "exporters" and sub-section "aws-xray" configure fields: 

#### Format
```yaml
exporters:
  aws-xray:
    default_service_name: "<an optional service name for unknown service names>"
    version: "<the version of the AWS X-Ray service to use>"
    buffer_size: <the number of spans that should be batched>
```

#### Example
```yaml
# Saved in oca.yaml
exporters:
  aws-xray:
    default_service_name: "ocagent"
    version: "latest"
    buffer_size: 200
```

### End to end example

In this end-to-end example, we'll have ocagent running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over traces to ocagent and then to AWS X-Ray.

### Running ocagent

Here, ocagent will run with AWS-XRay as the only trace exporter, but receive traffic from ocagent-exporter-using applications.

On starting ocagent with the configuration below:
```yaml
# Saved in oca.yaml
exporters:
  aws-xray:
    default_service_name: "ocagent"
    version: "latest"
    buffer_size: 200

receivers:
  opencensus:
    address: "localhost:55678"
```

On running ocagent:

```shell
$ ./bin/ocagent_darwin --config xray.yaml 
{"level":"info","ts":1550290707.0522702,"caller":"config/config.go:428","msg":"Trace Exporter enabled","exporter":"aws-xray"}
2019/02/15 20:18:28 Running OpenCensus Trace and Metrics receivers as a gRPC service at "localhost:55678"
2019/02/15 20:18:28 Running zPages at ":55679"
```

#### Running Application Code

And then running the `ocagent-go-exporter` [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) application

```shell
$ GO111MODULE=on go run example/main.go 
#0: LineLength: 559By
#1: LineLength: 199By
#2: LineLength: 218By
#3: LineLength: 898By
#4: LineLength: 795By
Latency: 359.066ms
#0: LineLength: 292By
#1: LineLength: 339By
Latency: 669.318ms
#0: LineLength: 412By
Latency: 86.700ms
```

### Results

On navigating to the AWS X-Ray at [https://console.aws.amazon.com/xray/home](https://console.aws.amazon.com/xray/home)

####  All traces
![](/images/ocagent-exporter-aws_xray-all-traces.png)

#### Single trace
![](/images/ocagent-exporter-aws_xray-single-trace.png)

#### Trace detail
![](/images/ocagent-exporter-aws_xray-trace-detail.png)

#### Service map
![](/images/ocagent-exporter-aws_xray-service_map.png)

### References

Resource|URL
---|---
AWS X-Ray homepage|https://aws.amazon.com/xray/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
