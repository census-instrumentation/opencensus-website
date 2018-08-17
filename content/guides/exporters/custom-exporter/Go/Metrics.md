---
title: "Metrics exporter"
draft: false
weight: 3
---

### Table of contents
- [Introduction](#introduction)
- [Implementation](#implementation)
- [Runnable example](#runnable-example)
- [Notes](#notes)
- [References](#references)

#### Introduction
A metrics/stats exporter must conform to the interface [stats/view.Exporter](https://godoc.org/go.opencensus.io/stats/view#Exporter) which for purposes of brevity is:

```go
import "go.opencensus.io/stats/view"

type Exporter interface {
    ExportView(vd *view.Data)
}
```

whose sole method `ExportView` is the one in which you'll process and translate [View Data](https://godoc.org/go.opencensus.io/stats/view#Data) into the data that your metrics backend accepts.

#### Implementation

For example, let's create a custom metrics/stats exporter that will print view data to standard output.

```go
import (
	"context"
	"log"
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

type customMetricsExporter struct{}

func (ce *customMetricsExporter) ExportView(vd *view.Data) {
	log.Printf("vd.View: %+v\n%#v\n", vd.View, vd.Rows)
	for i, row := range vd.Rows {
		log.Printf("\tRow: %#d: %#v\n", i, row)
	}
        log.Printf("StartTime: %s EndTime: %s\n\n", vd.Start.Round(0), vd.End.Round(0))
}
```

and then afterwards we must ensure that we invoke `view.RegisterExporter` with an instance of the exporter, like this:

```go
view.RegisterExporter(new(customMetricsExporter))
```

#### Runnable example
and now to test it out as we would in a typically linked program

```go
package main

import (
	"context"
	"log"
	"time"

	"go.opencensus.io/stats"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

type customMetricsExporter struct{}

func (ce *customMetricsExporter) ExportView(vd *view.Data) {
	log.Printf("vd.View: %+v\n%#v\n", vd.View, vd.Rows)
	for i, row := range vd.Rows {
		log.Printf("\tRow: %#d: %#v\n", i, row)
	}
        log.Printf("StartTime: %s EndTime: %s\n\n", vd.Start.Round(0), vd.End.Round(0))
}

func main() {
	log.SetFlags(0)
	// We need to have registered at least one view
	if err := view.Register(loopCountView); err != nil {
		log.Fatalf("Failed to register loopCountView: %v", err)
	}

	// Please remember to register your exporter
	// so that it can receive exported view Data.
	view.RegisterExporter(new(customMetricsExporter))

	// For demo purposes we'll use a very short view data reporting
	// period so that we can examine the stats send to our exporter, quickly.
	view.SetReportingPeriod(100 * time.Millisecond)

	ctx, _ := tag.New(context.Background(), tag.Upsert(keyMethod, "main"))
	for i := int64(0); i < 5; i++ {
		stats.Record(ctx, mLoops.M(i))
		<-time.After(10 * time.Millisecond)
	}
	<-time.After(500 * time.Millisecond)
}

// The measure and view to be used for demo purposes
var keyMethod, _ = tag.NewKey("method")
var mLoops = stats.Int64("demo/loop_iterations", "The number of loop iterations", "1")
var loopCountView = &view.View{
	Measure: mLoops, Name: "demo/loop_iterations",
	Description: "Number of loop iterations",
	Aggregation: view.Count(),
	TagKeys:     []tag.Key{keyMethod},
}
```

will print out something like this:
```shell
vd.View: &{Name:demo/loop_iterations Description:Number of loop iterations TagKeys:[{name:method}] Measure:0xc00000c030 Aggregation:0x118d8e0}
[]*view.Row{(*view.Row)(0xc0000762a0)}
	Row: 0: &view.Row{Tags:[]tag.Tag{tag.Tag{Key:tag.Key{name:"method"}, Value:"main"}}, Data:(*view.CountData)(0xc00001a098)}
StartTime: 2018-08-08 00:31:02.096592 -0700 PDT EndTime: 2018-08-08 00:31:02.096631 -0700 PDT

vd.View: &{Name:demo/loop_iterations Description:Number of loop iterations TagKeys:[{name:method}] Measure:0xc00000c030 Aggregation:0x118d8e0}
[]*view.Row{(*view.Row)(0xc000108000)}
	Row: 0: &view.Row{Tags:[]tag.Tag{tag.Tag{Key:tag.Key{name:"method"}, Value:"main"}}, Data:(*view.CountData)(0xc000106008)}
StartTime: 2018-08-08 00:31:02.096592 -0700 PDT EndTime: 2018-08-08 00:31:02.197023 -0700 PDT

vd.View: &{Name:demo/loop_iterations Description:Number of loop iterations TagKeys:[{name:method}] Measure:0xc00000c030 Aggregation:0x118d8e0}
[]*view.Row{(*view.Row)(0xc000108060)}
	Row: 0: &view.Row{Tags:[]tag.Tag{tag.Tag{Key:tag.Key{name:"method"}, Value:"main"}}, Data:(*view.CountData)(0xc000106080)}
StartTime: 2018-08-08 00:31:02.096592 -0700 PDT EndTime: 2018-08-08 00:31:02.301678 -0700 PDT

vd.View: &{Name:demo/loop_iterations Description:Number of loop iterations TagKeys:[{name:method}] Measure:0xc00000c030 Aggregation:0x118d8e0}
[]*view.Row{(*view.Row)(0xc000118000)}
	Row: 0: &view.Row{Tags:[]tag.Tag{tag.Tag{Key:tag.Key{name:"method"}, Value:"main"}}, Data:(*view.CountData)(0xc0000ca018)}
StartTime: 2018-08-08 00:31:02.096592 -0700 PDT EndTime: 2018-08-08 00:31:02.399842 -0700 PDT

vd.View: &{Name:demo/loop_iterations Description:Number of loop iterations TagKeys:[{name:method}] Measure:0xc00000c030 Aggregation:0x118d8e0}
[]*view.Row{(*view.Row)(0xc000118060)}
	Row: 0: &view.Row{Tags:[]tag.Tag{tag.Tag{Key:tag.Key{name:"method"}, Value:"main"}}, Data:(*view.CountData)(0xc0000ca090)}
StartTime: 2018-08-08 00:31:02.096592 -0700 PDT EndTime: 2018-08-08 00:31:02.498909 -0700 PDT
```

#### Notes

* Please remember to invoke [view.RegisterExporter](https://godoc.org/go.opencensus.io/stats/view#RegisterExporter) so that your exporter
will receive exported view data.

* To change the frequency at which your view data will be exported, please see [view.SetReportingPeriod](https://godoc.org/go.opencensus.io/stats/view#SetReportingPeriod)

#### References

Name|Link
---|---
Metrics/Stats GoDoc for Measures|[https://godoc.org/go.opencensus.io/stats](https://godoc.org/go.opencensus.io/stats)
Stats View GoDoc|[https://godoc.org/go.opencensus.io/stats/view](https://godoc.org/go.opencensus.io/stats/view)
OpenCensus Go exporters|[Some OpenCensus Go exporters](/supported-exporters/go/)
