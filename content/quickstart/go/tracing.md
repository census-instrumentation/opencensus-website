---
title: "Tracing"
date: 2018-07-16T14:29:06-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Run it locally](#run-it-locally)
- [Configure Exporter](#configure-exporter)
- [Configure Sampler](#configure-sampler)
- [Create a span](#create-a-span)
- [Create a child span](#create-a-child span)
- [End the spans](#end-the-spans)
- [References](#references)

#### Run it locally
1. Clone the example repository: `git clone https://github.com/opencensus-otherwork/opencensus-quickstarts`
2. Change to the example directory: `cd opencensus-quickstarts/go/tracing-to-zipkin`
3. Install dependencies: `go get go.opencensus.io/* && go get contrib.go.opencensus.io/exporter/zipkin`
4. Download Zipkin: `curl -sSL https://zipkin.io/quickstart.sh | bash -s`
5. Start Zipkin: `java -jar zipkin.jar`
6. Run the code: `go run tracingtozipkin.go`
7. Navigate to Zipkin Web UI: http://localhost:9411
8. Click Find Traces, and you should see a trace.
9. Click into that, and you should see the details.

![](/images/go-tracing-zipkin.png)

#### How does it work?
{{% tabs Snippet All %}}
```go
func main() {
	// 1. Configure exporter to export traces to Zipkin.
	localEndpoint, err := openzipkin.NewEndpoint("go-quickstart", "192.168.1.5:5454")
	if err != nil {
		log.Fatalf("Failed to create the local zipkinEndpoint: %v", err)
	}
	reporter := zipkinHTTP.NewReporter("http://localhost:9411/api/v2/spans")
	ze := zipkin.NewExporter(reporter, localEndpoint)
	trace.RegisterExporter(ze)

	// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// 3. Create a span with the background context, making this the parent span.
	// A span must be closed.
	ctx, span := trace.StartSpan(context.Background(), "main")
	// 5b. Make the span close at the end of this function.
	defer span.End()

	for i := 0; i < 10; i++ {
		doWork(ctx)
	}
}
```

```go
package main

import (
	"bytes"
	"context"
	"encoding/binary"
	"fmt"
	"log"
	"time"

	"contrib.go.opencensus.io/exporter/zipkin"
	"go.opencensus.io/trace"

	openzipkin "github.com/openzipkin/zipkin-go"
	zipkinHTTP "github.com/openzipkin/zipkin-go/reporter/http"
)

func main() {
	// 1. Configure exporter to export traces to Zipkin.
	localEndpoint, err := openzipkin.NewEndpoint("go-quickstart", "192.168.1.5:5454")
	if err != nil {
		log.Fatalf("Failed to create the local zipkinEndpoint: %v", err)
	}
	reporter := zipkinHTTP.NewReporter("http://localhost:9411/api/v2/spans")
	ze := zipkin.NewExporter(reporter, localEndpoint)
	trace.RegisterExporter(ze)

	// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// 3. Create a span with the background context, making this the parent span.
	// A span must be closed.
	ctx, span := trace.StartSpan(context.Background(), "main")
	// 5b. Make the span close at the end of this function.
	defer span.End()

	for i := 0; i < 10; i++ {
		doWork(ctx)
	}
}

func doWork(ctx context.Context) {
	// 4. Start a child span. This will be a child span because we've passed
	// the parent span's ctx.
	_, span := trace.StartSpan(ctx, "doWork")
	// 5a. Make the span close at the end of this function.
	defer span.End()

	fmt.Println("doing busy work")
	time.Sleep(80 * time.Millisecond)
	buf := bytes.NewBuffer([]byte{0xFF, 0x00, 0x00, 0x00})
	num, err := binary.ReadVarint(buf)
	if err != nil {
		// 6. Set status upon error
		span.SetStatus(trace.Status{
			Code:    trace.StatusCodeUnknown,
			Message: err.Error(),
		})
	}

	// 7. Annotate our span to capture metadata about our operation
	span.Annotate([]trace.Attribute{
		trace.Int64Attribute("bytes to int", num),
	}, "Invoking doWork")
	time.Sleep(20 * time.Millisecond)
}
```
{{% /tabs %}}

#### Configure Exporter
OpenCensus can export traces to different distributed tracing stores (such as Zipkin, Jeager, Stackdriver Trace). In (1), we configure OpenCensus to export to Zipkin, which is listening on `localhost` port `9411`, and all of the traces from this program will be associated with a service name `go-quickstart`.
```go
// 1. Configure exporter to export traces to Zipkin.
localEndpoint, err := openzipkin.NewEndpoint("go-quickstart", "192.168.1.5:5454")
if err != nil {
  log.Fatalf("Failed to create the local zipkinEndpoint: %v", err)
}
reporter := zipkinHTTP.NewReporter("http://localhost:9411/api/v2/spans")
ze := zipkin.NewExporter(reporter, localEndpoint)
trace.RegisterExporter(ze)
```

#### Configure Sampler
Configure 100% sample rate, otherwise, few traces will be sampled.
```go
// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
```

#### Create a span
To create a span in a trace, we used the `Tracer` to start a new span (3). We denote this as the parent span because we pass `context.Background()`. We must also be sure to close this span, which we will explore later in this guide.
```go
// 3. Create a span with the background context, making this the parent span.
// A span must be closed.
ctx, span := trace.StartSpan(context.Background(), "main")
```

#### Create a child span
The `main` method calls `doWork` a number of times. Each invocation also generates a child span. Take a look at the `doWork` method.
```go
func doWork(ctx context.Context) {
	// 4. Start a child span. This will be a child span because we've passed
	// the parent span's ctx.
	_, span := trace.StartSpan(ctx, "doWork")
	// 5a. Make the span close at the end of this function.
	defer span.End()

	fmt.Println("doing busy work")
	time.Sleep(80 * time.Millisecond)
	buf := bytes.NewBuffer([]byte{0xFF, 0x00, 0x00, 0x00})
	num, err := binary.ReadVarint(buf)
	if err != nil {
		// 6. Set status upon error
		span.SetStatus(trace.Status{
			Code:    trace.StatusCodeUnknown,
			Message: err.Error(),
		})
	}

	// 7. Annotate our span to capture metadata about our operation
	span.Annotate([]trace.Attribute{
		trace.Int64Attribute("bytes to int", num),
	}, "Invoking doWork")
	time.Sleep(20 * time.Millisecond)
}
```

#### End the spans
We must end the spans so they becomes available for exporting.
```go
// 5a. Make the span close at the end of this function.
defer span.End()

// 5b. Make the span close at the end of this function.
defer span.End()
```

#### Set the Status of the span
We can set the [status](https://opencensus.io/tracing/span/status/) of our span to create more observability of our traced operations.
```go
// 6. Set status upon error
span.SetStatus(trace.Status{
	Code:    trace.StatusCodeUnknown,
	Message: err.Error(),
})
```

#### Create an Annotation
An [annotation](https://opencensus.io/tracing/span/time_events/annotation/) tells a descriptive story in text of an event that occurred during a span’s lifetime.
```go
// 7. Annotate our span to capture metadata about our operation
span.Annotate([]trace.Attribute{
	trace.Int64Attribute("bytes to int", num),
}, "Invoking doWork")
```

#### References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Zipkin Go exporter|https://godoc.org/contrib.go.opencensus.io/exporter/zipkin
Go exporters|[Go exporters](/guides/exporters/supported-exporters/go)
OpenCensus Go Trace package|https://godoc.org/go.opencensus.io/trace
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
