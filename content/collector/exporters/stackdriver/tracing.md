---
title: "Trace"
date: 2019-02-13T19:13:58-08:00
logo: /images/stackdriver-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
- [References](#references)

### Introduction

The OpenCensus Collector allows you to export traces that are collected from client libraries and [receivers](/collector/receivers) to Stackdriver.

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
    enable_tracing: <true or false>
```

### References

Resource|URL
---|---
Stackdriver Trace home|https://cloud.google.com/trace/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
