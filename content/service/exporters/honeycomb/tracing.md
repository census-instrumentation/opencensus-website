---
title: "Traces"
date: 2019-06-10T18:25:17-08:00
aliases: [/agent/exporters/honeycomb/traces]
logo: /img/honeycomb-logo.jpg
---

- [Introduction](#introduction)
- [Configuration](#configuration)
  - [Format](#format)
  - [Example](#example)
- [References](#references)

### Introduction

The OpenCensus Service allows one to export traces to Honeycomb.

### Configuration

In the Service's YAML configuration file, under section "exporters" and sub-section "honeycomb", please configure these fields:

#### Format

```yaml
exporters:
  honeycomb:
    write_key: "<WRITE_KEY>"
    dataset_name: "<DATASET_NAME>"
```

#### Example

```yaml
# Saved in oca.yaml
exporters:
  honeycomb:
    write_key: "31a73983-3bf9-4d85-8dd0-2e87296abafa"
    dataset_name: "aero9_p95"
```

#### End to End example

In this end-to-end example, we'll have the OpenCensus Service running and a Go application that uses the Go ocagent-exporter to send traces to the OpenCensus Service and then to Honeycomb

##### Add Honeycomb to the config.yaml file

In `ocagent/config.yaml`

```yaml
exporters:
  honeycomb:
    write_key: "<WRITE_KEY>"
    dataset_name: "<DATASET_NAME>"
```

##### Run the OpenCensus Service Agent

In `opencensus-service/cmd/ocagent`, run start the agent

```
GO111MODULE=on go run github.com/census-instrumentation/opencensus-service/cmd/ocagent
```

##### Run the OpenCensus Service example application

In `opencensus-service`, start the example app

```
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

##### Results

On navigating to [Honeycomb](ui.honeycomb.io), you should see your trace data.

![Honeycomb UI with OpenCensus Agent Traces](/img/Honeycomb_OCAgent_Data.png "Honeycomb OCAgent Traces")

### References

| Resource              | URL                                                |
| --------------------- | -------------------------------------------------- |
| Honeycomb homepage    | https://www.honeycomb.io/                          |
| Honeycomb Go exporter | https://github.com/honeycombio/opencensus-exporter |
