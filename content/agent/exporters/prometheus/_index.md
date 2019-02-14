---
title: "Prometheus"
date: 2019-02-13T16:14:17-08:00
logo: /img/prometheus-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
- [End to end example](#end-to-end-example)
    - [Running ocagent](#running-ocagent)
    - [Running Prometheus](#running-prometheus)
    - [Running Application code](#running-application-code)
- [Results](#results)
    - [All metrics](#all-metrics)
    - [Rates for individual line length buckets](#rates-for-individual-line-length-buckets)
    - [p99th latencies](#p99th-latencies)
    - [Rates for line counts](#rates-for-line-counts)
- [References](#references)

### Introduction

ocagent allows you to export metrics that are collected from client libraries to Prometheus.

### Configuration

In the ocagent's YAML configuration file, under section "exporters" and sub-section "prometheus"

#### Format
With these fields below

```yaml
exporters:
  prometheus:
    namespace: "<namespace>"
    address: "<port:host>"
    const_labels: {
        "<key1>":"<value1>",
        "<key2>":"<value2>"
    }
```

### End to end example

In this end-to-end example, we'll have ocagent running and a couple of Go applications
that use the [Go ocagent-exporter](/exporters/supported-exporters/go/ocagent)
to send over metrics and traces to ocagent.

![](/images/ocagent-exporter-prometheus-architecture-schematic.png)

### Running ocagent

On starting ocagent with the configuration below:
```yaml
# Saved in oca.yaml
exporters:
  prometheus:
    namespace: "promdemo"
    address: "localhost:8888"
    const_labels: {
        "vendor": "otc"
    }

receivers:
  opencensus:
    address: "localhost:55678"
```

On running ocagent:

```shell
./bin/ocagent --config oca.yaml
```

### Running Prometheus
As specified above in [Running ocagent with exporter](#running-ocagent-with-exporter) by "address": "localhost:9090", please have your Prometheus server running by also configuring
its configuration file `prom.yaml`
```yaml
# Saved into prom.yaml
scrape_configs:
  - job_name: 'agent1'
    scrape_interval: 5s
    static_configs:
      - targets: ['localhost:8888']
```

and then running Prometheus
```shell
prometheus --config.file=prom.yaml
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

On navigating to the Prometheus UI at http://localhost:9090

####  All metrics
![](/images/ocagent-exporter-prometheus-all-metrics.png)

#### Rates for individual line length buckets
![](/images/ocagent-exporter-prometheus-line_lengths-rate.png)

#### p99th latencies
![](/images/ocagent-exporter-prometheus-p99-latency.png)

#### Rates for line counts
![](/images/ocagent-exporter-prometheus-line_counts-rate.png)

### References

Resource|URL
---|---
Prometheus project home|https://prometheus.io
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
