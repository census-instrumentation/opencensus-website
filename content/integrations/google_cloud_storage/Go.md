---
title: "Go"
date: 2018-07-24T23:19:00-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/images/gopher.png)

{{% notice note %}}
This guide makes use of a couple of APIs

API|Guided codelab
---|---
Storage |[Storage codelab](/codelabs/storage)
Stackdriver |[Stackdriver codelab](/codelabs/stackdriver)
{{% /notice %}}

Google Cloud Storage (GCS) is a unified object storage for developers and enterprises, managed by Google.
For more information you can read about it here and get started [Storage docs](https://godoc.org/cloud.google.com/go/storage/docs)

Cloud Storage 's Go package was already instrumented for:

* Tracing with OpenCensus

## Table of contents
- [Packages to import](#packages-to-import)
- [Technical detour](#technical-detour)
- [Enable tracing](#enable-tracing)
- [End to end code sample](#end-to-end-code-sample)
- [Viewing your traces](#viewing-your-traces)

#### Packages to import

For tracing and metrics on Spanner, we'll import a couple of packages

Package Name|Package link
---|---
The Cloud Storage Go package|[cloud.google.com/storage](https://godoc.org/cloud.google.com/go/storage)
The OpenCensus trace package|[go.opencensus.io/trace](https://godoc.org/go.opencensus.io/trace)
The OpenCensus stats packages|[go.opencensus.io/stats](https://godoc.org/go.opencensus.io/stats)
The OpenCensus HTTP plugin package|[go.opencensus.io/plugin/ochttp](https://godoc.org/go.opencensus.io/plugin/ochttp)

And when imported in code
{{<highlight go>}}
import (
    "cloud.google.com/storage"

    "go.opencensus.io/plugin/ochttp"
    "go.opencensus.io/stats/view"
    "go.opencensus.io/trace" 
)
{{</highlight>}}

#### Technical detour

Because GCS uses HTTP to connect to Google's backend, we'll need to enable metrics and tracing using a custom client
for GCP uploads. The custom client will have an `ochttp` enabled transport and then the rest is simple

##### Setting up the ochttp enabled transport

{{<highlight go>}}
import (
    "context"
    "net/http"

    "go.opencensus.io/plugin/ochttp"
)

hc := &http.Client{Transport: new(ochttp.Transport)}
gcsClient := storage.NewClient(context.Background())
{{</highlight>}}

#### Enable metric reporting

To enable metric reporting/exporting, we need to enable a metrics exporter, but before that we'll need
to register and enable the views that match the HTTP metrics to collect. For a complete list of the available views
available please visit [https://godoc.org/go.opencensus.io/plugin/ochttp](https://godoc.org/go.opencensus.io/plugin/ochttp)

However, for now we'll split them into client and server views

##### Register client metric views
{{<highlight go>}}
if err := view.Register(ochttp.DefaultClientViews...); err != nil {
    log.Fatalf("Failed to register HTTP client views: %v", err)
}
{{</highlight>}}

##### Register server metric views
{{<highlight go>}}
if err := view.Register(ochttp.DefaultServerViews...); err != nil {
    log.Fatalf("Failed to register HTTP server views: %v", err)
}
{{</highlight>}}

##### Exporting traces and metrics
The last step is to enable trace and metric exporting. For that we'll use say [Stackdriver Exporter](/supported-exporters/go/stackdriver) or
any of the  [Go exporters](/supported-exporters/go/)

##### End to end code sample
With all the steps combined, we'll finally have this code snippet
{{<highlight go>}}
package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"cloud.google.com/go/storage"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

func main() {
	// Create the Stackdriver exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    "census-demos",
		MetricPrefix: "gcs-oc",
	})
	if err != nil {
		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
	}
	defer sd.Flush()

	// Register the trace exporter
	trace.RegisterExporter(sd)

	// Register the stats exporter
	view.RegisterExporter(sd)

	ctx := context.Background()
	gcsClient, err := storage.NewClient(ctx)
	if err != nil {
		log.Fatalf("Failed to create GCS client: %v", err)
	}

	if err := view.Register(ochttp.DefaultClientViews...); err != nil {
		log.Fatalf("Failed to register HTTP client views: %v", err)
	}

	if err := view.Register(ochttp.DefaultServerViews...); err != nil {
		log.Fatalf("Failed to register HTTP server views: %v", err)
	}

	// For the purposes of demo, we'll always sample
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// Create our parent span for the upload tutorial
	ctx, span := trace.StartSpan(ctx, "opencensus.tutorial.Upload")
	defer span.End()

	// Using bucket "census-demos"
	bucket := gcsClient.Bucket("census-demos")
	obj := bucket.Object("hello.txt")

	// Write the current time to the object
	w := obj.NewWriter(ctx)
	now := fmt.Sprintf("The time is: %s\n\n", time.Now().Round(0))
	if _, err := w.Write([]byte(now)); err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		log.Fatalf("Failed to write to object: %v", err)
	}
	if err := w.Close(); err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		log.Fatalf("Failed to close object handle: %v", err)
	}

	// Now read back the content that we just wrote
	r, err := obj.NewReader(ctx)
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		log.Fatalf("Failed to read from object: %v", err)
	}
	defer r.Close()

	_, _ = io.Copy(os.Stdout, r)
}
{{</highlight>}}

#### Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

#### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
![](/images/gcs_go_trace.png)
