---
title: "Metrics"
date: 2019-02-13T16:14:17-08:00
aliases: [/agent/exporters/stackdriver/metrics]
logo: /images/stackdriver-monitoring-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
- [End to end example](#end-to-end-example)
    - [Running OpenCensus Service](#running-opencensus-service)
    - [Running Application code](#running-application-code)
- [Results](#results)
    - [All metrics](#all-metrics)
    - [Rates for individual line length buckets](#rates-for-individual-line-length-buckets)
    - [p99th latencies](#p99th-latencies)
    - [Rates for line counts](#rates-for-line-counts)
- [References](#references)

### Introduction

The OpenCensus Service allows you to export metrics that are collected from client libraries and [receivers](/service/receivers) to Stackdriver.

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
    metric_prefix: "<your_metric_prefix>"
    enable_metrics: <true or false>
```

### End to end example

In this end-to-end example, we'll have the OpenCensus Service running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over metrics to the OpenCensus Service and then to Stackdriver.

### Running OpenCensus Service

On starting ocagent with the configuration below:
```yaml
exporters:
  stackdriver:
    project: "opencensus-demo"
    metric_prefix: "opencensus_demo"
    enable_metrics: true
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

On navigating to the Stackdriver Monitoring UI at https://console.cloud.google.com/monitoring

####  All metrics
![](/images/ocagent-exporter-stackdriver-all-metrics.png)

#### Rates for individual line length buckets
![](/images/ocagent-exporter-stackdriver-line_lengths-rate.png)

#### Heatmap for line length buckets
![](/images/ocagent-exporter-stackdriver-line_lengths.png)

#### p99th latencies
![](/images/ocagent-exporter-stackdriver-p99-latency.png)

#### Rates for line counts
![](/images/ocagent-exporter-stackdriver-line_counts-rate.png)

### References

Resource|URL
---|---
Stackdriver Monitoring home|https://cloud.google.com/monitoring/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
