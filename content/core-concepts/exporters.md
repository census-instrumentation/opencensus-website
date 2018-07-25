---
title: "Exporters"
date: 2018-07-16T14:28:45-07:00
draft: false
---

Data collected by OpenCensus can be exported to any analysis tool or storage backend.
OpenCensus exporters can be contributed by anyone, and we provide support for several
open source backends and vendors out-of-the-box.

Once you choose your backend, follow the instructions to initialize an exporter.
Then, register the initialized exporter.

#### Stats

As an example, a Prometheus exporter is registered and Prometheus is going to scrape
`:9091` to read the collected data:

{{<tabs Go Java>}}
  {{<highlight go>}}
import (
    "go.opencensus.io/exporter/prometheus"
    "go.opencensus.io/stats/view"
)

func main() {
    exporter, err := prometheus.NewExporter(prometheus.Options{Namespace: "demo"})
    if err != nil {
        log.Fatal(err)
    }
    view.RegisterExporter(exporter)

    // In a seperate go routine, run the Prometheus metrics scraping handler
    go func() {
        http.Handle("/metrics", exporter)
        log.Fatal(http.ListenAndServe(":9091", nil))
    }()
    // ... continue with your code
}
  {{</highlight>}}

  {{<highlight java>}}
// Add the dependencies by following the instructions at
// https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/stats/prometheus

PrometheusStatsCollector.createAndRegister();

// Uses a simple Prometheus HTTPServer to export metrics.
io.prometheus.client.exporter.HTTPServer server =
    new HTTPServer("localhost", 9091, true);
  {{</highlight>}}
{{</tabs>}}

#### Traces

As an example, a Zipkin exporter is registered. All collected trace data will be reported
to the registered Zipkin endpoint:

{{<tabs Go Java>}}
  {{<highlight go>}}
import (
    openzipkin "github.com/openzipkin/zipkin-go"
    "github.com/openzipkin/zipkin-go/reporter/http"
    "go.opencensus.io/exporter/zipkin"
    "go.opencensus.io/trace"
)

localEndpoint, err := openzipkin.NewEndpoint("example-server", "192.168.1.5:5454")
if err != nil {
    log.Println(err)
}
reporter := http.NewReporter("http://localhost:9411/api/v2/spans")
defer reporter.Close()

exporter := zipkin.NewExporter(reporter, localEndpoint)
trace.RegisterExporter(exporter)
  {{</highlight>}}

  {{<highlight java>}}
// Add the dependencies by following the instructions
// at https://github.com/census-instrumentation/opencensus-java/tree/master/exporters/trace/zipkin

ZipkinTraceExporter.createAndRegister(
    "http://localhost:9411/api/v2/spans", "example-server");
  {{</highlight>}}
{{</tabs>}}

Exporters can be registered dynamically and unregistered. But most users will register
an exporter in their main application and never unregister it.

Libraries instrumented with OpenCensus should not register exporters. Exporters should
only be registered by main applications.

#### Supported Backends

<abbr class="trace-exporter blue white-text">T</abbr> Backend supports Tracing

<abbr class="stats-exporter teal white-text">S</abbr> Backend supports Stats
{{<feature-matrix>}}
