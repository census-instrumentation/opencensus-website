---
title: "Prometheus (Stats)"
date: 2018-07-21T14:27:35-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/img/prometheus-logo.png)

{{% notice note %}}
This guide makes use of Prometheus for receiving and visualizing your data. For assistance setting up Prometheus, [Click here](/codelabs/prometheus) for a guided codelab.
{{% /notice %}}

Prometheus is a monitoring system that collects metrics, by scraping
exposed endpoints at regular intervals, evaluating rule expressions.
It can also trigger alerts if certain conditions are met.

OpenCensus Go allows exporting stats to Prometheus by means of the Prometheus package
[go.opencensus.io/exporter/prometheus](https://godoc.org/go.opencensus.io/exporter/prometheus)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Running Prometheus](#running-prometheus)
- [Viewing your metrics](#viewing-your-metrics)
- [Project link](#project-link)

##### Creating the exporter
To create the exporter, we'll need to:

* Import and use the Prometheus exporter package
* Define a namespace that will uniquely identify our metrics when viewed on Prometheus
* Expose a port on which we shall run a `/metrics` endpoint
* With the defined port, we'll need a Promethus configuration file so that Prometheus can scrape from this endpoint
{{<highlight go>}}
import "go.opencensus.io/exporter/prometheus"

// Then create the actual exporter
pe, err := prometheus.NewExporter(prometheus.Options{
    Namespace: "demo",
})
if err != nil {
    log.Fatalf("Failed to create the Prometheus exporter: %v", err)
}
{{</highlight>}}

An instance of the Prometheus exporter implements [http.Handler](https://golang.org/net/http#Handler)
so we'll need to expose it on our port of choice say ":8888"
{{<highlight go>}}
package main

import (
	"log"
	"net/http"

	"go.opencensus.io/exporter/prometheus"
)

func main() {
	pe, err := prometheus.NewExporter(prometheus.Options{
		Namespace: "demo",
	})
	if err != nil {
		log.Fatalf("Failed to create Prometheus exporter: %v", err)
	}
	go func() {
		mux := http.NewServeMux()
		mux.Handle("/metrics", pe)
		if err := http.ListenAndServe(":8888", mux); err != nil {
			log.Fatalf("Failed to run Prometheus /metrics endpoint: %v", err)
		}
	}()
}
{{</highlight>}}

and then for our corresponding `prometheus.yaml` file:

```shell
global:
  scrape_interval: 10s

  external_labels:
    monitor: 'demo'

scrape_configs:
  - job_name: 'demo'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8888']
```

##### Running Prometheus
And then run Prometheus with your configuration
```shell
prometheus --config.file=prometheus.yaml
```

##### Viewing your metrics
Please visit [http://localhost:9090](http://localhost:9090)

#### Project link
You can find out more about the Prometheus project at [https://prometheus.io/](https://prometheus.io/)
