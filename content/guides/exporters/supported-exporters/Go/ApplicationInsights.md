---
title: "Application Insights"
date: 2018-10-15
draft: false
weight: 3
class: "resized-logo"
aliases: [/supported-exporters/go/applicationinsights]
logo: /img/partners/microsoft_logo.svg
---

- [Introduction](#introduction)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)

## Introduction
Application Insights is an extensible Application Performance Management (APM) service for web developers on multiple platforms. Offered by Microsoft Azure, it's a complete at-scale telemetry and monitoring solution.

If you don't have an Application Insights account yet, [click here](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-overview) to start.

## Creating the exporter
Application Insights does not need a dedicated exporter to work with OpenCensus. Instead, it uses the readily available default exporter along with a dedicated agent known as Local Forwarder. 

To learn about Local Forwarder and how to set it up, visit [this link](https://docs.microsoft.com/en-us/azure/application-insights/opencensus-local-forwarder).

Here's an example of setting things up on the OpenCensus side (see [Local Forwarder repo](https://github.com/Microsoft/ApplicationInsights-LocalForwarder/blob/master/examples/opencensus/go-app/main.go) for the most up-to-date example):

{{<highlight go>}}
package main

import (
	"fmt"
	"log"
	"net/http"
	os "os"

	ocagent "contrib.go.opencensus.io/exporter/ocagent"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/plugin/ochttp/propagation/tracecontext"
	"go.opencensus.io/trace"
)

func main() {
	// Register trace exporters to export the collected data.
	serviceName := os.Getenv("SERVICE_NAME")
	if len(serviceName) == 0 {
		serviceName = "go-app"
	}
	agentEndpoint := os.Getenv("OCAGENT_TRACE_EXPORTER_ENDPOINT")
	if len(agentEndpoint) == 0 {
		agentEndpoint = fmt.Sprintf("%s:%d", ocagent.DefaultAgentHost, ocagent.DefaultAgentPort)
	}

	exporter, err := ocagent.NewExporter(ocagent.WithInsecure(), ocagent.WithServiceName(serviceName), ocagent.WithAddress(agentEndpoint))
	if err != nil {
		log.Fatalf("Failed to create the agent exporter: %v", err)
	}

	trace.RegisterExporter(exporter)

	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	client := &http.Client{Transport: &ochttp.Transport{Propagation: &tracecontext.HTTPFormat{}}}

	http.HandleFunc("/call", func(w http.ResponseWriter, req *http.Request) {
		fmt.Fprintf(w, "hello world from %s", serviceName)

		r, _ := http.NewRequest("GET", "http://blank.org", nil)

		// Propagate the trace header info in the outgoing requests.
		r = r.WithContext(req.Context())
		resp, err := client.Do(r)
		if err != nil {
			log.Println(err)
		} else {
			// TODO: handle response
			resp.Body.Close()
		}
	})
	log.Fatal(http.ListenAndServe(":50030", &ochttp.Handler{Propagation: &tracecontext.HTTPFormat{}}))
}
{{</highlight>}}


## Viewing your traces
You must have an Application Insights account to view your data. If you don't have one yet, [click here](https://docs.microsoft.com/en-us/azure/application-insights/app-insights-overview) to start.
