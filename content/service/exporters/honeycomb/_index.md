---
title: "Honeycomb"
date: 2019-02-17T22:57:58-08:00
aliases: [/agent/exporters/honeycomb]
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

### References
Resource|URL
---|---
Honeycomb homepage|https://www.honeycomb.io/
