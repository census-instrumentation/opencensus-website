---
title: "Wavefront"
weight: 3
draft: false
date: 2019-04-20T04:26:03.339Z
aliases: [/supported-exporters/go/wavefront, /guides/exporters/supported-exporters/go/wavefront]
logo: /img/partners/wavefront_logo.svg
---

- [Introduction](#introduction)
- [Requirements](#requirements)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

## Introduction
[Wavefront](https://www.wavefront.com/) is a cloud-native monitoring and analytics platform that delivers 3D observability by ingesting, analyzing and visualizing metrics, traces, and histograms from distributed applications, containers, microservices, and any clouds infrastructure.  To learn more, check out Wavefront distributed tracing demo [here](https://www.youtube.com/watch?v=mKRuhqJndpw).

The Go exporter is available at [https://github.com/wavefrontHQ/opencensus-exporter](https://github.com/wavefrontHQ/opencensus-exporter)

## Requirements
You'll need a Wavefront account. Sign-up [here](https://www.wavefront.com/sign-up/).

## Creating the exporter
The exporter uses [Wavefront SDKs](https://docs.wavefront.com/wavefront_sdks.html) to connect to Wavefront. <br/>
Instructions to use the Go SDK are [here](https://github.com/wavefrontHQ/wavefront-sdk-go#usage).

{{<tabs Stats Tracing All>}}
{{<highlight go>}}
package main

import (
    "log"

	"github.com/wavefronthq/opencensus-exporter/wavefront"
	"github.com/wavefronthq/wavefront-sdk-go/senders"
	"go.opencensus.io/stats/view"
)

func main() {
    sender, _ := senders.NewProxySender(&senders.ProxyConfiguration{})
    wf, err := wavefront.NewExporter(sender,/*options*/)
    if err != nil {
        log.Fatalf("Failed to create Wavefront Exporter: %v",err)
    }
    
    // Flush before main exits
    defer func() {
		exporter.Stop()
		sender.Close()
	}()

    // Register it as a metrics exporter
    view.RegisterExporter(wf)
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
    "log"

	"github.com/wavefronthq/opencensus-exporter/wavefront"
	"github.com/wavefronthq/wavefront-sdk-go/senders"
	"go.opencensus.io/trace"
)

func main() {
    sender, _ := senders.NewProxySender(&senders.ProxyConfiguration{})
    wf, err := wavefront.NewExporter(sender,/*options*/)
    if err != nil {
        log.Fatalf("Failed to create Wavefront Exporter: %v",err)
    }
    
    // Flush before main exits
    defer func() {
		exporter.Stop()
		sender.Close()
	}()

    // Register it as a trace exporter
    trace.RegisterExporter(wf)
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
    "log"

	"github.com/wavefronthq/opencensus-exporter/wavefront"
	"github.com/wavefronthq/wavefront-sdk-go/senders"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

func main() {
    sender, _ := senders.NewProxySender(&senders.ProxyConfiguration{})
    wf, err := wavefront.NewExporter(sender,/*options*/)
    if err != nil {
        log.Fatalf("Failed to create Wavefront Exporter: %v",err)
    }
    
    // Flush before main exits
    defer func() {
		exporter.Stop()
		sender.Close()
	}()

    // Register it as a metrics exporter
    view.RegisterExporter(wf)

    // Register it as a trace exporter
    trace.RegisterExporter(wf)
}
{{</highlight>}}
{{</tabs>}}

## Viewing your Metrics
Learn more at [Wavefront Docs - Getting Started](https://docs.wavefront.com/tutorial_getting_started.html#review-sample-dashboards-and-metrics)

## Viewing your Traces
Learn more at [Wavefront Docs - Tracing UI Overview](https://docs.wavefront.com/tracing_ui_overview.html)