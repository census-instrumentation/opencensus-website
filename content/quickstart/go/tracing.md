---
title: "Tracing"
date: 2018-07-16T14:29:06-07:00
draft: false
class: "shadowed-image lightbox"
---

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

#### Table of contents

- [Requirements](#background)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting to Stackdriver](#exporting-to-stackdriver)
    - [Import Packages](#import-exporting-packages)
    - [Export Traces](#export-traces)
    - [Create Annotations](#create-annotations)
- [Viewing your Traces on Stackdriver](#viewing-your-traces-on-stackdriver)

In this quickstart, we’ll learn gleam insights into a segment of code and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

#### Requirements
- Go1.9 and above
- Google Cloud Platform account anproject
- Google Stackdriver Tracing enabled on your project (Need help? [Click here](/codelabs/stackdriver))

#### Installation

OpenCensus: `go get go.opencensus.io/*`

Stackdriver exporter: `go get contrib.go.opencensus.io/exporter/stackdriver`

#### Getting Started

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
	defer span.End()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}

You can run the code via `go run repl.go`.

#### Enable Tracing

<a name="import-tracing-packages"></a>
##### Import Packages

To enable tracing, we’ll import the context package (`context`) as well as the OpenCensus Trace package (`go.opencensus.io/trace`). Your import statement will look like this:

{{<tabs Snippet All>}}
{{<highlight go>}}
import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"log"
	"os"

	"go.opencensus.io/trace"
)
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
	defer span.End()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

<a name="instrument-tracing"></a>
##### Instrumentation

We will be tracing the execution as it starts in `readEvaluateProcess`, goes to `readLine`, and finally travels through `processLine`.

To accomplish this, we must do two things:

**1. Create a span in each of the three functions**

You can create a span by inserting the following two lines in each of the three functions:
```go
ctx, span := trace.StartSpan(context.Context ctx, "spanName")
defer span.End()
```

**2. Provide `context.Context ctx` to all spans**

In order to trace each span, we will provide the **ctx returned from the first `StartSpan` function to all future `StartSpan` functions**.

This means that we will modify the `readLine` and `processLine` functions so they accept a `context.Context ctx` argument.


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

#### Exporting to Stackdriver

<a name="import-exporting-packages"></a>
##### Import Packages
To turn on Stackdriver Tracing, we’ll need to import the Stackdriver exporter from `contrib.go.opencensus.io/exporter/stackdriver`.

{{<tabs Snippet All>}}
{{<highlight go>}}
import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/trace"
)
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"contrib.go.opencensus.io/exporter/stackdriver"
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

##### Export Traces
To get our code ready to export, we will be adding a few lines of code to our `main` function.

1. We want to make our traces export to Stackdriver
```go
stackdriver.NewExporter
trace.RegisterExporter
```

2. We want to trace a large percentage of executions (this is called [sampling](/core-concepts/tracing/#sampling))
```go
stackdriver.ApplyConfig
```

Now, let's look at what our `main` function will look like:
{{<tabs Snippet All>}}
{{<highlight go>}}
func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// Enable the Stackdriver Tracing exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID: os.Getenv("GCP_PROJECTID"),
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver exporter: %v", err)
	}
	defer sd.Flush()

	// Register/enable the trace exporter
	trace.RegisterExporter(sd)

	// For demo purposes, set the trace sampling probability to be high
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.ProbabilitySampler(1.0)})

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
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/trace"
)

func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// Enable the Stackdriver Tracing exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID: os.Getenv("GCP_PROJECTID"),
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver exporter: %v", err)
	}
	defer sd.Flush()

	// Register/enable the trace exporter
	trace.RegisterExporter(sd)

	// For demo purposes, set the trace sampling probability to be high
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.ProbabilitySampler(1.0)})

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

##### Create Annotations
When looking at our traces on a backend (such as Stackdriver), we can add metadata to our traces to increase our post-mortem insight.

Let's record the length of each requested string so that it is available to view when we are looking at our traces. We can do this by annotating our `readEvaluateProcess` function.

{{<tabs Snippet All>}}
{{<highlight go>}}
func readEvaluateProcess(br *bufio.Reader) error {
	fmt.Printf("> ")
	// Not timing from: prompt to when we read a
	// line, because you can infinitely wait on stdin.
	line, _, err := br.ReadLine()

	ctx, span := trace.StartSpan(context.Background(), "repl")
	defer span.End()

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

{{<highlight go>}}
package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/trace"
)

func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// Enable the Stackdriver Tracing exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID: os.Getenv("GCP_PROJECTID"),
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver exporter: %v", err)
	}
	defer sd.Flush()

	// Register/enable the trace exporter
	trace.RegisterExporter(sd)

	// For demo purposes, set the trace sampling probability to be high
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.ProbabilitySampler(1.0)})

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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) error {
	fmt.Printf("> ")
	// Not timing from: prompt to when we read a
	// line, because you can infinitely wait on stdin.
	line, _, err := br.ReadLine()

	ctx, span := trace.StartSpan(context.Background(), "repl")
	defer span.End()

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
{{</highlight>}}
{{</tabs>}}

#### Viewing your Traces on Stackdriver
With the above you should now be able to navigate to the [Google Cloud Platform console](https://console.cloud.google.com/traces/traces), select your project, and view the traces.

![viewing traces 1](https://cdn-images-1.medium.com/max/1600/1*v7qiO8nX8WAxpX4LjiQ2oA.png)

And on clicking on one of the traces, we should be able to see the annotation whose description `isInvoking processLine` and on clicking on it, it should show our attributes `len` and `use`.

![viewing traces 2](https://cdn-images-1.medium.com/max/1600/1*SEsUxV1GXu-jM8dLQwtVMw.png)
