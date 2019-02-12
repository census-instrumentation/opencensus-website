---
title: "Measure"
weight: 2
aliases: [/core-concepts/metrics/measure]
---

- [Measure](#measure)
- [Definition](#definition)
- [Recording measurements](#recording-measurements)
- [Source code example](#source-code-example)
- [Relation to Measurements](#relation-to-measurements)
- [Relation to Views](#relation-to-views)
- [References](#references)

#### Measure

A measure represents a metric type to be recorded. For example, request latency
in µs and request size in KBs are examples of measures to collect from a server.

### Definition
All measures are identified by a name and also have a description and a unit.
Libraries and frameworks can define and export measures for their end users to
collect data on the provided measures.  

Constituent|Description|Example|Restrictions
---|---|---|---
Name|a string by which the measure will be referred to by|"rpc_server_latency", "vm_cpu_cycles"|MUST be unique within the library. It is recommended to use names compatible with the intended end usage e.g. use host/path pattern
Description|a string detailing the purpose of the measure|"RPC latency in milliseconds", "Virtual cycles executed on a VM|
Unit|a string descriptive of the unit of the Measure|"By", "1", "ms"|MUST follow [Unified code for units of </br> measure](http://unitsofmeasure.org/ucum.html)

### Types
OpenCensus currently supports two types of measures

Type|Description
---|---
Int64|Records int-like values
Float64|Records float-like values

### Recording measurements
[Measurements](/stats/measurement) are produced by recording a numeric value with a [Measure](#measure) usually in a [tagContext](/tag)

### Source code example

{{<tabs Go Java Python CplusPlus NodeJS>}}
{{<highlight go>}}
package main

import (
	"go.opencensus.io/stats"
)

func main() {
	mLatencyMs = stats.Float64("latency", "The latency in milliseconds", "ms")
	mLines = stats.Int64("lines_in", "The number of lines processed", "1")
	mBytesIn = stats.Int64("bytes_in", "The number of bytes received", "By")

	// Invoking .M produces measurements that we then record against
	// a context "ctx" with tags.
	stats.Record(ctx,
		mLatencyMs.M(17),
		mLines.M(238),
		mBytesIn.M(7000))
}
{{</highlight>}}

{{<highlight java>}}
package io.opencensus.metrics.snippet;

import io.opencensus.stats.Measure.MeasureDouble;
import io.opencensus.stats.Measure.MeasureLong;
import io.opencensus.stats.Stats;
import io.opencensus.stats.StatsRecorder;

public class JavaSnippet {
    private static final MeasureDouble M_LATENCY_MS = MeasureDouble.create("latency", "The latency in milliseconds", "ms");
    private static final MeasureLong M_LINES = MeasureLong.create("lines_in", "The number of lines processed", "1");
    private static final MeasureLong M_BYTES_IN = MeasureLong.create("bytes_in", "The number of bytes received", "By");

    private static final StatsRecorder STATS_RECORDER = Stats.getStatsRecorder();

    public static void main(String[] args) {
        // Record the values, having already added tags in the current context
        STATS_RECORDER.newMeasureMap()
                .put(M_LATENCY_MS, 17.0)
                .put(M_LINES, 238)
                .put(M_BYTES_IN, 7000)
                .record();
    }
}
{{</highlight>}}

{{<highlight python>}}
#/usr/bin/env python

from opencensus.stats import stats
from opencensus.stats import measure

def main():
    m_latency_ms = measure.MeasureFloat("latency", "The latency in milliseconds", "ms")
    m_lines = measure.MeasureInt("lines_in", "The number of lines processed", "1")
    m_bytes_in = measure.MeasureInt("bytes_in", "The number of bytes received", "By")

    mmap = stats.Stats().stats_recorder.new_measurement_map()
    mmap.measure_float_put(m_latency_ms, 17)
    mmap.measure_int_put(m_lines, 238)
    mmap.measure_int_put(m_bytes_in, 7000)

    # Record the measurements against tags in "tmap"
    mmap.record(tmap);

if __name__ == '__main__':
    main()
{{</highlight>}}

{{<highlight cpp>}}
#include "opencensus/stats/stats.h"

opencensus::stats::MeasureDouble LatencyMsMeasure() {
    static const auto measure = opencensus::stats::MeasureDouble::Register(
            "latency", "The latency in milliseconds", "ms");
    return measure;
}

opencensus::stats::MeasureInt64 LinesMeasure() {
    static const auto measure = opencensus::stats::MeasureInt64::Register(
            "lines_in", "The number of lines processed", "1");
    return measure;
}

opencensus::stats::MeasureInt64 BytesInMeasure() {
    static const auto measure = opencensus::stats::MeasureInt64::Register(
            "bytes_in", "The number of bytes received", "By");
    return measure;
}

int main(int argc, char** argv) {
    opencensus::stats::Record({
            {LatencyMsMeasure(), 17.0},
            {LinesMeasure(), 238},
            {BytesInMeasure(), 7000}
    });
}
{{</highlight>}}

{{<highlight js>}}
import { globalStats, MeasureUnit } from "@opencensus/core";

const mLatencyMs = globalStats.createMeasureDouble("latency", MeasureUnit.MS, "The latency in milliseconds");
const mBytesIn = globalStats.createMeasureInt64("size", MeasureUnit.BYTE, "The number of bytes received");

const measurement1 = {measure: mLatencyMs, value: 17};
const measurement2 = {measure: mBytesIn, value: 7000};

globalStats.record([measurement1, measurement2]);
{{</highlight>}}
{{</tabs>}}

### Relation to Measurements
When a Measure records a value, it produces a [Measurement](/stats/measurement).

### Relation to Views
A [View](/stats/view) couples the Measurement produced by a Measure, with an [Aggregation](/stats/view#aggregation) and optionally [Tags](/tag) to produce metrics.

### References

Resource|URL
---|---
Unified code for units of measure|http://unitsofmeasure.org/ucum.html
Measure in the specs|[specs/Record.Measure](https://github.com/census-instrumentation/opencensus-specs/blob/master/stats/Record.md#measure)
Go Measures|[stats.Measure](https://godoc.org/go.opencensus.io/stats#Measure)
Java Measures|[stats.Measure](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/stats/Measure.html)
Python Measures|[stats.measure.Measure](https://github.com/census-instrumentation/opencensus-python/blob/fc42d70f0c9f423b22d0d6a55cc1ffb0e3e478c8/opencensus/stats/measure.py#L51-L60)
C++ Measures|[stats/measure.h](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/stats/measure.h#L33-L122)
Node.js Measures|[stats.Measure](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/stats/types.ts)
