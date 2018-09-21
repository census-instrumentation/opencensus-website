---
title: "Honeycomb.io (Tracing)"
date: 2018-09-19
draft: false
weight: 3
class: "resized-logo"
aliases: [/supported-exporters/go/honeycomb]
logo: /img/honeycomb-logo.jpg
---

- [Introduction](#introduction)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [Project link](#project-link)

## Introduction

[Honeycomb](www.honeycomb.io) is a hosted service for debugging your software in production. Capture traces or individual events, then speedily slice and dice your data to uncover patterns, find outliers, and understand historical trends.

Honeycomb Tracing offers an unparalleled ability to run high-level queries in order to identify which traces are worth investigating, before digging deep into the details of an individual exemplar trace. Easily go from insights on your application from a bird's eye view, to a classic waterfall view of a specific trace, and back. For a walkthrough of this flow in action, [visit our blog](https://www.honeycomb.io/blog/2018/07/there-and-back-again-a-honeycomb-tracing-story/).

Its OpenCensus Go exporter is available at [https://github.com/honeycombio/opencensus-exporter](https://github.com/honeycombio/opencensus-exporter)

## Creating the exporter

To create the exporter, we'll need to:

- Create an exporter in code
- Pass in your Honeycomb API key, found on your Honeycomb Team Settings page. ([Sign up for free](https://ui.honeycomb.io/signup) if you haven’t already!)
- Pass in your Honeycomb dataset name

{{<highlight go>}}
package main

import (
"log"

    honeycomb "github.com/honeycombio/opencensus-exporter/honeycomb"
    "go.opencensus.io/trace"

)

func main() {
exporter := honeycomb.NewExporter("YOUR-HONEYCOMB-WRITE-KEY", "YOUR-DATASET-NAME")
defer exporter.Close()

    trace.RegisterExporter(exporter)

}
{{</highlight>}}

## Viewing your traces

Please visit [the Honeycomb UI](https://ui.honeycomb.io/) to view your traces.

Learn more about exploring your trace data [here](https://docs.honeycomb.io/working-with-data/tracing/explore-trace-data/), or play around with some of our data [here](play.honeycomb.io/tracing).

## Project link

You can find out more about Honeycomb at [https://www.honeycomb.io/](https://www.honeycomb.io/)
