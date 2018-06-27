+++
Description = "go"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
type = "leftnav"

title = "Go"
date = "2018-05-17T14:17:26-05:00"
+++

The example demonstrates how to record stats and traces for a video processing system. It records data with the “frontend” tag so that collected data can be broken by the frontend user who initiated the video processing.  

---

#### API Documentation  
The OpenCensus Go API artifact is available here:  
[{{< sc_gloss1 >}}https://godoc.org/go.opencensus.io{{< /sc_gloss1 >}}](https://godoc.org/go.opencensus.io)  

---
#### Example
This guide helps you write a Go program instrumented with OpenCensus.  

**Prerequisites**  

Go 1.8 or higher is required. Make sure you have 1.8+ installed by running:

```bash
$ go version
```  

**Installation**

Install the OpenCensus packages by running:

```bash
$ go get go.opencensus.io
```

See the [{{< sc_gloss1 >}}tag{{< /sc_gloss1 >}}](https://godoc.org/go.opencensus.io/tag), [{{< sc_gloss1 >}}stats{{< /sc_gloss1 >}}](https://godoc.org/go.opencensus.io/stats), [{{< sc_gloss1 >}}trace{{< /sc_gloss1 >}}](https://godoc.org/go.opencensus.io/trace) godoc for the API reference and [{{< sc_gloss1 >}}examples{{< /sc_gloss1 >}}](https://github.com/census-instrumentation/opencensus-go/tree/master/examples) directory for samples.  

**Example**  

The following example uses  demonstrates how to record stats and traces for a video processing system. It records data with the “frontend” dimension to be able to break down collected data by the frontend user started the video processing from.

```
$ cd $(go env GOPATH)/src/go.opencensus.io/examples/helloworld
$ go get -v . # get the dependencies
$ go run main.go
```

``` go
// Command helloworld is an example program that collects data for
// video size.
package main

import (
  "context"
  "fmt"
  "log"
  "math/rand"
  "time"

  "go.opencensus.io/examples/exporter"
  "go.opencensus.io/stats"
  "go.opencensus.io/stats/view"
  "go.opencensus.io/tag"
  "go.opencensus.io/trace"
)

var (
  // frontendKey allows us to breakdown the recorded data
  // by the frontend used when uploading the video.
  frontendKey tag.Key

  // videoSize will measure the size of processed videos.
  videoSize *stats.Int64Measure
)

func main() {
  ctx := context.Background()

  // Register an exporter to be able to retrieve
  // the data from the subscribed views.
  e := &exporter.PrintExporter{}
  view.RegisterExporter(e)
  trace.RegisterExporter(e)

  var err error
  frontendKey, err = tag.NewKey("my.org/keys/frontend")
  if err != nil {
   log.Fatal(err)
  }
  videoSize, err = stats.Int64("my.org/measure/video_size",
   "size of processed videos", "MBy")
  if err != nil {
   log.Fatalf("Video size measure not created: %v", err)
  }

  // Create view to see the processed video size
  // distribution broken down by frontend.
  v, err := view.New(
   "my.org/views/video_size",
   "processed video size over time",
   []tag.Key{frontendKey},
   videoSize,
   view.DistributionAggregation([]float64{0, 1 << 16, 1 << 32}),
  )
  if err != nil {
   log.Fatalf("Cannot create view: %v", err)
  }

  // Subscribe will allow view data to be exported.
  // Once no longer need, you can unsubscribe from the view.
  if err := v.Subscribe(); err != nil {
   log.Fatalf("Cannot subscribe to the view: %v", err)
  }

  // Process the video.
  process(ctx)

  // Wait for a duration longer than reporting
  duration to ensure the stats
  // library reports the collected data.
  fmt.Println("Wait longer than the reporting duration...")
  time.Sleep(2 * time.Second)
}

// process processes the video and instruments the processing
// by creating a span and collecting metrics about the operation.
func process(ctx context.Context) {
  ctx, err := tag.New(ctx,
   tag.Insert(frontendKey, "mobile-ios9.3.5"),
  )
  if err != nil {
   log.Fatal(err)
  }
  ctx, span := trace.StartSpan(ctx, "my.org/ProcessVideo")
  defer span.End()
  // Process video.
  // Record the processed video size.
  // Sleep for [1,10] milliseconds to fake work.
  time.Sleep(time.Duration(rand.Intn(10)+1) * time.Millisecond)

  stats.Record(ctx, videoSize.M(25648))
}
```
