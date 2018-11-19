---
title: "Tracing (Intermediate)"
date: 2018-07-16T14:29:06-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting traces](#exporting-traces)
    - [Create the exporter](#create-the-exporter)
    - [Export Traces](#export-traces)
    - [Create Annotations](#create-annotations)
- [End to end code](#end-to-end-code)
- [Viewing your traces](#viewing-your-traces)
- [References](#references)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

## Requirements
- Go 1.9 or above
- Zipkin as our choice of tracing backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.

You can swap out any other exporter from the [list of Go exporters](/guides/exporters/supported-exporters/go)
{{% /notice %}}

## Installation

OpenCensus: `go get go.opencensus.io/*`

Zipkin exporter: `go get go.opencensus.io/exporter/zipkin`

## Getting Started

{{% notice note %}}
Unsure how to write and execute Go code? [Click here](https://golang.org/doc/code.html).
{{% /notice %}}

It would be nice if we could trace the following code, thus giving us observability in to how the code functions.

First, create a file called `repl.go`.
```bash
touch repl.go
```

Next, put the following code inside of `repl.go`:

{{<highlight go>}}
package main

import (
	"bufio"
	"bytes"
	"fmt"
	"log"
	"os"
)

func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// repl is the read, evaluate, print, loop
	for {
		if err := readEvaluateProcess(br); err != nil {
			log.Fatal(err)
		}
	}
}

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) error {
	fmt.Printf("> ")

	line, err := readLine(br)
	if err != nil {
		return err
	}

	out, err := processLine(line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

func readLine(br *bufio.Reader) ([]byte, error) {
	line, _, err := br.ReadLine()
	if err != nil {
		return nil, err
	}

	return line, err
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(in []byte) (out []byte, err error) {
	return bytes.ToUpper(in), nil
}
{{</highlight>}}

You can run the code via `go run repl.go`.

## Enable Tracing

<a name="import-tracing-packages"></a>
### Import Packages

To enable tracing, we’ll import the context package (`context`) as well as the OpenCensus Trace package (`go.opencensus.io/trace`). Your import statement will look like this:

```go
import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"log"
	"os"

	"go.opencensus.io/trace"
)
```

<a name="instrument-tracing"></a>
### Instrumentation

We will be tracing the execution as it starts in `readEvaluateProcess`, goes to `readLine`, and finally travels through `processLine`.

To accomplish this, we must do two things:

**1. Create a span in each of the three functions**

You can create a span by inserting the following two lines in each of the three functions:
```go
ctx, span := trace.StartSpan(ctx, "spanName")
defer span.End()
```

**2. Provide `context.Context` to all spans**

In order to trace each span, we will provide the **ctx returned from the first `StartSpan` function to all future `StartSpan` functions**.

This means that we will modify the `readLine` and `processLine` functions so they accept a `context.Context` argument.


{{<tabs Snippet All>}}
{{<highlight go>}}
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, span := trace.StartSpan(context.Background(), "repl")
	defer span.End()

	fmt.Printf("> ")

	_, line, err := readLine(ctx, br)
	if err != nil {
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

func readLine(ctx context.Context, br *bufio.Reader) (context.Context, []byte, error) {
	ctx, span := trace.StartSpan(ctx, "readLine")
	defer span.End()

	line, _, err := br.ReadLine()
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeUnknown, Message: err.Error()})
		return ctx, nil, err
	}

	return ctx, line, err
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	_, span := trace.StartSpan(ctx, "processLine")
	defer span.End()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"log"
	"os"

	"go.opencensus.io/trace"
)

func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// repl is the read, evaluate, print, loop
	for {
		if err := readEvaluateProcess(br); err != nil {
			log.Fatal(err)
		}
	}
}

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, span := trace.StartSpan(context.Background(), "repl")
	defer span.End()

	fmt.Printf("> ")

	_, line, err := readLine(ctx, br)
	if err != nil {
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

func readLine(ctx context.Context, br *bufio.Reader) (context.Context, []byte, error) {
	ctx, span := trace.StartSpan(ctx, "readLine")
	defer span.End()

	line, _, err := br.ReadLine()
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeUnknown, Message: err.Error()})
		return ctx, nil, err
	}

	return ctx, line, err
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	_, span := trace.StartSpan(ctx, "processLine")
	defer span.End()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

When creating a new span with `trace.StartSpan(context.Context, "spanName")`, the package first checks if a parent Span already exists in the `context.Context` argument. If it exists, a child span is created. Otherwise, a newly created span is inserted in to `context` to become the parent Span so that subsequent reuse of `context.Context` will have that span.

## Exporting traces

<a name="import-exporting-packages"></a>
### Import packages
To enable exporting of traces to Zipkin, we'll need to import a couple of packages

```go
import (
        "log"

        "go.opencensus.io/exporter/zipkin"
        "go.opencensus.io/trace"

        openzipkin "github.com/openzipkin/zipkin-go"
        zipkinHTTP "github.com/openzipkin/zipkin-go/reporter/http"
)
```

### Create and register the exporter
```go
func main() {
        // Create the Zipkin exporter.
        localEndpoint, err := openzipkin.NewEndpoint("octracequickstart", "192.168.1.5:5454")
        if err != nil {
                log.Fatalf("Failed to create the local zipkinEndpoint: %v", err)
        }
        reporter := zipkinHTTP.NewReporter("http://localhost:9411/api/v2/spans")
        ze := zipkin.NewExporter(reporter, localEndpoint)
        // Register the Zipkin exporter.
        // This step is needed so that traces can be exported.
        trace.RegisterExporter(ze)
}
```

2. For demo purposes, we would like to see the largest percentage of traces -- this is called [sampling](/core-concepts/tracing/#sampling)
```go
        // For demo purposes, we are always sampling.
        trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
```
in production, you probably want to use a probability sampler.


### Create Annotations
When looking at our traces on a backend (such as Stackdriver), we can add metadata to our traces to increase our post-mortem insight.

We'll record the length of each requested string so that it is available to view when examining our traces. To accomplish this, we'll `annotate` the function `readEvaluateProcess`.

{{<highlight go>}}
func readEvaluateProcess(br *bufio.Reader) error {
	fmt.Printf("> ")
	ctx, span := trace.StartSpan(context.Background(), "repl")
	defer span.End()

	_, line, err := readLine(ctx, br)
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeUnknown, Message: err.Error()})
		return err
	}

	span.Annotate([]trace.Attribute{
		trace.Int64Attribute("len", int64(len(line))),
		trace.StringAttribute("use", "repl"),
	}, "Invoking processLine")
	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}
{{</highlight>}}

## End to end code
Collectively our code will look this:

```go
package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"go.opencensus.io/exporter/zipkin"
	"go.opencensus.io/trace"

	openzipkin "github.com/openzipkin/zipkin-go"
	zipkinHTTP "github.com/openzipkin/zipkin-go/reporter/http"
)

func main() {
	// Create the Zipkin exporter.
	localEndpoint, err := openzipkin.NewEndpoint("octracequickstart", "192.168.1.5:5454")
	if err != nil {
		log.Fatalf("Failed to create the local zipkinEndpoint: %v", err)
	}
	reporter := zipkinHTTP.NewReporter("http://localhost:9411/api/v2/spans")
	ze := zipkin.NewExporter(reporter, localEndpoint)
	// Register the Zipkin exporter.
	// This step is needed so that traces can be exported.
	trace.RegisterExporter(ze)

	// For demo purposes, we are always sampling.
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// repl is the read, evaluate, print, loop
	for {
		if err := readEvaluateProcess(br); err != nil {
			if err == io.EOF {
				return
			}
			log.Fatal(err)
		}
	}
}

func readEvaluateProcess(br *bufio.Reader) error {
	fmt.Printf("> ")
	ctx, span := trace.StartSpan(context.Background(), "repl")
	defer span.End()

	_, line, err := readLine(ctx, br)
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeUnknown, Message: err.Error()})
		return err
	}

	span.Annotate([]trace.Attribute{
		trace.Int64Attribute("len", int64(len(line))),
		trace.StringAttribute("use", "repl"),
	}, "Invoking processLine")
	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

func readLine(ctx context.Context, br *bufio.Reader) (context.Context, []byte, error) {
	ctx, span := trace.StartSpan(ctx, "readLine")
	defer span.End()

	line, _, err := br.ReadLine()
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeUnknown, Message: err.Error()})
		return ctx, nil, err
	}

	return ctx, line, err
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	_, span := trace.StartSpan(ctx, "processLine")
	defer span.End()

	return bytes.ToUpper(in), nil
}
```

### Running the code

Having already succesfully started Zipkin as in [Zipkin Codelab](/codelabs/zipkin), we can now run our code by

```shell
go run repl.go
```

## Viewing your traces
With the above you should now be able to navigate to the Zipkin UI at http://localhost:9411

which will produce such a screenshot:
![](/images/trace-go-zipkin-all-traces.png)

And on clicking on one of the traces, we should be able to see the annotation whose description `isInvoking processLine`
![](/images/trace-go-zipkin-single-trace.png)

whose annotation looks like
![](/images/trace-go-zipkin-annotation.png)

And on clicking on `More info` we should see
![](/images/trace-go-zipkin-all-details.png)

## References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Zipkin Go exporter|https://godoc.org/go.opencensus.io/exporter/zipkin
Go exporters|[Go exporters](/guides/exporters/supported-exporters/go)
OpenCensus Go Trace package|https://godoc.org/go.opencensus.io/trace
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
