---
title: "Trace"
date: 2019-02-13T19:13:58-08:00
logo: /images/stackdriver-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
- [End to end example](#end-to-end-example)
    - [Running ocagent](#running-ocagent)
    - [Running Application code](#running-application-code)
- [Results](#results)
    - [All metrics](#all-metrics)
    - [Rates for individual line length buckets](#rates-for-individual-line-length-buckets)
    - [p99th latencies](#p99th-latencies)
    - [Rates for line counts](#rates-for-line-counts)
- [References](#references)

### Introduction

ocagent allows you to export metrics that are collected from client libraries and [receivers](/agent/receivers) to Stackdriver.

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

### Configuration

In the ocagent's YAML configuration file, under section "exporters" and sub-section "stackdriver" and configure
fields: 

#### Format

```yaml
exporters:
  stackdriver:
    project: "<google_cloud_platform_project_id>"
    enable_tracing: <true or false>
```

### End to end example

In this end-to-end example, we'll have ocagent running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over metrics and traces to ocagent and then to Stackdriver.

![](/images/ocagent-exporter-stackdriver-trace-schematic.png)

### Running ocagent

On starting ocagent with the configuration below:
```yaml
# Saved in oca.yaml
exporters:
  stackdriver:
    project: "census-demos"
    enable_tracing: true

receivers:
  opencensus:
    address: "localhost:55678"
```

Before running ocagent, we need to make sure that we have our Google Application Credentials resolvable either locally
or after following [Application Authentication](https://cloud.google.com/docs/authentication/production)

On running ocagent:

```shell
GOOGLE_APPLICATION_CREDENTIALS=gcp_creds.json ./bin/ocagent --config oca.yaml
```

#### Running Application Code

And then running the `ocagent-go-exporter` [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) application

```shell
$ GO111MODULE=on go run example/main.go 
#0: LineLength: 469By
#1: LineLength: 794By
Latency: 132.649ms
#0: LineLength: 448By
#1: LineLength: 420By
#2: LineLength: 486By
#3: LineLength: 473By
Latency: 1066.808ms
```

### Results

On navigating to the Stackdriver Trace UI at https://console.cloud.google.com/traces

####  All metrics
![](/images/ocagent-exporter-stackdriver-all-traces.png)

### References

Resource|URL
---|---
Stackdriver Trace home|https://cloud.google.com/trace/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
