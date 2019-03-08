---
title: "Apache Kafka"
date: 2019-02-14T13:00:58-08:00
aliases: [/agent/exporters/kafka]
logo: /images/kafka-logo.png
---

- [Introduction](#introduction)
- [Configuration](#configuration)
    - [Format](#format)
    - [Example](#example)
- [References](#references)

### Introduction

The OpenCensus Kafka exporter allows you to export traces to [Apache
Kafka](https://kafka.apache.org/). This massively helps when processing data
from high traffic apps but you'd like to do specialized batch post processing.

### Configuration

In the Service's YAML configuration file, under section "exporters" and sub-section "kafka", please configure these fields:

#### Format
```yaml
exporters:
  kafka:
    brokers: ["<broker>", "<broker>", ...]
    topic: "topic"
```

#### Example
```yaml
exporters:
  kafka:
   brokers: ["48ed0cc3-cce9-4ed2-ac6c-41f8b89b5878", "c5c0612e-4141-4201-b70f-c565910c8f0a"]
   topic: "cluster-spans"
```

### References
Resource|URL
---|---
Apache Kafka project home|https://kafka.apache.org/
