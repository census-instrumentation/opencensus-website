---
title: "Metrics"
date: 2019-02-13T16:14:17-08:00
logo: /images/stackdriver-monitoring-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
- [References](#references)

### Introduction

The OpenCensus Collector allows you to export metrics that are collected from client libraries and [receivers](/collector/receivers) to Stackdriver.

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

### Configuration

In the Collector's YAML configuration file, under section "exporters" and sub-section "stackdriver" and configure
fields:

#### Format

```yaml
exporters:
  stackdriver:
    project: "<google_cloud_platform_project_id>"
    metric_prefix: "<your_metric_prefix>"
    enable_metrics: <true or false>
```

Resource|URL
---|---
Stackdriver Monitoring home|https://cloud.google.com/monitoring/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
