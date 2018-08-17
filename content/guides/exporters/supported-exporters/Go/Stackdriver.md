---
title: "Stackdriver (Stats and Tracing)"
date: 2018-07-21T14:27:35-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/images/logo_gcp_vertical_rgb.png)

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

Stackdriver Trace is a distributed tracing system that collects latency data from your applications and displays it in the Google Cloud Platform Console.
You can track how requests propagate through your application and receive detailed near real-time performance insights.
Stackdriver Trace automatically analyzes all of your application's traces to generate in-depth latency reports to surface performance degradations,
and can capture traces from all of your VMs, containers, or Google App Engine projects.

Stackdriver Monitoring provides visibility into the performance, uptime, and overall health of cloud-powered applications.
Stackdriver collects metrics, events, and metadata from Google Cloud Platform, Amazon Web Services, hosted uptime probes, application instrumentation,
and a variety of common application components including Cassandra, Nginx, Apache Web Server, Elasticsearch, and many others.
Stackdriver ingests that data and generates insights via dashboards, charts, and alerts. Stackdriver alerting helps you collaborate by
integrating with Slack, PagerDuty, HipChat, Campfire, and more.

OpenCensus Go has support for this exporter available through package [contrib.go.opencensus.io/exporter/stackdriver](https://godoc.org/contrib.go.opencensus.io/exporter/stackdriver)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

##### Creating the exporter
To create the exporter, we'll need to:

* Have a GCP Project ID
* Create an exporter in code

{{<highlight go>}}
import "contrib.go.opencensus.io/exporter/stackdriver"

// Then create the actual exporter
sd, err := stackdriver.NewExporter(stackdriver.Options{
    ProjectID: "demo-project-id",
})
if err != nil {
    log.Fatalf("Failed to create the Stackdriver exporter: %v", err)
}
{{</highlight>}}

{{<tabs Stats Tracing All>}}
{{<highlight go>}}
package main

import (
	"log"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats/view"
)

func main() {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID: "demo-project-id",
		// MetricPrefix helps uniquely identify your metrics.
		MetricPrefix: "demo-prefix",
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver exporter: %v", err)
	}
	// It is imperative to invoke flush before your main function exits
	defer sd.Flush()

	// Register it as a metrics exporter
	view.RegisterExporter(sd)
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"log"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/trace"
)

func main() {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID: "demo-project-id",
		// MetricPrefix helps uniquely identify your metrics.
		MetricPrefix: "demo-prefix",
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver exporter: %v", err)
	}
	// It is imperative to invoke flush before your main function exits
	defer sd.Flush()

	// Register it as a trace exporter
	trace.RegisterExporter(sd)
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"log"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

func main() {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID: "demo-project-id",
		// MetricPrefix helps uniquely identify your metrics.
		MetricPrefix: "demo-prefix",
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver exporter: %v", err)
	}
	// It is imperative to invoke flush before your main function exits
	defer sd.Flush()

	// Register it as a metrics exporter
	view.RegisterExporter(sd)

	// Register it as a trace exporter
	trace.RegisterExporter(sd)
}
{{</highlight>}}
{{</tabs>}}

#### Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

#### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
