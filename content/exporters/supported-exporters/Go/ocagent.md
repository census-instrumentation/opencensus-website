---
title: "OpenCensus Agent"
weight: 1
draft: false
date: 2019-02-11T14:00:54-08:00
logo: /images/opencensus-logo.png
---

- [Introduction](#introduction)
- [Purpose](#purpose)
- [Imports and initialization](#imports-and-initialization)
- [Options](#options)
    - [Custom address](#custom-address)
    - [Insecure](#insecure)
    - [Service name](#service-name)
    - [Reconnection period](#reconnection-period)
- [Enabling stats exporting](#enabling-stats-exporting)
- [Enabling trace exporting](#enabling-trace-exporting)
- [End to end example](#end-to-end-example)
- [References](#references)

### Introduction
The OpenCensus Agent exporter aka "ocagent-exporter" enables Go applications to send the observability
that they've collected using OpenCensus to the [OpenCensus Agent](https://github.com/census-instrumentation/opencensus-service)

This exporter connects and sends observability signals via a single HTTP/2 stream and gRPC with Protocol Buffers
to the OpenCensus Agent. If unspecified, this exporter tries to connect to the OpenCensus Agent on port `55678`.

### Purpose
It converts OpenCensus Stats and Traces into OpenCensus Proto Metrics and Traces which are then sent to the OpenCensus Agent.
Therefore programs no longer have to enable the traditional backends' exporters for every single application.

For example, some backends like Prometheus require opening a unique port per application. This port is what they'll pull stats from.
If you have 10,000 microservices that all each export to Prometheus, you already have to manually and uniquely create
at least 10,000 unique ports. Uniquely creating a port will not only exhaust your file descriptors but it also becomes
cumbersome and error prone to do.

With the ocagent-exporter, instead the stats are uploaded to the OpenCensus Agent and from there,
the agent is singly scraped by Prometheus.

As you can see from above, this not only scales your application's resource allocation but also scales your development speed
and liberates you from complex batching deployments. It also ensures that your applications can be kept light, that the agent's
deployment can safely be restarted flexibly.

The same thing happens for traces.

### Imports and initialization

The exporter's import path is "contrib.go.opencensus.io/exporter/ocagent".

An exporter can be started by invoking `ocagent.New`, whose signature is:
{{<highlight go>}}
func NewExporter(opts ...ExporterOption) (*Exporter, error)
{{</highlight>}}

Below is a full example of the simplest end-to-end initialization:
{{<highlight go>}}
package main

import (
	"log"

	"contrib.go.opencensus.io/exporter/ocagent"
)

func main() {
	oce, err := ocagent.NewExporter()
	if err != nil {
		log.Fatalf("Failed to create a new ocagent exporter: %v", err)
	}
	// Before the program stops, please
	// remember to stop  the exporter.
	defer oce.Stop()
}
{{</highlight>}}

### Options
Options allow you to customize the exporter.
The function signature for New allows optional functional options.
{{<highlight go>}}
func NewExporter(opts ...ExporterOption) (*Exporter, error)
{{</highlight>}}

#### Custom address
This option allows one to talk to an OpenCensus Agent running on a customized address.
The customized address could be anything that is resolvable by [net.LookupAddr](https://golang.org/pkg/net/#LookupAddr)

{{<highlight go>}}
        oce, err := ocagent.NewExporter(
                // WithAddress takes in any value that can be resolved
                // by invoking net.Lookup https://golang.org/pkg/net/#LookupAddr
                ocagent.WithAddress("<my_host>:<myport>"))
{{</highlight>}}

#### Insecure
This option allows one to talk to the OpenCensus Agent without mutual TLS.

[WithInsecure](https://godoc.org/contrib.go.opencensus.io/exporter/ocagent/#WithInsecure) is akin to [grpc.WithInsecure](https://godoc.org/google.golang.org/grpc/#WithInsecure)

It can be enabled like this
{{<highlight go>}}
        oce, err := ocagent.NewExporter(
                // WithInsecure is akin to  grpc.WithInsecure()
                ocagent.WithInsecure())
{{</highlight>}}

#### Service name
This option allows one to set the service name of the caller by using [WithServiceName](https://godoc.org/contrib.go.opencensus.io/exporter/ocagent#WithServiceName)

It can be enabled like this
{{<highlight go>}}
        oce, err := ocagent.NewExporter(ocagent.WithServiceName("with-service-name"))
{{</highlight>}}

#### Reconnection period
This option defines the amount of time for a failed connection, that the exporter takes before a reconnection attempt to the agent.

[WithReconnectionPeriod](https://godoc.org/contrib.go.opencensus.io/exporter/ocagent#WithReconnectionPeriod) is the option's name.

Here is an example for how to tell it to attempt reconnecting on fail, after 10 seconds.
{{<highlight go>}}
        oce, err := ocagent.NewExporter(ocagent.WithReconnectionPeriod(10 * time.Second))
{{</highlight>}}

### Enabling stats exporting

This exporter implements OpenCensus-Go's [view.Exporter](https://godoc.org/go.opencensus.io/stats/view#Exporter)

This allows it to receive stats emitted by OpenCensus-Go and upload them to the agent. It can be enabled by
{{<highlight go>}}
import "go.opencensus.io/stats/view"

func main() {
        view.RegisterExporter(oce)
}
{{</highlight>}}

### Enabling trace exporting

This exporter implements OpenCensus-Go's [trace.Exporter](https://godoc.org/go.opencensus.io/trace#Exporter)

This allows it to receive stats emitted by OpenCensus-Go and upload them to the agent. It can be enabled by
{{<highlight go>}}
import "go.opencensus.io/trace"

func main() {
        trace.RegisterExporter(oce)
}
{{</highlight>}}

### End to end Example

This end to end example exports stats and traces to the agent. It will require you to deploy the [OpenCensus-Agent](https://github.com/census-instrumentation/opencensus-service) in order to examine the stats and traces.

{{<highlight go>}}
package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"contrib.go.opencensus.io/exporter/ocagent"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
	"go.opencensus.io/trace"
	"go.opencensus.io/zpages"
)

func main() {
	// For the purposes of debugging, we'll add zPages that you can
	// use as a diagnostic to examine if stats and traces are exported
	// out. You can learn about using zPages at https://opencensus.io/zpages/go/
	zPagesMux := http.NewServeMux()
	zpages.Handle(zPagesMux, "/debug")
	go func() {
		if err := http.ListenAndServe(":9999", zPagesMux); err != nil {
			log.Fatalf("Failed to serve zPages")
		}
	} ()

	oce, err := ocagent.NewExporter(
		ocagent.WithInsecure(),
		ocagent.WithReconnectionPeriod(5 * time.Second),
		ocagent.WithAddress("localhost:55678"), // Only included here for demo purposes.
		ocagent.WithServiceName("ocagent-go-example"))
	if err != nil {
		log.Fatalf("Failed to create ocagent-exporter: %v", err)
	}
	trace.RegisterExporter(oce)
	view.RegisterExporter(oce)

	// Some configurations to get observability signals out.
	view.SetReportingPeriod(7 * time.Second)
	trace.ApplyConfig(trace.Config{
		DefaultSampler: trace.AlwaysSample(),
	})

	// Some stats
	keyClient, _ := tag.NewKey("client")
	keyMethod, _ := tag.NewKey("method")

	mLatencyMs := stats.Float64("latency", "The latency in milliseconds", "ms")
	mLineLengths := stats.Int64("line_lengths", "The length of each line", "By")

	views := []*view.View{
		{
			Name:        "opdemo/latency",
			Description: "The various latencies of the methods",
			Measure:     mLatencyMs,
			Aggregation: view.Distribution(0, 10, 50, 100, 200, 400, 800, 1000, 1400, 2000, 5000, 10000, 15000),
			TagKeys:     []tag.Key{keyClient, keyMethod},
		},
		{
			Name:        "opdemo/process_counts",
			Description: "The various counts",
			Measure:     mLatencyMs,
			Aggregation: view.Count(),
			TagKeys:     []tag.Key{keyClient, keyMethod},
		},
		{
			Name:        "opdemo/line_lengths",
			Description: "The lengths of the various lines in",
			Measure:     mLineLengths,
			Aggregation: view.Distribution(0, 10, 20, 50, 100, 150, 200, 500, 800),
			TagKeys:     []tag.Key{keyClient, keyMethod},
		},
		{
			Name:        "opdemo/line_counts",
			Description: "The counts of the lines in",
			Measure:     mLineLengths,
			Aggregation: view.Count(),
			TagKeys:     []tag.Key{keyClient, keyMethod},
		},
	}

	if err := view.Register(views...); err != nil {
		log.Fatalf("Failed to register views for metrics: %v", err)
	}

	ctx, _ := tag.New(context.Background(), tag.Insert(keyMethod, "repl"), tag.Insert(keyClient, "cli"))
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	for {
		startTime := time.Now()
		_, span := trace.StartSpan(context.Background(), "Foo")
		var sleep int64
		switch modulus := time.Now().Unix() % 5; modulus {
		case 0:
			sleep = rng.Int63n(17001)
		case 1:
			sleep = rng.Int63n(8007)
		case 2:
			sleep = rng.Int63n(917)
		case 3:
			sleep = rng.Int63n(87)
		case 4:
			sleep = rng.Int63n(1173)
		}

		time.Sleep(time.Duration(sleep) * time.Millisecond)

		span.End()
		latencyMs := float64(time.Since(startTime)) / 1e6
		nr := int(rng.Int31n(7))
		for i := 0; i < nr; i++ {
			randLineLength := rng.Int63n(999)
			stats.Record(ctx, mLineLengths.M(randLineLength))
			fmt.Printf("#%d: LineLength: %dBy\n", i, randLineLength)
		}
		stats.Record(ctx, mLatencyMs.M(latencyMs))
		fmt.Printf("Latency: %.3fms\n", latencyMs)
	}
}
{{</highlight>}}

### References

Resource|URL
---|---
ocagent Godoc|[contrib.go.opencensus.io/exporter/ocagent](https://godoc.org/contrib.go.opencensus.io/exporter/ocagent)
Source code|[ocagent-exporter on Github](https://github.com/census-ecosystem/opencensus-go-exporter-ocagent)
OpenCensus Agent|[OpenCensus Agent on Github](https://github.com/census-instrumentation/opencensus-service)
net.LookupAddr|[net.LookupAddr](https://golang.org/pkg/net/#LookupAddr)
grpc Go|[grpc GoDoc](https://godoc.org/google.golang.org/grpc)
