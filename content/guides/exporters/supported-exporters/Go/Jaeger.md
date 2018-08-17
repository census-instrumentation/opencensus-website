---
title: "Jaeger (Tracing)"
date: 2018-07-21T14:27:35-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](https://www.jaegertracing.io/img/jaeger-logo.png)

{{% notice note %}}
This guide makes use of Jaeger for visualizing your data. For assistance setting up Jaeger, [Click here](/codelabs/jaeger) for a guided codelab.
{{% /notice %}}

Jaeger, inspired by Dapper and OpenZipkin, is a distributed tracing system released as open source by Uber Technologies.
It is used for monitoring and troubleshooting microservices-based distributed systems, including:

* Distributed context propagation
* Distributed transaction monitoring
* Root cause analysis
* Service dependency analysis
* Performance / latency optimization

OpenCensus Go has support for this exporter available through package [go.opencensus.io/exporter/jaeger](https://godoc.org/go.opencensus.io/exporter/jaeger)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)
- [Project link](#project-link)

##### Creating the exporter
To create the exporter, we'll need to:

* Create an exporter in code
* Have the Jaeger endpoint available to receive traces

{{<highlight go>}}
package main

import (
	"log"

	"go.opencensus.io/exporter/jaeger"
	"go.opencensus.io/trace"
)

func main() {
	agentEndpointURI := "localhost:6831"
	collectorEndpointURI := "http://localhost:9411"

	je, err := jaeger.NewExporter(jaeger.Options{
		AgentEndpoint: agentEndpointURI,
		Endpoint:      collectorEndpointURI,
		ServiceName:   "demo",
	})
	if err != nil {
		log.Fatalf("Failed to create the Jaeger exporter: %v", err)
	}

	// And now finally register it as a Trace Exporter
	trace.RegisterExporter(je)
}
{{</highlight>}}

#### Viewing your traces
Please visit the Jaeger UI endpoint [http://localhost:6831](http://localhost:6831)

#### Project link
You can find out more about the Jaeger project at [https://www.jaegertracing.io/](https://www.jaegertracing.io/)
