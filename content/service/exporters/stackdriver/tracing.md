---
title: "Trace"
date: 2019-02-13T19:13:58-08:00
aliases: [/agent/exporters/stackdriver/traces]
logo: /images/stackdriver-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
- [End to end example](#end-to-end-example)
    - [Running OpenCensus Service](#running-opencensus-service)
    - [Running Application code](#running-application-code)
- [Results](#results)
    - [All traces](#all-traces)
- [References](#references)

### Introduction

The OpenCensus Service allows you to export traces that are collected from client libraries and [receivers](/service/receivers) to Stackdriver.

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

### Configuration

In the Service's YAML configuration file, under section "exporters" and sub-section "stackdriver" and configure
fields:

#### Format

```yaml
exporters:
  stackdriver:
    project: "<google_cloud_platform_project_id>"
    enable_tracing: <true or false>
```

### End to end example

In this end-to-end example, we'll have the OpenCensus Service running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over traces to the OpenCensus Service and then to Stackdriver.

### Running OpenCensus Service

On starting the OpenCensus Service with the configuration below:
```yaml
exporters:
  stackdriver:
    project: "census-demos"
    enable_tracing: true
```

Before running the OpenCensus Service, we need to make sure that we have our Google Application Credentials resolvable either locally
or after following [Application Authentication](https://cloud.google.com/docs/authentication/production)

#### Agent

```shell
GOOGLE_APPLICATION_CREDENTIALS=gcp_creds.json ./bin/ocagent --config oca.yaml
```

#### Running Application Code

And then running the `ocagent-go-exporter` [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) application

{{% notice tip %}}
The `ocagent.WithAddress` can be changed in [main.go](/exporters/supported-exporters/go/ocagent/#end-to-end-example) to point to the OpenCensus Collector directly if desired.
{{% /notice %}}

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

####  All traces
![](/images/ocagent-exporter-stackdriver-all-traces.png)

### References

Resource|URL
---|---
Stackdriver Trace home|https://cloud.google.com/trace/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
