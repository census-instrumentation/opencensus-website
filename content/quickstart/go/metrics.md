---
title: "Metrics"
date: 2018-07-16T14:29:10-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Brief Overview](#brief-overview)
- [Getting started](#getting-started)
- [Enable Metrics](#enable-metrics)
    - [Import Packages](#import-metrics-packages)
    - [Create Metrics](#create-metrics)
    - [Create Tags](#create-tags)
    - [Inserting Tags](#inserting-tags)
    - [Recording Metrics](#recording-metrics)
- [Enable Views](#enable-views)
    - [Import Packages](#import-views-packages)
    - [Create Views](#create-views)
    - [Register Views](#register-views)
- [Exporting stats](#exporting-stats)
    - [Import Packages](#import-exporting-packages)
    - [Create the exporter](#create-the-exporter)
    - [Register the exporter](#register-the-exporter)
- [End to end code](#end-to-end-code)
    - [Running the tutorial](#running-the-tutorial)
    - [Prometheus configuration file](#prometheus-configuration-file)
    - [Running Prometheus](#running-prometheus)
- [Viewing your metrics](#viewing-your-metrics)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Collect metrics using [OpenCensus Metrics](/core-concepts/metrics) and [Tags](/core-concepts/tags)
2. Register and enable an exporter for any [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View the metrics on the backend of our choice

## Requirements
- Go 1.9 or above
- Prometheus as our choice of metrics backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Prometheus, [Click here](/codelabs/prometheus) for a guided codelab.

You can swap out any other exporter from the [list of Go exporters](/guides/exporters/supported-exporters/go)
{{% /notice %}}

## Installation

OpenCensus: `go get -u -v go.opencensus.io/...`

Prometheus exporter: `go get -u -v contrib.go.opencensus.io/exporter/prometheus`

## Brief Overview
By the end of this tutorial, we will do these four things to obtain metrics using OpenCensus:

1. Create quantifiable metrics (numerical) that we will record
2. Create [tags](/core-concepts/tags) that we will associate with our metrics
3. Organize our metrics, similar to writing a report, in to a `View`
4. Export our views to a backend (Prometheus in this case)


## Getting Started

{{% notice note %}}
Unsure how to write and execute Go code? [Click here](https://golang.org/doc/code.html).
{{% /notice %}}

We will be a simple "read-evaluate-print-loop" (REPL) app. In there we'll collect some metrics to observe the work that is going on within this code, such as:

- Latency per processing loop
- Number of lines read
- Number of errors
- Line lengths

First, create a file called `repl.go`.
```bash
touch repl.go
```

Next, put the following code inside of `repl.go`:

```go
package main

import (
	"bufio"
	"bytes"
	"fmt"
	"io"
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
			if err == io.EOF {
				return
			}
			log.Fatal(err)
		}
	}
}

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	fmt.Printf("> ")
	line, _, err := br.ReadLine()
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

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(in []byte) (out []byte, err error) {
	return bytes.ToUpper(in), nil
}

```

You can run the code via `go run repl.go`.

## Enable Metrics

<a name="import-metrics-packages"></a>
### Import Packages

To enable metrics, we’ll import a couple of packages:

{{% tabs Snippet All %}}
```go
import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	fmt.Printf("> ")
	line, _, err := br.ReadLine()
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

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(in []byte) (out []byte, err error) {
	return bytes.ToUpper(in), nil
}
```
{{% /tabs %}}

<a name="create-metrics"></a>
### Create Metrics

First, we will create the variables needed to later record our metrics.

{{% tabs Snippet All %}}
```go
var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	fmt.Printf("> ")
	line, _, err := br.ReadLine()
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

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(in []byte) (out []byte, err error) {
	return bytes.ToUpper(in), nil
}
```
{{% /tabs %}}

### Create Tags

Now we will create the variable later needed to add extra text meta-data to our metrics.

{{% tabs Snippet All %}}
```go
var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	fmt.Printf("> ")
	line, _, err := br.ReadLine()
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

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(in []byte) (out []byte, err error) {
	return bytes.ToUpper(in), nil
}
```
{{% /tabs %}}

We will later use this tag, called KeyMethod, to record what method is being invoked. In our scenario, we will only use it to record that "repl" is calling our data.

Again, this is arbitrary and purely up the user. For example, if we wanted to track what operating system a user is using, we could do so like this:
```go
osKey, _ := tag.NewKey("operating_system")
```

Later, when we use osKey, we will be given an opportunity to enter values such as "windows" or "mac".

### Inserting Tags
Now we will insert a specific tag called "repl". It will give us a new `context.Context ctx` which we will use while we later record our metrics. This `ctx` has all tags that have previously been inserted, thus allowing for context propagation.

For example
```go
ctx, _ := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
```

and for complete usage:

{{% tabs Snippet All %}}
```go
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
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
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
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

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(in []byte) (out []byte, err error) {
	return bytes.ToUpper(in), nil
}
```
{{% /tabs %}}

When recording metrics, we will need the `ctx` from `tag.New`. We will be recording metrics in `processLine`, so let's go ahead and make `ctx` available now.

{{% tabs Snippet All %}}
```go
// ...
out, err := processLine(ctx, line)

// ...
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
  // ...
}
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	fmt.Printf("> ")
	line, _, err := br.ReadLine()
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

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {

	return bytes.ToUpper(in), nil
}

```
{{% /tabs %}}

### Recording Metrics

Now we will record the desired metrics. To do so, we will use `stats.Record` and pass in our `ctx` and [previously instantiated metrics variables](#create-metrics).

{{% tabs Snippet All %}}
```go
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	defer func() {
		if terr != nil {
			ctx, _ = tag.New(ctx, tag.Upsert(KeyStatus, "ERROR"),
				tag.Upsert(KeyError, terr.Error()))
		}

		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)))
	}()

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			return err
		}
		log.Fatal(err)
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	startTime := time.Now()
	defer func() {
		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)),
			MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}

func sinceInMilliseconds(startTime time.Time) float64 {
	return float64(time.Since(startTime).Nanoseconds()) / 1e6
}
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	defer func() {
		if terr != nil {
			ctx, _ = tag.New(ctx, tag.Upsert(KeyStatus, "ERROR"),
				tag.Upsert(KeyError, terr.Error()))
		}

		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)))
	}()

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			return err
		}
		log.Fatal(err)
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	startTime := time.Now()
	defer func() {
		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)),
			MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}

func sinceInMilliseconds(startTime time.Time) float64 {
	return float64(time.Since(startTime).Nanoseconds()) / 1e6
}
```
{{% /tabs %}}

## Enable Views
We will be adding the View package: `"go.opencensus.io/stats/view"`

<a name="import-views-packages"></a>
### Import Packages
{{% tabs Snippet All %}}
```go
import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	defer func() {
		if terr != nil {
			ctx, _ = tag.New(ctx, tag.Upsert(KeyStatus, "ERROR"),
				tag.Upsert(KeyError, terr.Error()))
		}

		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)))
	}()

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			return err
		}
		log.Fatal(err)
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	startTime := time.Now()
	defer func() {
		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)),
			MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}

func sinceInMilliseconds(startTime time.Time) float64 {
	return float64(time.Since(startTime).Nanoseconds()) / 1e6
}
```
{{% /tabs %}}

### Create Views
We now determine how our metrics will be organized by creating `Views`.

{{% tabs Snippet All %}}
```go
var (
	LatencyView = &view.View{
		Name:        "demo/latency",
		Measure:     MLatencyMs,
		Description: "The distribution of the latencies",

		// Latency in buckets:
		// [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
		Aggregation: view.Distribution(0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000),
		TagKeys:     []tag.Key{KeyMethod}}

	LineCountView = &view.View{
		Name:        "demo/lines_in",
		Measure:     MLineLengths,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
		Name:        "demo/line_lengths",
		Description: "Groups the lengths of keys in buckets",
		Measure:     MLineLengths,
		// Lengths: [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
		Aggregation: view.Distribution(0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000),
	}
)
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

var (
	LatencyView = &view.View{
		Name:        "demo/latency",
		Measure:     MLatencyMs,
		Description: "The distribution of the latencies",

		// Latency in buckets:
		// [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
		Aggregation: view.Distribution(0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000),
		TagKeys:     []tag.Key{KeyMethod}}

	LineCountView = &view.View{
		Name:        "demo/lines_in",
		Measure:     MLineLengths,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
		Name:        "demo/line_lengths",
		Description: "Groups the lengths of keys in buckets",
		Measure:     MLineLengths,
		// Lengths: [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
		Aggregation: view.Distribution(0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000),
	}
)

func main() {
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

// readEvaluateProcess reads a line from the input reader and
// then processes it. It returns an error if any was encountered.
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	defer func() {
		if terr != nil {
			ctx, _ = tag.New(ctx, tag.Upsert(KeyStatus, "ERROR"),
				tag.Upsert(KeyError, terr.Error()))
		}

		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)))
	}()

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			return err
		}
		log.Fatal(err)
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	startTime := time.Now()
	defer func() {
		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)),
			MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}

func sinceInMilliseconds(startTime time.Time) float64 {
	return float64(time.Since(startTime).Nanoseconds()) / 1e6
}
```
{{% /tabs %}}

### Register Views
We now register the views and set the reporting period.

{{% tabs Snippet All %}}
```go
func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// Register the views
	if err := view.Register(LatencyView, LineCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

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
```

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

var (
	LatencyView = &view.View{
		Name:        "demo/latency",
		Measure:     MLatencyMs,
		Description: "The distribution of the latencies",

		// Latency in buckets:
		// [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
		Aggregation: view.Distribution(0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000),
		TagKeys:     []tag.Key{KeyMethod}}

	LineCountView = &view.View{
		Name:        "demo/lines_in",
		Measure:     MLineLengths,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
		Name:        "demo/line_lengths",
		Description: "Groups the lengths of keys in buckets",
		Measure:     MLineLengths,
		// Lengths: [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
		Aggregation: view.Distribution(0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000),
	}
)

func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// Register the views
	if err := view.Register(LatencyView, LineCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

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
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	defer func() {
		if terr != nil {
			ctx, _ = tag.New(ctx, tag.Upsert(KeyStatus, "ERROR"),
				tag.Upsert(KeyError, terr.Error()))
		}

		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)))
	}()

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			return err
		}
		log.Fatal(err)
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	startTime := time.Now()
	defer func() {
		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)),
			MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}

func sinceInMilliseconds(startTime time.Time) float64 {
	return float64(time.Since(startTime).Nanoseconds()) / 1e6
}
```
{{% /tabs %}}

## Exporting stats

### Register the views

```go
// Register the views
if err := view.Register(LatencyView, LineCountView, LineLengthView); err != nil {
	log.Fatalf("Failed to register views: %v", err)
}
```

<a name="import-exporting-packages"></a>
### Import Packages
We will be adding the Prometheus Go exporter package package: `"contrib.go.opencensus.io/exporter/prometheus"`

### Create the exporter
In order for our metrics to be exported to Prometheus, our application needs to be exposed as a scrape endpoint.
The OpenCensus Go Prometheus exporter is an [http.Handler](golang.org/pkg/net/http#Handler) that MUST be attached
to http endpoint "/metrics".

```go
import (
	"log"
	"net/http"

	"contrib.go.opencensus.io/exporter/prometheus"
	"go.opencensus.io/stats/view"
)

func main() {
	pe, err := prometheus.NewExporter(prometheus.Options{
		Namespace: "ocmetricstutorial",
	})
	if err != nil {
		log.Fatalf("Failed to create the Prometheus stats exporter: %v", err)
	}

	// Now finally run the Prometheus exporter as a scrape endpoint.
	// We'll run the server on port 8888.
	go func() {
		mux := http.NewServeMux()
		mux.Handle("/metrics", pe)
		if err := http.ListenAndServe(":8888", mux); err != nil {
			log.Fatalf("Failed to run Prometheus scrape endpoint: %v", err)
		}
	}()
}
```

## End to end code
Collectively the code will be

```go
package main

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"contrib.go.opencensus.io/exporter/prometheus"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
	KeyStatus, _ = tag.NewKey("status")
	KeyError, _  = tag.NewKey("error")
)

var (
	LatencyView = &view.View{
		Name:        "demo/latency",
		Measure:     MLatencyMs,
		Description: "The distribution of the latencies",

		// Latency in buckets:
		// [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
		Aggregation: view.Distribution(0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000),
		TagKeys:     []tag.Key{KeyMethod}}

	LineCountView = &view.View{
		Name:        "demo/lines_in",
		Measure:     MLineLengths,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
		Name:        "demo/line_lengths",
		Description: "Groups the lengths of keys in buckets",
		Measure:     MLineLengths,
		// Lengths: [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
		Aggregation: view.Distribution(0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000),
	}
)

func main() {
	// Register the views, it is imperative that this step exists
	// lest recorded metrics will be dropped and never exported.
	if err := view.Register(LatencyView, LineCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register the views: %v", err)
	}

	// Create the Prometheus exporter.
	pe, err := prometheus.NewExporter(prometheus.Options{
		Namespace: "ocmetricstutorial",
	})
	if err != nil {
		log.Fatalf("Failed to create the Prometheus stats exporter: %v", err)
	}

	// Now finally run the Prometheus exporter as a scrape endpoint.
	// We'll run the server on port 8888.
	go func() {
		mux := http.NewServeMux()
		mux.Handle("/metrics", pe)
		if err := http.ListenAndServe(":8888", mux); err != nil {
			log.Fatalf("Failed to run Prometheus scrape endpoint: %v", err)
		}
	}()

	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// Register the views
	if err := view.Register(LatencyView, LineCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

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
func readEvaluateProcess(br *bufio.Reader) (terr error) {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"), tag.Insert(KeyStatus, "OK"))
	if err != nil {
		return err
	}

	defer func() {
		if terr != nil {
			ctx, _ = tag.New(ctx, tag.Upsert(KeyStatus, "ERROR"),
				tag.Upsert(KeyError, terr.Error()))
		}

		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)))
	}()

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			return err
		}
		log.Fatal(err)
	}

	out, err := processLine(ctx, line)
	if err != nil {
		return err
	}
	fmt.Printf("< %s\n\n", out)
	return nil
}

// processLine takes in a line of text and
// transforms it. Currently it just capitalizes it.
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
	startTime := time.Now()
	defer func() {
		stats.Record(ctx, MLatencyMs.M(sinceInMilliseconds(startTime)),
			MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}

func sinceInMilliseconds(startTime time.Time) float64 {
	return float64(time.Since(startTime).Nanoseconds()) / 1e6
}
```


### Running the tutorial

This step involves running the tutorial application in one terminal and then Prometheus itself in another terminal.

Having properly installed go, in one terminal, please run
```shell
go run repl.go
```

### Prometheus configuration file

To enable Prometheus to scrape from your application, we have to point it towards the tutorial application whose
server is running on "localhost:8888".

To do this, we firstly need to create a YAML file with the configuration e.g. `promconfig.yaml`
whose contents are:
```yaml
scrape_configs:
  - job_name: 'ocmetricstutorial'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8888']
```

### Running Prometheus

With that file saved as `promconfig.yaml` we should now be able to run Prometheus like this

```shell
prometheus --config.file=promconfig.yaml
```

and then return to the terminal that's running the Go metrics tutorial and generate some work by typing inside it and it will look something like:
![](/images/metrics-prometheus-sample-repl.png)

## Viewing your metrics
With the above you should now be able to navigate to the Prometheus UI at http://localhost:9090

which should show:

* Available metrics
![](/images/metrics-go-prometheus-all-metrics.png)

* Lines-in counts
![](/images/metrics-go-prometheus-lines_in.png)

* Latency distributions
![](/images/metrics-go-prometheus-latency-distribution.png)

* Line lengths distributions
![](/images/metrics-go-prometheus-line_lengths-distribution.png)


Resource|URL
---|---
Prometheus project|https://prometheus.io/
Prometheus Go exporter|https://godoc.org/contrib.go.opencensus.io/exporter/prometheus
Go exporters|[Go exporters](/guides/exporters/supported-exporters/go)
OpenCensus Go Stats package|https://godoc.org/go.opencensus.io/stats
OpenCensus Go Views package|https://godoc.org/go.opencensus.io/stats/view
