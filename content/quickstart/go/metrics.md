---
title: "Metrics"
date: 2018-07-16T14:29:10-07:00
draft: false
class: "shadowed-image lightbox"
---

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

#### Table of contents

- [Requirements](#background)
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
- [Exporting to Stackdriver](#exporting-to-stackdriver)
    - [Import Packages](#import-exporting-packages)
    - [Export Views](#export-views)
- [Viewing your Metrics on Stackdriver](#viewing-your-metrics-on-stackdriver)

In this quickstart, we’ll learn gleam insights into a segment of code and learn how to:

1. Collect metrics using [OpenCensus Metrics](/core-concepts/metrics) and [Tags](/core-concepts/tags)
2. Register and enable an exporter for a [backend](http://localhost:1313/core-concepts/exporters/#supported-backends) of our choice
3. View the metrics on the backend of our choice

#### Requirements
- Go1.9 and above
- Google Cloud Platform account anproject
- Google Stackdriver Tracing enabled on your project (Need help? [Click here](/codelabs/stackdriver))

#### Installation

OpenCensus: `go get go.opencensus.io/*`

Stackdriver exporter: `go get contrib.go.opencensus.io/exporter/stackdriver`

#### Brief Overview
By the end of this tutorial, we will do these four things to obtain metrics using OpenCensus:

1. Create quantifiable metrics (numerical) that we will record
2. Create [tags](/core-concepts/tags) that we will associate with our metrics
3. Organize our metrics, similar to a writing a report, in to a `View`
4. Export our views to a backend (Stackdriver in this case)


#### Getting Started

{{% notice note %}}
Unsure how to write and execute Go code? [Click here](https://golang.org/doc/code.html).
{{% /notice %}}

We will be a simple "read-evaluate-print" (REPL) app. In there we'll collect some metrics to observe the work that is going on this code, such as:

- Latency per processing loop
- Number of lines read
- Number of errors
- Line lengths

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
{{</highlight>}}

You can run the code via `go run repl.go`.

#### Enable Metrics

<a name="import-metrics-packages"></a>
##### Import Packages

To enable metrics, we’ll import a number of core and OpenCensus packages

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
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
func readEvaluateProcess(br *bufio.Reader) error {
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
{{</highlight>}}
{{</tabs>}}

<a name="create-metrics"></a>
##### Create Metrics

First, we will create the variables needed to later record our metrics.

{{<tabs Snippet All>}}
{{<highlight go>}}
var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

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
func readEvaluateProcess(br *bufio.Reader) error {
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
{{</highlight>}}
{{</tabs>}}

##### Create Tags

Now we will create the variable later needed to add extra text meta-data to our metrics.

{{<tabs Snippet All>}}
{{<highlight go>}}
var (
	KeyMethod, _ = tag.NewKey("method")
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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
func readEvaluateProcess(br *bufio.Reader) error {
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
{{</highlight>}}
{{</tabs>}}

We will later use this tag, called KeyMethod, to record what method is being invoked. In our scenario, we will only use it to record that "repl" is calling our data.

Again, this is arbitrary and purely up the user. For example, if we wanted to track what operating system a user is using, we could do so like this:
```go
osKey, _ := tag.NewKey("operating_system")
```

Later, when we use osKey, we will be given an opportunity to enter values such as "windows" or "mac".

##### Inserting Tags
Now we will insert a specific tag called "repl". It will give us a new `context.Context ctx` which we will use while we later record our metrics. This `ctx` has all tags that have previously been inserted, thus allowing for context propagation.

{{<tabs Snippet All>}}
{{<highlight go>}}
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
func readEvaluateProcess(br *bufio.Reader) error {
  ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
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
{{</highlight>}}
{{</tabs>}}

When recording metrics, we will need the `ctx` from `tag.New`. We will be recording metrics in `processLine`, so let's go ahead and make `ctx` available now.

{{<tabs Snippet All>}}
{{<highlight go>}}
// ...
out, err := processLine(ctx, line)

// ...
func processLine(ctx context.Context, in []byte) (out []byte, err error) {
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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
func readEvaluateProcess(br *bufio.Reader) error {
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
{{</highlight>}}
{{</tabs>}}

##### Recording Metrics

Now we will record the desired metrics. To do so, we will use `stats.Record` and pass in our `ctx` and [previously instantiated metrics variables](#create-metrics).

{{<tabs Snippet All>}}
{{<highlight go>}}
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			stats.Record(ctx, MErrors.M(1))
		}
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		stats.Record(ctx, MErrors.M(1))
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
		ms := float64(time.Since(startTime).Nanoseconds()) / 1e6
		stats.Record(ctx, MLinesIn.M(1), MLatencyMs.M(ms), MLineLengths.M(int64(len(in))))
	}()

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

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			stats.Record(ctx, MErrors.M(1))
		}
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		stats.Record(ctx, MErrors.M(1))
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
		ms := float64(time.Since(startTime).Nanoseconds()) / 1e6
		stats.Record(ctx, MLinesIn.M(1), MLatencyMs.M(ms), MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

#### Enable Views
We will be adding the View package: `"go.opencensus.io/stats/view"`

<a name="import-views-packages"></a>
##### Import Packages
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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			stats.Record(ctx, MErrors.M(1))
		}
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		stats.Record(ctx, MErrors.M(1))
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
		ms := float64(time.Since(startTime).Nanoseconds()) / 1e6
		stats.Record(ctx, MLinesIn.M(1), MLatencyMs.M(ms), MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

##### Create Views
We now determine how our metrics will be organized by creating `Views`.

{{<tabs Snippet All>}}
{{<highlight go>}}
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
		Measure:     MLinesIn,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	ErrorCountView = &view.View{
		Name:        "demo/errors",
		Measure:     MErrors,
		Description: "The number of errors encountered",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
		Description: "Groups the lengths of keys in buckets",
		Measure:     MLineLengths,
		// Lengths: [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
		Aggregation: view.Distribution(0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000),
	}
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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
		Measure:     MLinesIn,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	ErrorCountView = &view.View{
		Name:        "demo/errors",
		Measure:     MErrors,
		Description: "The number of errors encountered",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
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
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			stats.Record(ctx, MErrors.M(1))
		}
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		stats.Record(ctx, MErrors.M(1))
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
		ms := float64(time.Since(startTime).Nanoseconds()) / 1e6
		stats.Record(ctx, MLinesIn.M(1), MLatencyMs.M(ms), MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

##### Register Views
We now register the views and set the reporting period.

{{<tabs Snippet All>}}
{{<highlight go>}}
func main() {
	// In a REPL:
	//   1. Read input
	//   2. process input
	br := bufio.NewReader(os.Stdin)

	// Register the views
	if err := view.Register(LatencyView, LineCountView, ErrorCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

	// But also we can change the metrics reporting period to 2 seconds
	view.SetReportingPeriod(2 * time.Second)

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
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
		Measure:     MLinesIn,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	ErrorCountView = &view.View{
		Name:        "demo/errors",
		Measure:     MErrors,
		Description: "The number of errors encountered",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
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
	if err := view.Register(LatencyView, LineCountView, ErrorCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

	// But also we can change the metrics reporting period to 2 seconds
	view.SetReportingPeriod(2 * time.Second)

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
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			stats.Record(ctx, MErrors.M(1))
		}
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		stats.Record(ctx, MErrors.M(1))
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
		ms := float64(time.Since(startTime).Nanoseconds()) / 1e6
		stats.Record(ctx, MLinesIn.M(1), MLatencyMs.M(ms), MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

#### Exporting to Stackdriver

<a name="import-exporting-packages"></a>
##### Import Packages
We will be adding the Stackdriver package: `"contrib.go.opencensus.io/exporter/stackdriver"`

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
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
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
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
		Measure:     MLinesIn,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	ErrorCountView = &view.View{
		Name:        "demo/errors",
		Measure:     MErrors,
		Description: "The number of errors encountered",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
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
	if err := view.Register(LatencyView, LineCountView, ErrorCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

	// But also we can change the metrics reporting period to 2 seconds
	view.SetReportingPeriod(2 * time.Second)

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
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			stats.Record(ctx, MErrors.M(1))
		}
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		stats.Record(ctx, MErrors.M(1))
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
		ms := float64(time.Since(startTime).Nanoseconds()) / 1e6
		stats.Record(ctx, MLinesIn.M(1), MLatencyMs.M(ms), MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

##### Export Views
In our `main` function, first we create the Stackdriver exporter:
```go
// Create that Stackdriver stats exporter
sd, err := stackdriver.NewExporter(stackdriver.Options{
	ProjectID:    os.Getenv("GCP_PROJECT_ID"),
	MetricPrefix: os.Getenv("GCP_METRIC_PREFIX"),
})
if err != nil {
  log.Fatalf("Failed to create the Stackdriver stats exporter: %v", err)
}
defer sd.Flush()
```

Then we register the views with Stackdriver:
```go
// Register the stats exporter
view.RegisterExporter(sd)
```

{{<tabs Snippet All>}}
{{<highlight go>}}
func main() {
	// Create that Stackdriver stats exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    os.Getenv("GCP_PROJECT_ID"),
		MetricPrefix: os.Getenv("GCP_METRIC_PREFIX"),
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver stats exporter: %v", err)
	}
	defer sd.Flush()

	// Register the stats exporter
	view.RegisterExporter(sd)

	// Register the views
	if err := view.Register(LatencyView, LineCountView, ErrorCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

	// But also we can change the metrics reporting period to 2 seconds
	view.SetReportingPeriod(2 * time.Second)

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
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

var (
	// The latency in milliseconds
	MLatencyMs = stats.Float64("repl/latency", "The latency in milliseconds per REPL loop", "ms")

	// Counts the number of lines read in from standard input
	MLinesIn = stats.Int64("repl/lines_in", "The number of lines read in", "1")

	// Encounters the number of non EOF(end-of-file) errors.
	MErrors = stats.Int64("repl/errors", "The number of errors encountered", "1")

	// Counts/groups the lengths of lines read in.
	MLineLengths = stats.Int64("repl/line_lengths", "The distribution of line lengths", "By")
)

var (
	KeyMethod, _ = tag.NewKey("method")
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
		Measure:     MLinesIn,
		Description: "The number of lines from standard input",
		Aggregation: view.Count(),
	}

	ErrorCountView = &view.View{
		Name:        "demo/errors",
		Measure:     MErrors,
		Description: "The number of errors encountered",
		Aggregation: view.Count(),
	}

	LineLengthView = &view.View{
		Description: "Groups the lengths of keys in buckets",
		Measure:     MLineLengths,
		// Lengths: [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
		Aggregation: view.Distribution(0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000),
	}
)

func main() {
	// Create that Stackdriver stats exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    os.Getenv("GCP_PROJECT_ID"),
		MetricPrefix: os.Getenv("GCP_METRIC_PREFIX"),
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdriver stats exporter: %v", err)
	}
	defer sd.Flush()

	// Register the stats exporter
	view.RegisterExporter(sd)

	// Register the views
	if err := view.Register(LatencyView, LineCountView, ErrorCountView, LineLengthView); err != nil {
		log.Fatalf("Failed to register views: %v", err)
	}

	// But also we can change the metrics reporting period to 2 seconds
	view.SetReportingPeriod(2 * time.Second)

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
func readEvaluateProcess(br *bufio.Reader) error {
	ctx, err := tag.New(context.Background(), tag.Insert(KeyMethod, "repl"))
	if err != nil {
		return err
	}

	fmt.Printf("> ")
	line, _, err := br.ReadLine()
	if err != nil {
		if err != io.EOF {
			stats.Record(ctx, MErrors.M(1))
		}
		return err
	}

	out, err := processLine(ctx, line)
	if err != nil {
		stats.Record(ctx, MErrors.M(1))
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
		ms := float64(time.Since(startTime).Nanoseconds()) / 1e6
		stats.Record(ctx, MLinesIn.M(1), MLatencyMs.M(ms), MLineLengths.M(int64(len(in))))
	}()

	return bytes.ToUpper(in), nil
}
{{</highlight>}}
{{</tabs>}}

#### Viewing your Metrics on Stackdriver
With the above you should now be able to navigate to the [Google Cloud Platform console](https://app.google.stackdriver.com/metrics-explorer), select your project, and view the metrics.

In the query box to find metrics, type `quickstart` as a prefix:

![viewing metrics 1](https://cdn-images-1.medium.com/max/1600/1*kflo3l46PslT6oZDNCJ23A.png)

And on selecting any of the metrics e.g. `quickstart/demo/lines_in`, we’ll get...

![viewing metrics 2](https://cdn-images-1.medium.com/max/1600/1*6lUs1yCzewMgzCWv2wtbVQ.png)

Let’s examine the latency buckets:

![viewing metrics 3](https://cdn-images-1.medium.com/max/1600/1*o0cPi--Y5IYrrvdQ0IJQKw.png)

On checking out the Stacked Area display of the latency, we can see that the 99th percentile latency was 24.75ms. And, for `line_lengths`:

![viewing metrics 4](https://cdn-images-1.medium.com/max/1600/1*roe_0ZNOZiMnTVs3VzG0AQ.png)
