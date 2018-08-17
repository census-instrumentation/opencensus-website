---
title: "AWS X-Ray (Tracing)"
date: 2018-07-21T14:27:35-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](https://d1.awsstatic.com/product-marketing/X-Ray/x-ray_web-app_diagram_light.21c38e4500dca09b3c8ca4cf87f896f7bbfb8a3b.png)

AWS X-Ray is a distributed trace collection and analysis system from Amazon Web Services.

Its support is available by means of the X-Ray package [https://godoc.org/github.com/census-instrumentation/opencensus-go-exporter-aws](https://godoc.org/github.com/census-instrumentation/opencensus-go-exporter-aws)

#### Table of contents
- [Requirements](#requirements)
- [Creating the exporter](#creating-the-exporter)
- [Viewing your traces](#viewing-your-traces)


##### Requirements
You'll need to have an AWS Developer account, if you haven't yet, please visit
In case you haven't yet enabled AWS X-Ray, please visit [https://console.aws.amazon.com/xray/home](https://console.aws.amazon.com/xray/home)

##### Creating the exporter

This is possible by importing

{{<highlight go>}}
import xray "github.com/census-instrumentation/opencensus-go-exporter-aws"

// Then create the actual exporter
xe, err := xray.NewExporter(xray.WithVersion("latest"))
if err != nil {
        log.Fatalf("Failed to create the AWS X-Ray exporter: %v", err)
}
{{</highlight>}}

Then finally register it as a trace exporter, to collectively give
{{<highlight go>}}
package main

import (
	"log"

	xray "github.com/census-instrumentation/opencensus-go-exporter-aws"
	"go.opencensus.io/trace"
)

func main() {
	xe, err := xray.NewExporter(xray.WithVersion("latest"))
	if err != nil {
		log.Fatalf("Failed to create the AWS X-Ray exporter: %v", err)
	}
	// It is imperative that your exporter invokes Flush before your program exits!
	defer xe.Flush()

	trace.RegisterExporter(xe)
}
{{</highlight>}}


##### Viewing your traces
Please visit [https://console.aws.amazon.com/xray/home](https://console.aws.amazon.com/xray/home)
