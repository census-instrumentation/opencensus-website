---
title: "gomodule/redigo"
date: 2018-08-31T11:39:38-07:00
draft: false
class: "integration-page"
---

- [Introduction](#introduction)
- [Enabling observability](#enabling-observability)
    - [Metrics](#metrics)
    - [Tracing](#tracing)
- [End-to-end example](#end-to-end-example)
- [References](#references)

## Introduction
A fork of the package ["gomodule/redigo"](https://github.com/gomodule/redigo)  has been instrumented with [OpenCensus for tracing and metrics](https://godoc.org/github.com/opencensus-integrations/redigo/redis).

The eventual plan is to merge this instrumentation to the upstream repository but for now, to use the instrumented package: 

Please include "github.com/opencensus-integrations/redigo/redis" in your imports, like this
```go
import "github.com/opencensus-integrations/redigo/redis"
```

The most important change is that the `Conn` returned from the redisPool should be type asserted to
`ConnWithContext`. For brevity, [ConnWithContext](https://godoc.org/github.com/opencensus-integrations/redigo/redis#ConnWithContext) is

```go
type ConnWithContext interface {
        Conn

        // CloseContext closes the connection.
        CloseContext(context.Context) error

        // DoContext sends a command to the server and returns the received reply.
        DoContext(ctx context.Context, commandName string, args ...interface{}) (reply interface{}, err error)

        // SendContext writes the command to the client's output buffer.
        SendContext(ctx context.Context, commandName string, args ...interface{}) error

        // FlushContext flushes the output buffer to the Redis server.
        FlushContext(context.Context) error

        // ReceiveContext receives a single reply from the Redis server
        ReceiveContext(context.Context) (reply interface{}, err error)
}
```
which means that for every pooled connection retrieval, please type assert and then use the `Context`-suffixed methods to enable context propagation and continuity

```go
        conn := redisPool.GetWithContext(ctx).(redis.ConnWithContext)
        defer conn.CloseContext(ctx)
```

## End to end example

Given an excerpt from a part of a gaming backend; an application that saves leaderboards to a sorted list:

It maps a userID to their current score, where Redis' sorted sets help with automatically sorting.

{{<highlight go>}}
package main

import (
	"context"
	"log"
	"time"

	"github.com/opencensus-integrations/redigo/redis"
)

var redisPool = &redis.Pool{
	Dial: func() (redis.Conn, error) {
		return redis.Dial("tcp", "localhost:6379")
	},
	TestOnBorrow: func(c redis.Conn, t time.Time) error {
		if time.Since(t) < (5 * time.Minute) {
			return nil
		}
		_, err := c.Do("PING")
		return err
	},
}

func main() {
	ctx := context.Background()
	conn := redisPool.GetWithContext(ctx)
	defer conn.Close()

	log.SetFlags(0)

	leaderBoardKey := "leader-board-scores"
	_, _ = conn.DoContext(ctx, "ZADD", leaderBoardKey, 10, "76d38ff6-fd76-4fb1-ba26-e8779a766faf", 25, "98fb173b-ae91-4b46-9401-20e98e5856d9")

	dt, err := conn.DoContext(ctx, "ZSCAN", leaderBoardKey, 0)
	if err != nil {
		log.Fatalf("Failed to run ZSCAN: %v", err)
	}

	log.Printf("ZSCAN response: %s\n", dt)

	// Now clean up
	_, _ = conn.DoContext(ctx, "DEL", leaderBoardKey)
}
{{</highlight>}}

We can trivially enable OpenCensus tracing and metric collection for observability into the behavior of our game ranking service

## Enabling observability

To extract the observability signals `traces` and `metrics` from the instrumented library, we'll proceed as follows:

### Metrics

The recorded metrics include

Metric|Definition|Unit|Tags used
---|---|---|---
Number of bytes read, as a distribution|redis/bytes_read|`By`|`cmd`
Number of bytes written, as a distribution|redis/bytes_written|`By`|`cmd`
Number of errors|redis/errors|`1`|`cmd`, `detail`, `kind`
Number of writes|redis/writes|`1`|`cmd`
Number of reads|redis/reads|`1`|`cmd`
Roundtrip latency as a distribution|redis/roundtrip_latency|`ms`|`cmd`
Number of connections that have been closed|redis/connections_closed|`1`|`state`
Number of connections that are open|redis/connections_open|`1`|`state`

To enable metrics recording, we'll follow the normal procedure for [enabling metrics](/quickstart/go/metrics#register-views) by:

* Registering the views 
* Enabling a Metrics exporter from the [Go exporters list](/guides/exporters/supported-exporters/go)

For the purpose of this demo, we'll be using Stackdriver

{{% notice tip %}}
For assistance setting up Stackdriver, please visit this [Stackdriver setup guided codelab](/codelabs/stackdriver)
{{% /notice %}}


{{<tabs Metrics All>}}
{{<highlight go>}}
package main

import (
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats/view"

	"github.com/opencensus-integrations/redigo/redis"
)

func enableOpenCensus() (func(), error) {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		// Change your ProjectID here.
		ProjectID: "census-demos",
		// Change the metric prefix as desirable, for easy filtering/finding of metrics
		MetricPrefix: "redigodemo",
	})
	if err != nil {
		return nil, err
	}

	// Enable metrics
	if err := view.Register(redis.ObservabilityMetricViews...); err != nil {
		return nil, err
	}
	view.RegisterExporter(sd)
	view.SetReportingPeriod(60 * time.Second)

	return sd.Flush, nil
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"context"
	"log"
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats/view"

	"github.com/opencensus-integrations/redigo/redis"
)

var redisPool = &redis.Pool{
	Dial: func() (redis.Conn, error) {
		return redis.Dial("tcp", "localhost:6379")
	},
	TestOnBorrow: func(c redis.Conn, t time.Time) error {
		if time.Since(t) < (5 * time.Minute) {
			return nil
		}
		_, err := c.Do("PING")
		return err
	},
}

func main() {
	flushFn, err := enableOpenCensus()
	if err != nil {
		log.Fatalf("Failed to enable OpenCensus exporting: %v", err)
	}
	defer func() {
		// Wait for ~60 seconds before exiting to allow metrics to be flushed
		log.Println("Waiting for ~60s to allow metrics to be exported")
		<-time.After(62 * time.Second)
		flushFn()
	}()

        ctx := context.Background()

	conn := redisPool.GetWithContext(ctx).(redis.ConnWithContext)
	defer conn.CloseContext(ctx)

	log.SetFlags(0)

	leaderBoardKey := "leader-board-scores"
	_, _ = conn.DoContext(ctx, "ZADD", leaderBoardKey, 10, "76d38ff6-fd76-4fb1-ba26-e8779a766faf", 25, "98fb173b-ae91-4b46-9401-20e98e5856d9")

	dt, err := conn.DoContext(ctx, "ZSCAN", leaderBoardKey, 0)
	if err != nil {
		log.Fatalf("Failed to run ZSCAN: %v", err)
	}

	log.Printf("ZSCAN response: %s\n", dt)

	// Now clean up
	_, _ = conn.DoContext(ctx, "DEL", leaderBoardKey)
}

func enableOpenCensus() (func(), error) {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		// Change your ProjectID here.
		ProjectID: "census-demos",
		// Change the metric prefix as desirable, for easy filtering/finding of metrics
		MetricPrefix: "redigodemo",
	})
	if err != nil {
		return nil, err
	}

	// Enable metrics
	if err := view.Register(redis.ObservabilityMetricViews...); err != nil {
		return nil, err
	}
	view.RegisterExporter(sd)
	view.SetReportingPeriod(50 * time.Millisecond)

	return sd.Flush, nil
}
{{</highlight>}}
{{</tabs>}}

### Tracing

Tracing can be enabled by just passing in a context, into each of the `ConnWithContext` methods. However, for purposes of detailed and more organized traces, we'll
also add custom traces

{{<highlight go>}}
package main

import (
	"context"
	"log"
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/trace"

	"github.com/opencensus-integrations/redigo/redis"
)

var redisPool = &redis.Pool{
	Dial: func() (redis.Conn, error) {
		return redis.Dial("tcp", "localhost:6379")
	},
	TestOnBorrow: func(c redis.Conn, t time.Time) error {
		if time.Since(t) < (5 * time.Minute) {
			return nil
		}
		_, err := c.Do("PING")
		return err
	},
}

func main() {
	flushFn, err := enableOpenCensus()
	if err != nil {
		log.Fatalf("Failed to enable OpenCensus exporting: %v", err)
	}
	defer func() {
		// Wait for 2 seconds before exiting to allow traces to be flushed
		<-time.After(2 * time.Second)
		flushFn()
	}()

	ctx, span := trace.StartSpan(context.Background(), "LeaderBoardModification")
	defer span.End()

	conn := redisPool.GetWithContext(ctx).(redis.ConnWithContext)
	defer conn.CloseContext(ctx)

	log.SetFlags(0)

	leaderBoardKey := "leader-board-scores"
	addCtx, addSpan := trace.StartSpan(ctx, "AddToLeaderBoard")
	_, _ = conn.DoContext(addCtx, "ZADD", leaderBoardKey, 10, "76d38ff6-fd76-4fb1-ba26-e8779a766faf", 25, "98fb173b-ae91-4b46-9401-20e98e5856d9")
	addSpan.End()

	scanCtx, scanSpan := trace.StartSpan(ctx, "Scan")
	dt, err := conn.DoContext(scanCtx, "ZSCAN", leaderBoardKey, 0)
	scanSpan.End()
	if err != nil {
		scanSpan.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		log.Fatalf("Failed to run ZSCAN: %v", err)
		return
	}

	log.Printf("ZSCAN response: %s\n", dt)

	// Now clean up
	delCtx, delSpan := trace.StartSpan(ctx, "Cleanup")
	_, _ = conn.DoContext(delCtx, "DEL", leaderBoardKey)
	delSpan.End()
}

func enableOpenCensus() (func(), error) {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		// Change your ProjectID here.
		ProjectID: "census-demos",
	})
	if err != nil {
		return nil, err
	}

	// Enable tracing
	trace.RegisterExporter(sd)
	// For demo purposes, we are always sampling
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	return sd.Flush, nil
}
{{</highlight>}}

## End to end example

With metrics and tracing all combined, we'll then have the following code

{{<highlight go>}}
package main

import (
	"context"
	"log"
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/trace"
	"go.opencensus.io/stats/view"
	
	"github.com/opencensus-integrations/redigo/redis"
)

var redisPool = &redis.Pool{
	Dial: func() (redis.Conn, error) {
		return redis.Dial("tcp", "localhost:6379")
	},
	TestOnBorrow: func(c redis.Conn, t time.Time) error {
		if time.Since(t) < (5 * time.Minute) {
			return nil
		}
		_, err := c.Do("PING")
		return err
	},
}

func main() {
	flushFn, err := enableOpenCensus()
	if err != nil {
		log.Fatalf("Failed to enable OpenCensus exporting: %v", err)
	}
	defer func() {
		// Wait for 2 seconds before exiting to allow traces to be flushed
		<-time.After(2 * time.Second)
		flushFn()
	}()

	ctx, span := trace.StartSpan(context.Background(), "LeaderBoardModification")
	defer span.End()

	conn := redisPool.GetWithContext(ctx).(redis.ConnWithContext)
	defer conn.CloseContext(ctx)

	log.SetFlags(0)

	leaderBoardKey := "leader-board-scores"
	addCtx, addSpan := trace.StartSpan(ctx, "AddToLeaderBoard")
	_, _ = conn.DoContext(addCtx, "ZADD", leaderBoardKey, 10, "76d38ff6-fd76-4fb1-ba26-e8779a766faf", 25, "98fb173b-ae91-4b46-9401-20e98e5856d9")
	addSpan.End()

	scanCtx, scanSpan := trace.StartSpan(ctx, "Scan")
	dt, err := conn.DoContext(scanCtx, "ZSCAN", leaderBoardKey, 0)
	scanSpan.End()
	if err != nil {
		scanSpan.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		log.Fatalf("Failed to run ZSCAN: %v", err)
		return
	}

	log.Printf("ZSCAN response: %s\n", dt)

	// Now clean up
	delCtx, delSpan := trace.StartSpan(ctx, "Cleanup")
	_, _ = conn.DoContext(delCtx, "DEL", leaderBoardKey)
	delSpan.End()
}

func enableOpenCensus() (func(), error) {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		// Change your ProjectID here.
		ProjectID: "census-demos",
		// Change the metric prefix as desirable, for easy filtering/finding of metrics
		MetricPrefix: "redigodemo",
	})
	if err != nil {
		return nil, err
	}

	// Enable metrics
	if err := view.Register(redis.ObservabilityMetricViews...); err != nil {
		return nil, err
	}
	view.RegisterExporter(sd)
	view.SetReportingPeriod(50 * time.Millisecond)

	// Enable tracing
	trace.RegisterExporter(sd)
	// For demo purposes, we are always sampling
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	return sd.Flush, nil
}
{{</highlight>}}

which when run will produce the following

## Examining your traces

* A trace

![](/img/redigo-trace.png)

* Annotation details

![](/img/redigo-trace-detail.png)

## Examining your metrics

* All metrics

![](/img/redigo-all-metrics.png)

* Latency heatmap

![](/img/redigo-latency-heatmap.png)

* p99th latencies visualized in a stacked area

![](/img/redigo-latency-stackedarea-p99.png)

* Writes grouped by `cmd` tag

![](/img/redigo-writes-grouped-by-cmd.png)

## References
Resource|URL
---|---
GoDoc for instrumented Redis client|https://godoc.org/github.com/opencensus-integrations/redigo/redis
