---
title: "New Relic (Stats and Tracing)"
date: 2010-01-26
draft: false
weight: 3
class: "resized-logo"
aliases: [/supported-exporters/go/newrelic, /guides/exporters/supported-exporters/go/newrelic]
logo: /img/partners/newrelic_logo.svg
---

- [Introduction](#introduction)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

## Introduction
[New Relic](https://www.newrelic.com/) is a real-time monitoring system that supports distributed tracing and monitoring.

Its OpenCensus Go exporter is available at [https://github.com/newrelic/newrelic-opencensus-exporter-go](https://github.com/newrelic/newrelic-opencensus-exporter-go)

## Installation

To install, just go get this package with

`$ go get -u github.com/newrelic/newrelic-opencensus-exporter-go`


## Creating the exporter

The `nrcensus` package provides an exporter for sending OpenCensus stats and traces to New Relic.

To use, simply instantiate a new Exporter using `nrcensus.NewExporter` with your service name and Insights API key and register it with the OpenCensus view and/or trace API.

```go
package main

import (
    "github.com/newrelic/newrelic-opencensus-exporter-go/nrcensus"
    "go.opencensus.io/stats/view"
    "go.opencensus.io/trace"
)

func main() {
    exporter, err := nrcensus.NewExporter("My-OpenCensus-App", "__YOUR_NEW_RELIC_INSIGHTS_API_KEY__")
    if err != nil {
        panic(err)
    }
    view.RegisterExporter(exporter)
    trace.RegisterExporter(exporter)

    // create stats, traces, etc
}
```

## Viewing your metrics
Please visit [https://docs.newrelic.com/docs/data-ingest-apis/get-data-new-relic/metric-api/view-query-you-metric-data](https://docs.newrelic.com/docs/data-ingest-apis/get-data-new-relic/metric-api/view-query-you-metric-data)

## Viewing your traces
Please visit [https://docs.newrelic.com/docs/apis/graphql-api/tutorials/nerdgraph-graphiql-distributed-trace-data-tutorial](https://docs.newrelic.com/docs/apis/graphql-api/tutorials/nerdgraph-graphiql-distributed-trace-data-tutorial)