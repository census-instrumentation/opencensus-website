---
title: "Zipkin (Tracing)"
date: 2018-07-21T14:27:35-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/img/zipkin-logo.jpg)

{{% notice note %}}
This guide makes use of Zipkin for visualizing your data. For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.
{{% /notice %}}

Zipkin is a distributed tracing system. It helps gather timing data needed to troubleshoot latency problems in microservice architectures.

It manages both the collection and lookup of this data. Zipkin’s design is based on the Google Dapper paper.

OpenCensus Go has support for this exporter available through package [go.opencensus.io/exporter/zipkin](https://godoc.org/go.opencensus.io/exporter/zipkin)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [Project link](#project-link)

##### Creating the exporter
To create the exporter, we'll need to:

* Create an exporter in code
* Have the Zipkin endpoint available to receive traces

{{<highlight go>}}
package main

import (
	"log"

	"go.opencensus.io/exporter/zipkin"
	"go.opencensus.io/trace"

	openzipkin "github.com/openzipkin/zipkin-go"
	zipkinHTTP "github.com/openzipkin/zipkin-go/reporter/http"
)

func main() {
	localEndpointURI := "192.168.1.5:5454"
	reporterURI := "http://localhost:9411/api/v2/spans"
	serviceName := "server"

	localEndpoint, err := openzipkin.NewEndpoint(serviceName, localEndpointURI)
	if err != nil {
		log.Fatalf("Failed to create Zipkin localEndpoint with URI %q error: %v", localEndpointURI, err)
	}

	reporter := zipkinHTTP.NewReporter(reporterURI)
	ze := zipkin.NewExporter(reporter, localEndpoint)

	// And now finally register it as a Trace Exporter
	trace.RegisterExporter(ze)
}
{{</highlight>}}

#### Viewing your traces
Please visit the Zipkin UI endpoint [http://localhost:9411](http://localhost:9411)

#### Project link
You can find out more about the Zipkin project at [https://zipkin.io/](https://zipkin.io/)
