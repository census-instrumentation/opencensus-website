---
title: "Trace exporter"
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
A trace exporter must conform to the interface [trace.Exporter](https://godoc.org/go.opencensus.io/trace#Exporter)

which for purposes of brevity is:

```go
import "go.opencensus.io/trace"

type Exporter interface {
    ExportSpan(s *trace.SpanData)
}
```

whose sole method `ExportSpan` is the one in which you'll process and translate [Span Data](https://godoc.org/go.opencensus.io/trace#SpanData) into the data that your trace backend accepts.

#### Implementation

For example, let's make a custom trace exporter that will print span data to standard output.

```go
import (
	"log"

	"go.opencensus.io/trace"
)

type customExporter struct{}

// Compile time assertion that the exporter implements trace.Exporter
var _ trace.Exporter = (*customExporter)(nil)

func (cse *customExporter) ExportSpan(sd *trace.SpanData) {
	log.Printf("Name: %s\nTraceID: %x\nSpanID: %x\nParentSpanID: %x\nStartTime: %s\nEndTime: %s\nAnnotations: %+v\n",
		sd.Name, sd.TraceID, sd.SpanID, sd.ParentSpanID, sd.StartTime, sd.EndTime, sd.Annotations)
}
```

and then afterwards we must ensure that we invoke `trace.RegisterExporter` with an instance of the exporter, like this:

```go
trace.RegisterExporter(new(customTraceExporter))
```

#### Runnable example
and now to test it out as we would in a typically linked program

```go
package main

import (
	"context"
	"fmt"
	"time"

	"go.opencensus.io/trace"
)

type customTraceExporter struct{}

func (ce *customTraceExporter) ExportSpan(sd *trace.SpanData) {
	fmt.Printf("Name: %s\nTraceID: %x\nSpanID: %x\nParentSpanID: %x\nStartTime: %s\nEndTime: %s\nAnnotations: %+v\n\n",
		sd.Name, sd.TraceID, sd.SpanID, sd.ParentSpanID, sd.StartTime, sd.EndTime, sd.Annotations)
}

func main() {
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// Please remember to register your exporter
	// so that it can receive exported spanData.
	trace.RegisterExporter(new(customTraceExporter))

	for i := 0; i < 5; i++ {
		_, span := trace.StartSpan(context.Background(), fmt.Sprintf("sample-%d", i))
		span.Annotate([]trace.Attribute{trace.Int64Attribute("invocations", 1)}, "Invoked it")
		span.End()
                <-time.After(10 * time.Millisecond)
	}
	<-time.After(500 * time.Millisecond)
}
```

will print out something like this

```shell
$ go run trace.go 
Name: sample-0
TraceID: 3635343562376561613230663237336363393634666366376234643430663662
SpanID: 64653466326237353234396336636564
ParentSpanID: 30303030303030303030303030303030
StartTime: 2018-08-07 23:56:28.988467 -0700 PDT m=+0.000804818
EndTime: 2018-08-07 23:56:28.988476405 -0700 PDT m=+0.000814223
Annotations: [{Time:2018-08-07 23:56:28.988472 -0700 PDT m=+0.000809888 Message:Invoked it Attributes:map[invocations:1]}]

Name: sample-1
TraceID: 3631356237303164353934366438313833613738396531646234393631613864
SpanID: 63666339366562323265316464633435
ParentSpanID: 30303030303030303030303030303030
StartTime: 2018-08-07 23:56:28.999329 -0700 PDT m=+0.011666890
EndTime: 2018-08-07 23:56:28.999364111 -0700 PDT m=+0.011702001
Annotations: [{Time:2018-08-07 23:56:28.999345 -0700 PDT m=+0.011682925 Message:Invoked it Attributes:map[invocations:1]}]

Name: sample-2
TraceID: 3932373762333630316665363537636262383734366239616466333134333761
SpanID: 63303433623265663338396534623965
ParentSpanID: 30303030303030303030303030303030
StartTime: 2018-08-07 23:56:29.010102 -0700 PDT m=+0.022440081
EndTime: 2018-08-07 23:56:29.010108997 -0700 PDT m=+0.022447078
Annotations: [{Time:2018-08-07 23:56:29.010104 -0700 PDT m=+0.022442411 Message:Invoked it Attributes:map[invocations:1]}]

Name: sample-3
TraceID: 3837656536656334653364353364353631643866386366623739396230386263
SpanID: 62316264663532633433316662626636
ParentSpanID: 30303030303030303030303030303030
StartTime: 2018-08-07 23:56:29.022949 -0700 PDT m=+0.035286932
EndTime: 2018-08-07 23:56:29.022955736 -0700 PDT m=+0.035293668
Annotations: [{Time:2018-08-07 23:56:29.022951 -0700 PDT m=+0.035289112 Message:Invoked it Attributes:map[invocations:1]}]

Name: sample-4
TraceID: 3939356334633639616539393962386366643234363936613531643931383962
SpanID: 61323337333936613464613032613466
ParentSpanID: 30303030303030303030303030303030
StartTime: 2018-08-07 23:56:29.03581 -0700 PDT m=+0.048148078
EndTime: 2018-08-07 23:56:29.035817031 -0700 PDT m=+0.048155109
Annotations: [{Time:2018-08-07 23:56:29.035812 -0700 PDT m=+0.048150248 Message:Invoked it Attributes:map[invocations:1]}]
```

#### Notes

* Please remember to invoke [trace.RegisterExporter](https://godoc.org/go.opencensus.io/trace#RegisterExporter) so that your exporter
will receive exported spans.

* Your exporter will be invoked after a span's [End](https://godoc.org/go.opencensus.io/trace#Span.End) method has been invoked
* If you need to do heavy processing in the `ExportSpan` method, please do it in a goroutine because ExportSpan is invoked
on the fast path

#### References

Name|Link
---|---
Trace GoDoc|[https://godoc.org/go.opencensus.io/trace](https://godoc.org/go.opencensus.io/trace)
OpenCensus Go exporters|[Some OpenCensus Go exporters](/supported-exporters/go/)
