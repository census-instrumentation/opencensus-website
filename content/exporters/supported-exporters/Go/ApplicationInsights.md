---
title: "Azure Monitor"
date: 2018-10-22
draft: false
weight: 3
class: "resized-logo"
aliases: [/supported-exporters/go/applicationinsights, /guides/exporters/supported-exporters/go/applicationinsights]
logo: /img/partners/microsoft_logo.svg
---

- [Introduction](#introduction)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)

## Introduction
Azure Monitor is an extensible Application Performance Management (APM) service for web developers on multiple platforms. Offered by Microsoft Azure, it's a complete at-scale telemetry and monitoring solution.

If you don't have an Azure account yet, [click here](https://azure.microsoft.com/free/) to start.

## Creating the exporter
Azure Monitor does not need a dedicated exporter to work with OpenCensus. Instead, it uses the readily available default exporter along with a dedicated agent known as Local Forwarder. 

To learn about Local Forwarder and how to set it up, visit [this link](https://docs.microsoft.com/azure/azure-monitor/app/opencensus-local-forwarder).

Here's an example of setting things up on the OpenCensus side (see [Local Forwarder repo](https://github.com/Microsoft/ApplicationInsights-LocalForwarder/blob/master/examples/opencensus/go-app/main.go) for the most up-to-date example):

{{<highlight go>}}
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"io/ioutil"

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

	// Since we're sending data to Local Forwarder, we will always sample in order for Live Metrics Stream to work properly
	// If your application is sending high volumes of data and you're not using Live Metrics Stream, provide more conservative value here
	// Local Forwarder https://docs.microsoft.com/azure/application-insights/opencensus-local-forwarder
	// Live Metrics Stream https://docs.microsoft.com/azure/application-insights/app-insights-live-stream
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	client := &http.Client{Transport: &ochttp.Transport{Propagation: &tracecontext.HTTPFormat{}}}

	http.HandleFunc("/call", func(w http.ResponseWriter, req *http.Request) {
		newReq, _ := http.NewRequest("GET", "http://blank.org", nil)

		// Propagate the trace header info in the outgoing requests.
		newReq = newReq.WithContext(req.Context())
		msg := "Hello world from " + serviceName
		resp, err := client.Do(newReq)
		if err == nil {
			blob, _ := ioutil.ReadAll(resp.Body)
			resp.Body.Close()
                      msg = fmt.Sprintf("%s\n%s", msg, blob)
		} else {
			msg = fmt.Sprintf("%s Error: %v", msg, err)
		}

		fmt.Fprintf(w, msg)
	})
	log.Fatal(http.ListenAndServe(":50030", &ochttp.Handler{Propagation: &tracecontext.HTTPFormat{}}))
}
{{</highlight>}}


## Viewing your traces
You must have an Azure account to view your data. If you don't have one yet, [click here](https://docs.microsoft.com/azure/application-insights/app-insights-overview) to start.
