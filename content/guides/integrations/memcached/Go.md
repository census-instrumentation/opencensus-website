---
title: "GoMemache"
date: 2018-08-22T04:30:16-07:00
draft: false
aliases: [/integrations/memcached/go]
logo: /img/memcached-gopher.png
---

- [Introduction](#introduction)
- [Features](#features)
    - [Trace updates](#trace-updates)
    - [Available metrics](#available-metrics)
- [Using it](#using-it)
- [Enabling OpenCensus](#enabling-opencensus)
    - [Enabling metrics](#enabling-metrics)
    - [Enabling tracing](#enabling-tracing)
- [End to end example](#end-to-end-example)
- [Examining your traces](#enabling-your-traces)
- [Examining your metrics](#enabling-your-metrics)
- [References](#references)

## Introduction
[Memcached](https://memcached.org) is one of the most used server caching and scaling technologies.

It was created by [Brad Fitzpatrick](https://en.wikipedia.org/wiki/Brad_Fitzpatrick) in 2003 as a
solution to scale his social media product [Live Journal](https://www.livejournal.com/)

## Features

### Trace updates
OpenCensus Go was used to instrument Brad's original Memcache client, with 2 major changes:

* `Set`, `Get`, `GetMulti`, `Add`, `Replace`, `Delete`, `DeleteAll`, `Decrement`, `CompareAndSwap`, `Touch`, `Each`

all now take in a context.Context object as the first argument, to allow for trace propagation.

### Available metrics
* Also a couple of metrics have been added:

Metric|Name|Description
---|---|---
Number of cache Misses|`cache_misses`|The number of cache misses
Number of cache hits|`cache_hits`|The number of cache hits
Number of errors|`errors`|The number of general errors, disambiguated by tags "method", "reason", "type"
Number of compare and swap conflicts|`cas_conflicts`|The number of CAS conflicts
Number of unstored results|`unstored_results`|The number of unstored results
Distribution of key lengths|`key_length`|The distributions and counts of key lengths in Bytes
Distribution of value lengths|`value_length`|The distributions and counts of value lengths in Bytes
Distribution of latencies in milliseconds|`latency`|The distributions and counts of latencies in milliseconds, by tag "method"
Number of calls|`calls`|The number of calls broken down by tag key `method`

## Using it
```shell
go get -u -v github.com/orijtech/gomemcache/memcache
```

## Enabling OpenCensus
To provide observability we'll enable OpenCensus tracing and metrics

### Enabling Metrics
{{<highlight go>}}
package main

import (
        "log"

        "go.opencensus.io/stats/view"

        "github.com/orijtech/gomemcache/memcache"
)

func main() {
        if err := view.Register(memcache.AllViews...); err != nil {
                log.Fatalf("Failed to register Memcache views: %v", err)
        }
}
{{</highlight>}}

### Enabling Tracing
You'll just to enable any of the trace exporter in [Go exporters](/guides/exporters/supported-exporters/go/)

## End to end example
{{% notice tip %}}
For assistance installing Memcached, please visit the [Memcached Installation wiki](https://github.com/memcached/memcached/wiki/Install)
{{% /notice %}}

With Memcached now installed and running, we can now start the code sample and for simplicitly examining metrics, we'll use Stackdriver Monitoring and Tracing

{{% notice tip %}}
For assistance setting up Stackdriver, please visit this [Stackdriver setup guided codelab](/codelabs/stackdriver)
{{% /notice %}}

Our sample is an application excerpt from a distributed prime factorization engine that needs to calculate square roots
of big numbers but would like to reuse expensively calculated results since square roots of such numbers are CPU intensive.
To share/memoize results amongst our distributed applications, we'll use Memcache. In the first round, before a cache hit, we'll
notice that the latency is high, but on cache hit the latency decreases dramatically.

{{<highlight go>}}
package main

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"net/http"
	"net/http/httptest"
	"time"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"

	"github.com/orijtech/gomemcache/memcache"
)

func main() {
	flushFn, err := enableOpenCensusTracingAndMetrics()
	if err != nil {
		log.Fatalf("Failed to enable OpenCensus: %v", err)
	}
	defer flushFn()

	mc := memcache.New("localhost:11211")
	log.SetFlags(0)

	cst := httptest.NewServer(&ochttp.Handler{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			qv := r.URL.Query()
			query := qv.Get("v")
			ctx := r.Context()

			// Check Memcached if we've computed it before
			memoizedSQRT, err := mc.Get(ctx, query)
			if memoizedSQRT != nil && len(memoizedSQRT.Value) > 0 && err == nil {
				w.Write(memoizedSQRT.Value)
				return
			}

			// Now compute the expensive operation
			in, _, err := big.ParseFloat(query, 0, 1000, big.ToNearestEven)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sqrt := big.NewFloat(0).Sqrt(in)
			out, _ := sqrt.MarshalText()

                        // Pause for 3 milliseconds as a throttle to "avoid CPU saturation".
                        <-time.After(3 * time.Millisecond)
			// Lastly, memoize it for a cache hit next time
			_ = mc.Set(ctx, &memcache.Item{Key: query, Value: out})
			w.Write(out)
		}),
	})
	defer cst.Close()

	values := []string{
		"9999999183838328567567689828757567669797060958585737272727311111199911188888889953113",
		"9082782799999992727727272727272727272727272727838383285677272727399917272728373799422229",
		"987773333733799999999475786161616373683838328567727272739991727272837378888888881322229",
		"99999999999999999999998899919191919191919192828727737368383832856772727273999172727283737671626262269222848",
		"991818178171928287277373683838328567727272739991727272837377827272727272727272727711119",
	}
	hc := &http.Client{Transport: &ochttp.Transport{}}
	for _, value := range values {
		log.Printf("In %s\n", value)
		ctx, span := trace.StartSpan(context.Background(), "CalculateSquareRoot-"+value)
		for i := 0; i < 2; i++ {
			startTime := time.Now()
			cctx, sspan := trace.StartSpan(ctx, fmt.Sprintf("Round-%d", i+1))
			req, _ := http.NewRequest("GET", cst.URL+"?v="+value, nil)
			req = req.WithContext(cctx)
			res, err := hc.Do(req)
			if err != nil {
				sspan.End()
				log.Printf("i=#%d, value=%q err: %v", i, value, err)
				continue
			}
			sqrtBlob, _ := ioutil.ReadAll(res.Body)
			_ = res.Body.Close()
			sspan.End()
			log.Printf("Round #%d\nSQRT %q\nTimeSpent: %s\n\n", i, sqrtBlob, time.Since(startTime))
		}
		// For clean up, we'll try to remove all the "values" so that the results
		// can be repeatable to demonstrate the cache misses and cache hits.
		_ = mc.Delete(ctx, value)
		span.End()
		log.Println()
	}
}

func enableOpenCensusTracingAndMetrics() (func(), error) {
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		MetricPrefix: "sqrtapp",
		ProjectID:    "census-demos", // Please change this as needed
	})
	if err != nil {
		return nil, err
	}

	// Enable tracing: for demo purposes, we'll always trace
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// Register as a tracing exporter
	trace.RegisterExporter(sd)

	// Register as a metrics exporter
	view.RegisterExporter(sd)
	view.SetReportingPeriod(50 * time.Millisecond)
	if err := view.Register(memcache.AllViews...); err != nil {
		return nil, err
	}
	if err := view.Register(ochttp.DefaultServerViews...); err != nil {
		return nil, err
	}
	if err := view.Register(ochttp.DefaultClientViews...); err != nil {
		return nil, err
	}
	return sd.Flush, nil
}
{{</highlight>}}

## Examining your traces

Please visit https://console.cloud.google.com/traces

Opening our console will produce something like

![Trace](/img/memcache-trace-comparison.png)

## Examining your metrics
Please visit https://console.cloud.google.com/monitoring

* Metrics list
![Metrics list](/img/memcache-metrics-list.png)

* Latency heatmap
![Latency heatmap](/img/memcache-metrics-latency-heatmap.png)

* Latency stacked area
![Latency stacked area](/img/memcache-metrics-latency-stackedarea.png)

* Value length stacked area
![Metrics valuelength stacked area](/img/memcache-metrics-value_length-stacked-area.png)
![](/img/memcache-metrics-key_length-stacked-area.png)

* Key length heatmap
![Metrics keylength heatmap](/img/memcache-metrics-keylength-heatmap.png)

* Errors grouped by "reason" and "method"
![Errors disambiguated](/img/memcache-metrics-errors-disambiguated.png)

## References

Resource|URL
---|---
GoDoc|https://godoc.org/github.com/orijtech/gomemcache/memcache
Memcached clients instrumented with OpenCensus in Go and Python|[Medium article](https://medium.com/@orijtech/memcached-clients-instrumented-with-opencensus-in-go-and-python-dacbd01b269c)
