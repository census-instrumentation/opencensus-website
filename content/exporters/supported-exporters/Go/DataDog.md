---
title: "Datadog (Stats and Tracing)"
date: 2018-07-21T14:27:35-07:00
draft: false
weight: 3
class: "resized-logo"
aliases: [/supported-exporters/go/datadog, /guides/exporters/supported-exporters/go/datadog]
logo: /img/partners/datadog_logo.svg
---

- [Introduction](#introduction)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

## Introduction
[Datadog](https://www.datadoghq.com/) is a real-time monitoring system that supports distributed tracing and monitoring.

Its OpenCensus Go exporter is available at [https://godoc.org/github.com/Datadog/opencensus-go-exporter-datadog](https://godoc.org/github.com/Datadog/opencensus-go-exporter-datadog)


## Creating the exporter

To create the exporter, we'll need:
* Datadog credentials which you can get from [Here](https://docs.datadoghq.com/getting_started/)
* Create an exporter in code

This is possible by importing the exporter

{{<highlight go>}}
import "github.com/Datadog/opencensus-go-exporter-datadog"

// then create the actual exporter
dd := datadog.NewExporter(datadog.Options{})
{{</highlight>}}

and then to add stats, tracing and then collectively

{{<tabs Stats Tracing All>}}
{{<highlight go>}}
package main

import (
  "log"

  "github.com/Datadog/opencensus-go-exporter-datadog"
  "go.opencensus.io/stats/view"
)

func main() {
  dd, err := datadog.NewExporter(datadog.Options{})
  if err != nil {
    log.Fatalf("Failed to create the Datadog exporter: %v", err)
  }
  // It is imperative to invoke flush before your main function exits
  defer dd.Stop()

  // Register it as a metrics exporter
  view.RegisterExporter(dd)
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
   "log"

  "github.com/Datadog/opencensus-go-exporter-datadog"
  "go.opencensus.io/trace"
)

func main() {
  dd, err := datadog.NewExporter(datadog.Options{})
  if err != nil {
    log.Fatalf("Failed to create the Datadog exporter: %v", err)
  }
  // It is imperative to invoke flush before your main function exits
  defer dd.Stop()

  // Register it as a metrics exporter
  trace.RegisterExporter(dd)

  // Allow Datadog to calculate APM metrics and do the sampling.
  trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
  "log"

  "github.com/Datadog/opencensus-go-exporter-datadog"
  "go.opencensus.io/stats/view"
  "go.opencensus.io/trace"
)

func main() {
  dd, err := datadog.NewExporter(datadog.Options{})
  if err != nil {
    log.Fatalf("Failed to create the Datadog exporter: %v", err)
  }
  // It is imperative to invoke flush before your main function exits
  defer dd.Stop()

  // Register it as a metrics exporter
  view.RegisterExporter(sd)

  // Register it as a metrics exporter
  trace.RegisterExporter(dd)

  // Allow Datadog to calculate APM metrics and do the sampling.
  trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
}
{{</highlight>}}
{{</tabs>}}

## Viewing your metrics
Please visit [https://docs.datadoghq.com/graphing/](https://docs.datadoghq.com/graphing/)

## Viewing your traces
Please visit [https://docs.datadoghq.com/tracing/](https://docs.datadoghq.com/tracing/)
