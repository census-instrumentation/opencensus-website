---
title: "Jaeger"
date: 2019-02-14T00:01:21-08:00
logo: /images/jaeger-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
- [References](#references)


### Introduction

The OpenCensus Collector allows one to export traces to Jaeger by sending traces to Jaeger's collector endpoint.

### Configuration

In the Collector's YAML configuration file, under section "exporters" and sub-section "jaeger" configure fields:

#### Format
```yaml
exporters:
  jaeger:
    service-name: "<service_name>"
    collector-endpoint: "<endpoint_url_of_the_jaeger_server>"
    username: "<the_optional_username_to_access_your_collector>"
    password: "<the_optional_password_to_access_your_collector>"
```

#### Example
```yaml
exporters:
  jaeger:
    service-name: "agent_j"
    collector-endpoint: "http://localhost:14268/api/traces"
```
### References

Resource|URL
---|---
Jaeger project home|https://www.jaegertracing.io
Go ocagent-exporter demo|[ocagent-demo](/exporters/supported-exporters/go/ocagent/#end-to-end-example)
