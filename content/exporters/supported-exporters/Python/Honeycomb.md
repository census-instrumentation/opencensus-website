---
title: "Honeycomb.io (Tracing)"
date: 2019-03-19T20:20:07-07:00
draft: false
weight: 3
class: "resized-logo"
aliases: [/guides/exporters/supported-exporters/python/honeycomb]
logo: /img/honeycomb-logo.jpg
---

- [Introduction](#introduction)
- [Installing the exporter](#installing-the-exporter)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [References](#references)

## Introduction

[Honeycomb](https://www.honeycomb.io) is a service for debugging your software in production. Capture traces or individual events, then speedily slice and dice your data to uncover patterns, find outliers, and understand historical trends.

Its OpenCensus Python exporter is available at [https://github.com/codeboten/ochoneycomb](https://github.com/codeboten/ochoneycomb)

## Installing the exporter
The Honeycomb Python exporter can be installed from pip by
```shell
pip install ochoneycomb
```

## Creating the exporter

To create the exporter, we'll need to:

- Create an exporter in code
- Pass in your Honeycomb API key, found on your Honeycomb Team Settings page. ([Sign up for free](https://ui.honeycomb.io/signup) if you haven’t already!)
- Pass in your Honeycomb dataset name

{{<highlight python>}}
import os
import time

from ochoneycomb import HoneycombExporter
from opencensus.trace.tracer import Tracer

exporter = HoneycombExporter(
    writekey=os.getenv("HONEYCOMB_WRITEKEY"),
    dataset=os.getenv("HONEYCOMB_DATASET"),
    service_name="test-app")
tracer = Tracer(exporter=exporter)

def do_something_to_trace():
    time.sleep(1)

# Example for creating nested spans
with tracer.span(name="span1") as span1:
    do_something_to_trace()
    with tracer.span(name="span1_child1") as span1_child1:
        span1_child1.add_annotation("something")
        do_something_to_trace()
    with tracer.span(name="span1_child2") as span1_child2:
        do_something_to_trace()

with tracer.span(name="span2") as span2:
    do_something_to_trace()
{{</highlight>}}

## Viewing your traces

Please visit [the Honeycomb UI](https://ui.honeycomb.io/) to view your traces.

Learn more about exploring your trace data [here](https://docs.honeycomb.io/working-with-data/tracing/explore-trace-data/).

## References

Resource|URL
---|---
Honeycomb exporter on pip|https://pypi.org/project/ochoneycomb/
Honeycomb exporter on Github|https://github.com/codeboten/ochoneycomb
