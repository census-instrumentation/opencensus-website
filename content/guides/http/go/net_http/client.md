---
title: "Client"
date: 2018-11-26T22:22:31-07:00
draft: false
aliases: [/integrations/http/go/net_http/client]
weight: 1
logo: /images/gopher.png
---

- [Introduction](#introduction)
- [Traces](#traces)
- [Metrics](#metrics)
- [End-to-end example](#end-to-end-example)
- [Viewing traces](#viewing-traces)
- [Viewing metrics](#viewing-metrics)
- [References](#references)

### Introduction

OpenCensus provides a package [go.opencensus.io/plugin/ochttp](https://godoc.org/go.opencensus.io/plugin/ochttp) which has a custom HTTP roundtripper [ochttp.Transport](https://godoc.org/go.opencensus.io/plugin/ochttp#Transport) that can wrap your HTTP Transport. For example

```go
package main

import (
	"net/http"

	"go.opencensus.io/plugin/ochttp"
)

func main() {
	octr := &ochttp.Transport{}
	client := &http.Client{Transport: octr}
	// Use the client
	_ = client
}
```

When chaining multiple [Transports](https://golang.org/net/http#Transport), please make sure that the [ochttp.Transport.Base](https://godoc.org/go.opencensus.io/plugin/ochttp#Transport.Base) is the out-most Transport

```go
package main

import (
	"net/http"

	"go.opencensus.io/plugin/ochttp"
)

func main() {
	octr := &ochttp.Transport{Base: &http.Transport{}}
	client := &http.Client{Transport: octr}
	// Use the client
	_ = client
}
```

### Traces

Traces can be continued and used simply by passing the context that contains traces into the request that will then be used to roundtrip the request
```go
package main

import (
	"context"
	"io"
	"io/ioutil"
	"log"
	"net/http"

	"go.opencensus.io/plugin/ochttp"
)

func main() {
	ctx := context.Background() // In other usages, the context would have been passed down after starting some traces.
	req, _ := http.NewRequest("GET", "https://opencensus.io/", nil)

	// It is imperative that req.WithContext is used to
	// propagate context and use it in the request.
	req = req.WithContext(ctx)

	client := &http.Client{Transport: &ochttp.Transport{}}
	res, err := client.Do(req)
	if err != nil {
		log.Fatalf("Failed to make the request: %v", err)
	}

	// Consume the body and close it.
	io.Copy(ioutil.Discard, res.Body)
	_ = res.Body.Close()
}
```

To examine the traces, please make sure to enable a [Trace exporter](/exporters/supported-exporters/go) that will send the data to a Tracing backend.

### Metrics

Metrics can be enabled by simply registering the [ochttp.DefaultClientViews](https://godoc.org/go.opencensus.io/plugin/ochttp#DefaultClientViews)

```go
        // In our main, register ochttp Client views
        if err := view.Register(ochttp.DefaultClientViews...); err != nil {
                log.Fatalf("Failed to register client views for HTTP metrics: %v", err)
        }
```

To examine the metrics, please make sure to enable a [Stats exporter](/exporters/supported-exporters/go) that will send the data to a Metrics backend.

which provide the following metrics

Metric|Prefix|Description|Tags|Aggregation
---|---|---|---|---
Requests completed|"opencensus.io/http/client/completed_count"|The number of requests made|"http_client_method", "http_client_status"|Count
Bytes sent|"opencensus.io/http/client/sent_bytes"|The number of bytes sent|"http_client_method", "http_client_status"|Distribution
Bytes received|"opencensus.io/http/client/received_bytes"|The number of bytes received|"http_client_method", "http_client_status"|Distribution
Roundtrip Latency|"opencensus.io/http/client/roundtrip_latency"|The end-to-end latency|"http_client_method", "http_client_status"|Distribution

### End to end example

The following example uses the ochttp.Transport to make requests to the OpenCensus website every 5 seconds and exports traces and metrics with our Zipkin trace and Prometheus stats respectively. Of course you can use [any other exporters of your choice](/exporters/supported-exporters/go)

{{% notice tip %}}
For assistance setting up any of the exporters, please refer to:

Exporter|URL
---|---
Prometheus|[Prometheus codelab](/codelabs/prometheus)
Zipkin|[Zipkin codelab](/codelabs/zipkin)
{{% /notice %}}

```go
package main

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	openzipkin "github.com/openzipkin/zipkin-go"
	zipkinHTTP "github.com/openzipkin/zipkin-go/reporter/http"

	"contrib.go.opencensus.io/exporter/prometheus"
	"contrib.go.opencensus.io/exporter/zipkin"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

func main() {
	// Firstly, we'll register ochttp Client views
	if err := view.Register(ochttp.DefaultClientViews...); err != nil {
		log.Fatalf("Failed to register client views for HTTP metrics: %v", err)
	}

	// For tracing, let's always sample for the purposes of this demo
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// Enable observability to extract and examine traces and metrics.
	enableObservabilityAndExporters()

	// Create our HTTP client that uses the ochttp.Transport.
	client := &http.Client{Transport: &ochttp.Transport{}}
	i := uint64(0)

	// Then finally do the work every 5 seconds.
	for {
		i += 1
		log.Printf("Performing fetch #%d", i)
		ctx, span := trace.StartSpan(context.Background(), fmt.Sprintf("Fetch-%d", i))
		doWork(ctx, client)
		span.End()

		<-time.After(5 * time.Second)
	}
}

func doWork(ctx context.Context, client *http.Client) {
	req, _ := http.NewRequest("GET", "https://opencensus.io/", nil)

	// It is imperative that req.WithContext is used to
	// propagate context and use it in the request.
	req = req.WithContext(ctx)

	// Now make the request to the remote end.
	res, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to make the request: %v", err)
		return
	}

	// Consume the body and close it.
	io.Copy(ioutil.Discard, res.Body)
	_ = res.Body.Close()

}

func enableObservabilityAndExporters() {
	// Stats exporter: Prometheus
	pe, err := prometheus.NewExporter(prometheus.Options{
		Namespace: "ochttp_tutorial",
	})
	if err != nil {
		log.Fatalf("Failed to create the Prometheus stats exporter: %v", err)
	}

	go func() {
		mux := http.NewServeMux()
		mux.Handle("/metrics", pe)
		log.Fatal(http.ListenAndServe(":8888", mux))
	}()

	// Trace exporter: Zipkin
	localEndpoint, _ := openzipkin.NewEndpoint("ochttp_tutorial", "localhost:0")
	reporter := zipkinHTTP.NewReporter("http://localhost:9411/api/v2/spans")
	ze := zipkin.NewExporter(reporter, localEndpoint)
	trace.RegisterExporter(ze)
}
```

and to run the example

```shell
go run main.go
```

and then start Prometheus with this configuration file `prometheus.yaml` with

```yaml
scrape_configs:
  - job_name: 'ochttp_tutorial'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8888']
```

by running

```shell
prometheus --config.file=prometheus.yaml
```

### Viewing traces

On navigating to the Zipkin UI at http://localhost:9411/zipkin

* All traces
![](/images/ochttp-client-traces-all.png)

* Single trace
![](/images/ochttp-client-traces-single.png)

* Single trace detail for the HTTP request "/"
![](/images/ochttp-client-traces-single-detail.png)

### Viewing metrics

On navigating to the Prometheus UI at http://localhost:9090/graph

* All metrics
![](/images/ochttp-client-metrics-all.png)

* Latency buckets
![](/images/ochttp-client-metrics-latency-buckets.png)

* Request bytes buckets
![](/images/ochttp-client-metrics-request-bytes-buckets.png)

* Response bytes buckets
![](/images/ochttp-client-metrics-response-bytes-buckets.png)

### References

Resource|URL
---|---
ochttp.Transport GoDoc|https://godoc.org/go.opencensus.io/plugin/ochttp
ochttp.DefaultClientViews|https://godoc.org/go.opencensus.io/plugin/ochttp#DefaultClientViews
net/http Godoc|https://golang.org/pkg/net/http
