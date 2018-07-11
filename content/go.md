+++
title = "Go"
type = "leftnav"
+++


---

#### API Documentation

The OpenCensus Go API reference is available at [godoc.org](https://godoc.org/go.opencensus.io).

---

## Installation


Go 1.8 or higher is required. Make sure you have 1.8+ installed by running:

```bash
$ go version
```  

Install the OpenCensus packages by running:

```bash
$ go get go.opencensus.io
```

See the [tag](https://godoc.org/go.opencensus.io/tag), [stats](https://godoc.org/go.opencensus.io/stats), [trace](https://godoc.org/go.opencensus.io/trace) godoc for the API reference and [examples](https://github.com/census-instrumentation/opencensus-go/tree/master/examples) directory for samples.  

---

![OpenCensus Overview](https://i.imgur.com/cf4ElHE.jpg)

In a distributed system, a user request may go through multiple services until there is a response. OpenCensus allows you to instrument your services and collect diagnostics data all through your services end-to-end.

Start with instrumenting HTTP and gRPC clients and servers, then add additional custom instrumentation if needed.

* [HTTP example](https://github.com/census-instrumentation/opencensus-go/tree/master/examples/http)
* [gRPC example](https://github.com/census-instrumentation/opencensus-go/tree/master/examples/grpc)

For custom instrumentation, see the following sections.

---

## Tags

Tags represent propagated key-value pairs. They are propagated using `context.Context`
in the same process or can be encoded to be transmitted on the wire.

Package tag allows adding or modifying tags in the current context.

```go
import "go.opencensus.io/tag"

ctx, err = tag.New(ctx,
	tag.Insert(osKey, "macOS-10.12.5"),
	tag.Upsert(userIDKey, "cde36753ed"),
)
if err != nil {
	log.Fatal(err)
}
```

---

## Stats

OpenCensus stats collection happens in two stages:

* Definition of measures and recording of data points
* Definition of views and aggregation of the recorded data

### Recording

Measurements are data points associated with a measure.

```go
import "go.opencensus.io/stats"

videoSize := stats.Int64("company.com/processed_video_size", "Processed video size", "KB")
```

Recording the measurements with tags from the provided context:

```go
stats.Record(ctx, videoSize.M(102478))
```

### Views

Views are how Measures are aggregated. You can think of them as queries over the
set of recorded data points (measurements).

Below, there are examples of aggregations:

```go
import "go.opencensus.io/stats/view"

distAgg := view.Distribution(0, 1<<32, 2<<32, 3<<32)
countAgg := view.Count()
```

Here, we are creating a view with the distribution aggregation over our measure.

```go
if err := view.Register(&view.View{
	Name:        "example.com/video_size_distribution",
	Description: "processed video size over time",
	Measure:     videoSize,
	TagKeys:     []tag.Key{osKey},
	Aggregation: view.Distribution(0, 1<<32, 2<<32, 3<<32),
}); err != nil {
	log.Fatalf("Failed to register view: %v", err)
}
```

Register begins data collection for the view. Registered views' data will be
exported via the registered exporters.

---

## Traces

A distributed trace tracks the progression of a single user request as
it is handled by the services and processes that make up an application.

### Spans

Span is the unit step in a trace. Each span has a name, latency, status and
additional metadata.

Below we are starting a span for a cache read and ending it
when we are done:

```go
import "go.opencensus.io/trace"

ctx, span := trace.StartSpan(ctx, "cache.Get")
defer span.End()

// Do work to get from cache.
```

### Propagation

Spans can have parents or can be root spans if they don't have any parents.
The current span is propagated in-process and across the network to allow associating
new child spans with the parent.

In the same process, context.Context is used to propagate spans.
trace.StartSpan creates a new span as a root if the current context
doesn't contain a span. Or, it creates a child of the span that is
already in current context. The returned context can be used to keep
propagating the newly created span in the current context.

```go
import "go.opencensus.io/trace"

ctx, span := trace.StartSpan(ctx, "cache.Get")
defer span.End()

// Do work to get from cache.
```

Across the network, OpenCensus provides different propagation
methods for different protocols.

* gRPC integrations uses the OpenCensus' [binary propagation format](https://godoc.org/go.opencensus.io/trace/propagation).
* HTTP integrations uses Zipkin's [B3](https://github.com/openzipkin/b3-propagation)
  by default but can be configured to use a custom propagation method by setting another
  [propagation.HTTPFormat](https://godoc.org/go.opencensus.io/trace/propagation#HTTPFormat).

---

## Profiles

OpenCensus tags can be applied as profiler labels
for users who are on Go 1.9 and above.

```go
import "go.opencensus.io/tag"

ctx, err = tag.New(ctx,
	tag.Insert(osKey, "macOS-10.12.5"),
	tag.Insert(userIDKey, "fff0989878"),
)
if err != nil {
	log.Fatal(err)
}
tag.Do(ctx, func(ctx context.Context) {
	// Do work.
	// When profiling is on, samples will be
	// recorded with the key/values from the tag map.
})
```

A screenshot of the CPU profile from the program above:

![CPU profile](https://i.imgur.com/jBKjlkw.png)

---

## Execution tracer

With Go 1.11, OpenCensus Go will be able to work mutually 
with execution tracer. See [Debugging Latency in Go](https://medium.com/observability/debugging-latency-in-go-1-11-9f97a7910d68)
to see an example of their mutual use.

---

## Exporters

Only main packages should register exporters.
Following Go exporters are available for OpenCensus Go:

* [Prometheus][exporter-prom] for stats
* [OpenZipkin][exporter-zipkin] for traces
* Stackdriver [Monitoring][exporter-stackdriver] and [Trace][exporter-stackdriver]
* [Jaeger][exporter-jaeger] for traces
* [AWS X-Ray][exporter-xray] for traces
* [Datadog][exporter-datadog] for stats and traces

Once you initiate an stats exporter, you can register it
to start exporting the collected data to the backend:

```go
import "go.opencensus.io/stats/view"

view.RegisterExporter(exporter)
```

Similarly once you initiate an trace exporter, you can register it:

```go
import "go.opencensus.io/trace"

trace.RegisterExporter(exporter)
```

---


Bug reports and feature requests can be filed at the GitHub [repo](https://github.com/census-instrumentation/opencensus-go).

[exporter-prom]: https://godoc.org/go.opencensus.io/exporter/prometheus
[exporter-stackdriver]: https://godoc.org/contrib.go.opencensus.io/exporter/stackdriver
[exporter-zipkin]: https://godoc.org/go.opencensus.io/exporter/zipkin
[exporter-jaeger]: https://godoc.org/go.opencensus.io/exporter/jaeger
[exporter-xray]: https://github.com/census-instrumentation/opencensus-go-exporter-aws
[exporter-datadog]: https://github.com/DataDog/opencensus-go-exporter-datadog
