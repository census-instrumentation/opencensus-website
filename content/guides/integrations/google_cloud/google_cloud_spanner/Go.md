---
title: "Go"
date: 2018-07-24T15:14:00-07:00
draft: false
weight: 3
class: "resized-logo"
aliases: [/integrations/google_cloud_spanner/go, /guides/integrations/google_cloud_spanner/go]
logo: /images/gopher.png
---

- [Introduction](#introduction)
- [Packages to import](#packages-to-import)
- [Enable metric reporting](#register-views)
    - [Register client metric views](#register-client-metric-views)
    - [Register server metric views](#register-server-metric-views)
    - [Exporting traces and metrics](#exporting-traces-and-metrics)
    - [End to end code sample](#end-to-end-code-sample)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

## Introduction
Cloud Spanner's Go package was already instrumented for:

* Tracing with OpenCensus
* Metrics with OpenCensus by way of gRPC metrics

{{% notice note %}}
This guide makes use of a couple of APIs

API|Guided codelab
---|---
Spanner|[Spanner codelab](/codelabs/spanner)
Stackdriver |[Stackdriver codelab](/codelabs/stackdriver)
{{% /notice %}}

## Packages to import

For tracing and metrics on Spanner, we'll import a couple of packages

Package Name|Package link
---|---
The Cloud Spanner Go package|[cloud.google.com/go/spanner](https://godoc.org/cloud.google.com/go/spanner)
The OpenCensus trace package|[go.opencensus.io/trace](https://godoc.org/go.opencensus.io/trace)
The OpenCensus metrics views package|[go.opencensus.io/stats](https://godoc.org/go.opencensus.io/stats)
The OpenCensus gRPC plugin|[go.opencensus.io/plugin/ocgrpc](https://godoc.org/go.opencensus.io/plugin/ocgrpc)

And when imported in code
{{<highlight go>}}
import (
    "cloud.google.com/spanner"
    "go.opencensus.io/plugin/ocgrpc"
    "go.opencensus.io/stats"
    "go.opencensus.io/stats/view"
)
{{</highlight>}}

Install these packages with the commands
```bash
go get -u cloud.google.com/go/...
go get -u go.opencensus.io/...
go get -u contrib.go.opencensus.io/exporter/stackdriver
```

## Enable metric reporting

To enable metric reporting/exporting, we need to enable a metrics exporter, but before that we'll need
to register and enable the views that match the metrics to collect. For a complete list of the available views
available please visit [https://godoc.org/go.opencensus.io/plugin/ocgrpc](https://godoc.org/go.opencensus.io/plugin/ocgrpc)

However, for now we'll split them into client and server views

### Register client metric views
{{<highlight go>}}
if err := view.Register(ocgrpc.DefaultClientViews...); err != nil {
    log.Fatalf("Failed to register gRPC client views: %v", err)
}
{{</highlight>}}

### Register server metric views
{{<highlight go>}}
if err := view.Register(ocgrpc.DefaultServerViews...); err != nil {
    log.Fatalf("Failed to register gRPC server views: %v", err)
}
{{</highlight>}}

### Exporting traces and metrics
The last step is to enable trace and metric exporting. For that we'll use say [Stackdriver Exporter](/supported-exporters/go/stackdriver) or
any of the  [Go exporters](/supported-exporters/go/)

### End to end code sample
With all the steps combined, we'll finally have this code snippet
{{<highlight go>}}
package main

import (
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/spanner"
	"golang.org/x/net/context"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

type Player struct {
	FirstName string `spanner:"first_name"`
	LastName  string `spanner:"last_name"`
	UUID      string `spanner:"uuid"`
	Email     string `spanner:"email"`
}

func main() {
	se, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    "census-demos",
		MetricPrefix: "spanner-oc-demo",
	})
	if err != nil {
		log.Fatalf("StatsExporter err: %v", err)
	}
	// Let's ensure that the Stackdriver exporter uploads all its data before the program exits
	defer se.Flush()

	// Enable tracing
	trace.RegisterExporter(se)

	// Enable metrics collection
	view.RegisterExporter(se)

	// Register all the gRPC client views
	if err := view.Register(ocgrpc.DefaultClientViews...); err != nil {
		log.Fatalf("Failed to register gRPC default client views for metrics: %v", err)
	}
	// Register all the gRPC server views
	if err := view.Register(ocgrpc.DefaultServerViews...); err != nil {
		log.Fatalf("Failed to register gRPC default server views for metrics: %v", err)
	}

	// Enable the trace sampler.
	// We are always sampling for demo purposes only: it is very high
	// depending on the QPS, but sufficient for the purpose of this quick demo.
	// More realistically perhaps tracing 1 in 10,000 might be more useful
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	ctx := context.Background()

	// The database must exist
	databaseName := "projects/census-demos/instances/census-demos/databases/demo1"
	sessionPoolConfig := spanner.SessionPoolConfig{MinOpened: 5, WriteSessions: 1}
	client, err := spanner.NewClientWithConfig(ctx, databaseName, spanner.ClientConfig{SessionPoolConfig: sessionPoolConfig})
	if err != nil {
		log.Fatalf("SpannerClient err: %v", err)
	}
	defer client.Close()

	// Warm up the spanner client session. In normal usage
	// you'd have hit this point after the first operation.
	_, _ = client.Single().ReadRow(ctx, "Players", spanner.Key{"foo@gmail.com"}, []string{"email"})

	for i := 0; i < 3; i++ {
		ctx, span := trace.StartSpan(ctx, "create-players")

		players := []*Player{
			{FirstName: "Poke", LastName: "Mon", Email: "poke.mon@example.org", UUID: "f1578551-eb4b-4ecd-aee2-9f97c37e164e"},
			{FirstName: "Go", LastName: "Census", Email: "go.census@census.io", UUID: "540868a2-a1d8-456b-a995-b324e4e7957a"},
			{FirstName: "Quick", LastName: "Sort", Email: "q.sort@gmail.com", UUID: "2b7e0098-a5cc-4f32-aabd-b978fc6b9710"},
		}
		up := fmt.Sprintf("%d-%d.", i, time.Now().Unix())
		for _, player := range players {
			player.Email = up + player.Email
		}

		if err := newPlayers(ctx, client, players...); err != nil {
			log.Printf("Creating newPlayers err: %v", err)
		}
		span.End()
	}
}

func newPlayers(ctx context.Context, client *spanner.Client, players ...*Player) error {
	var ml []*spanner.Mutation
	for _, player := range players {
		m, err := spanner.InsertStruct("Players", player)
		if err != nil {
			return err
		}
		ml = append(ml, m)
	}
	_, err := client.Apply(ctx, ml)
	return err
}
{{</highlight>}}

Before running the code create the schema in the cloud console. Navigate to 
Spanner | Instance name | Database name and click on **Create table**. Select
**Edit as text** and enter the text below

```bash
CREATE TABLE Players (
  email STRING(1024) NOT NULL,
  first_name STRING(1024) NOT NULL,
  last_name STRING(1024) NOT NULL,
  uuid STRING(1024))
PRIMARY KEY (email)
```

## Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

## Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
