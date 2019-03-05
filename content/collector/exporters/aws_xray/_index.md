---
title: "AWS X-Ray"
date: 2019-02-14T18:49:58-08:00
logo: /images/aws_xray-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
- [References](#references)


### Introduction
The OpenCensus Collector allows one to export traces to AWS X-Ray

### Configuration

In the Collector's YAML configuration file, under section "exporters" and sub-section "aws-xray" configure fields: 

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
    default_service_name: "opencensus"
    version: "latest"
    buffer_size: 200
```

Resource|URL
---|---
AWS X-Ray homepage|https://aws.amazon.com/xray/
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
