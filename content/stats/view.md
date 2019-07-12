---
title: "View"
weight: 3
aliases: [/core-concepts/metrics/views, /stats/views]
---

- [View](#view)
- [Parts of a view](#parts-of-a-view)
- [Aggregations](#aggregations)

### View

Views are the coupling of an [Aggregation](#aggregations) applied to a [Measure](/stats/measure) and optionally [Tags](/tag).
Views are the connection to [Metric exporters](/exporters).

### Aggregations
The following aggregation methods are supported:

* **Count**: The count of the number of measurement points.
* **Distribution**: Histogram distribution of the measurement points.
* **Sum**: A sum up of the measurement points.
* **LastValue**: Keeps the last recorded value, drops everything else.

### Parts of a view

Field|Description|Example|Restrictions
---|---|---|---
Name|Identifies the metric being collected|grpc.io/client/completed_rpcs|Make it a fully qualified and distinguishable name
Description|The description of the metric being collected|The latency in milliseconds, The number of bytes received|Make it descriptive of the metric being collected
Measure|The [Measure](/stats/measure) that produces measurements for this collection|[Measure](/stats/measure)|
TagKeys|The various tagkeys used to group and filter collected metrics later on|[TagKeys](/tag/key)|These are optional
Aggregation|The aggregation against which measurements will be made|[Aggregation](#aggregations)|This is mandatory

Users can dynamically create and delete views at runtime. Libraries may
export their own views and claim the view names by registering them.  

Multiple views can use the same measure but only if they have different aggregations for the same measure

### Source code example
{{<tabs Go Java Python CplusPlus NodeJS>}}
{{<highlight go>}}
package main

import (
	"go.opencensus.io/stats/view"
	"go.opencensus.io/tag"
)

func enableViews() error {
	latencyView = &view.View{
		Name:        "myapp/latency",
		Measure:     mLatencyMs,
		Description: "The distribution of the latencies",
		TagKeys:     []tag.Key{keyMethod},
		Aggregation: view.Distribution(0, 25, 100, 200, 400, 800, 10000),
	}

	lineCountView = &view.View{
		Name:        "myapp/lines_in",
		Measure:     mLatencyMs,
		Description: "The number of lines that were received",
		TagKeys:     []tag.Key{keyMethod},
		// Notice that the measure "mLatencyMs" is the same as
		// latencyView's but here the aggregation is a count aggregation
		// while the latencyView has a distribution aggregation.
		Aggregation: view.Count(),
	}

	// Ensure that they are registered so
        // that measurements won't be dropped.
	return view.Register(latencyView, lineCountView)
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.metrics.snippet;

import io.opencensus.stats.Stats;
import io.opencensus.stats.Aggregation;
import io.opencensus.stats.Aggregation.Count;
import io.opencensus.stats.Aggregation.Distribution;
import io.opencensus.stats.BucketBoundaries;
import io.opencensus.stats.View;
import io.opencensus.stats.View.Name;
import io.opencensus.stats.ViewManager;

import java.util.Arrays;
import java.util.Collections;

public class JavaSnippet {
    private void enableViews() {
        Aggregation latencyDistribution = Distribution.create(BucketBoundaries.create(
                Arrays.asList(
                    0.0, 25.0, 100.0, 200.0, 400.0, 800.0, 10000.0)));

        View[] views = new View[]{
            View.create(Name.create("myapp/latency"),
                        "The distribution of the latencies",
                        M_LATENCY_MS,
                        latencyDistribution,
                        Collections.singletonList(KEY_METHOD)),

            View.create(Name.create("myapp/lines_in"),
                        "The number of lines that were received",
                        M_LATENCY_MS,
                        Count.create(),
                        Collections.singletonList(KEY_METHOD)),
	};

	// Ensure that they are registered so
        // that measurements won't be dropped.
        ViewManager manager = Stats.getViewManager();
        for (View view : views)
            manager.registerView(view);
    }
}
{{</highlight>}}

{{<highlight python>}}
#/usr/bin/env python

from opencensus.stats import aggregation
from opencensus.stats import view
from opencensus.stats import stats
from opencensus.stats import measure

def enable_views():
    latency_view = view.View("myapp/latency",
                             "The distribution of the latencies",
                             [key_method],
                             m_latency_ms,
                             aggregation.DistributionAggregation(0, 25, 100, 200, 400, 800, 10000))

    line_count_view = view.View("myapp/lines_in",
                             "The number of lines that were received",
                             [key_method],
                             m_latency_ms,
                             aggregation.CountAggregation())

    # Ensure that they are registered so
    # that measurements won't be dropped.
    view_manager = stats.Stats().view_manager
    view_manager.register_view(latency_view)
    view_manager.register_view(line_count_view)
{{</highlight>}}

{{<highlight cpp>}}
#include "opencensus/stats/stats.h"

void registerAsView(opencensus::stats::ViewDescriptor vd) {
    opencensus::stats::View view(vd);
    vd.RegisterForExport();
}

void enableViews() {
    // 1. Latency view:
    const opencensus::stats::ViewDescriptor latency_view =
                opencensus::stats::ViewDescriptor()
                .set_name("myapp/latency")
                .set_description("The various methods' latencies in milliseconds")
                .set_measure(kLatencyMeasureName)
                .set_aggregation(opencensus::stats::Aggregation::Distribution(
                    opencensus::stats::BucketBoundaries::Explicit(
                        {0.0, 25.0, 100.0, 200.0, 400.0, 800.0, 10000.0})))
                .add_column(key_method);

    // 2. Lines count: just a count aggregation on the latency measurement
    const opencensus::stats::ViewDescriptor lines_count_view =
                opencensus::stats::ViewDescriptor()
                .set_name("myapp/lines_in")
                .set_description("The number of lines read in")
                .set_measure(kLineLengthsMeasureName)
                .set_aggregation(opencensus::stats::Aggregation::Count())
                .add_column(key_method);

    // Register the views to enable stats aggregation.
    registerAsView(latency_view);
    registerAsView(lines_count_view);
}
{{</highlight>}}

{{<highlight js>}}
const { globalStats, AggregationType, TagMap } = require('@opencensus/core');

const tagKey = { name: "method" };

const latencyView = globalStats.createView(
  "myapp/latency",
  mLatencyMs,
  AggregationType.DISTRIBUTION,
  [tagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=100ms, >=200ms, >=400ms, >=800ms, >=1000ms]
  [0, 25, 100, 200, 400, 800, 1000]
);

const lineCountView = globalStats.createView(
  "demo/lines_in",
  mLatencyMs,
  AggregationType.COUNT,
  [tagKey],
  "The number of lines from standard input"
);

globalStats.registerView(latencyView);
globalStats.registerView(lineCountView);

{{</highlight>}}
{{</tabs>}}

### References
Resource|URL
---|---
ViewData in specs|[specs/stats/Export-API](https://github.com/census-instrumentation/opencensus-specs/blob/master/stats/Export.md#viewdata)
Aggregation in specs|[specs/stats/Export-API.DatagAggregation](https://github.com/census-instrumentation/opencensus-specs/blob/master/stats/DataAggregation.md#aggregation)
Go views|[Views package](https://godoc.org/go.opencensus.io/stats/view)
Java views|[Views package](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/stats/View.html)
Python views|[Views API](https://github.com/census-instrumentation/opencensus-python/blob/fc42d70f0c9f423b22d0d6a55cc1ffb0e3e478c8/opencensus/stats/view.py#L16-L66)
C++ views|[stats/view.h](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/stats/view.h#L15-L63)
Node.js views|[stats.View](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/stats/view.ts)
