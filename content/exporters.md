+++
title = "Exporters"
type = "leftnav"
+++

Data collected by OpenCensus can be exported to any analysis tool or storage backend.
OpenCensus exporters can be contributed by anyone, and we provide support for several
open source backends and vendors out-of-the-box.

Once you choose your backend, follow the instructions to initialize an exporter.
Then register the initialized exporter.

## Stats

Below, a Prometheus exporter is registered and Prometheus is going to scrape
`:9999` to read the collected data:

``` go
import (
    "go.opencensus.io/exporter/prometheus"
    "go.opencensus.io/stats/view"
)

exporter, err := prometheus.NewExporter(prometheus.Options{})
if err != nil {
    log.Fatal(err)
}
view.RegisterExporter(exporter)

http.Handle("/metrics", exporter)
log.Fatal(http.ListenAndServe(":9999", nil))
```

## Traces

Below, a Zipkin exporter is registered. All collected trace data will be reported
to the registered Zipkin endpoint:

```
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
```

---

Exporters can be registered dynamically and unregistered. But most users will register
and exporter in their main application and never unregister it.

Libraries instrumented with OpenCensus should not register exporters. Exporters should
only be registered by main applications.
