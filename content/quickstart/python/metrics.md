---
title: "Metrics"
draft: false
class: "shadowed-image lightbox"
---

{{% notice note %}}
This guide makes use of Stackdriver for visualizing your data. For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.

This tutorial is also incomplete, pending OpenCensus Python adding Metrics exporters
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
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View the metrics on the backend of our choice

#### Requirements
- Python2 and above
- Google Cloud Platform account anproject
- Google Stackdriver Tracing enabled on your project (Need help? [Click here](/codelabs/stackdriver))

#### Installation

OpenCensus: `pip install opencensus`

#### Brief Overview
By the end of this tutorial, we will do these four things to obtain metrics using OpenCensus:

1. Create quantifiable metrics (numerical) that we will record
2. Create [tags](/core-concepts/tags) that we will associate with our metrics
3. Organize our metrics, similar to a writing a report, in to a `View`
4. Export our views to a backend (Stackdriver in this case)


#### Getting Started

{{% notice note %}}
Unsure how to write and execute Python code? [Click here](https://docs.python.org/).
{{% /notice %}}

We will be a simple "read-evaluate-print" (REPL) app. In there we'll collect some metrics to observe the work that is going on this code, such as:

- Latency per processing loop
- Number of lines read
- Number of errors
- Line lengths

First, create a file called `repl.py`.
```bash
touch repl.py
```

Next, put the following code inside of `repl.py`:

{{<highlight python>}}
#!/usr/bin/env python

import sys

def main():
    # In a REPL:
    #1. Read input
    #2. process input
    while True:
        line = sys.stdin.readline()
        print(line.upper())
{{</highlight>}}

You can run the code via `python repl.py`.

#### Create and record Metrics

<a name="import-metrics-packages"></a>
##### Import Packages

To enable metrics, we’ll import a number of core and OpenCensus packages

{{<tabs Snippet All>}}
{{<highlight python>}}
import opencensus.stats import aggregation as aggregation_module
import opencensus.stats import measure as measure_module
import opencensus.stats import stats as stats_module
import opencensus.stats import view as view_module
import opencensus.tags import tag_key as tag_key_module
import opencensus.tags import tag_map as tag_map_module
import opencensus.tags import tag_value as tag_value_module

# Create the measures
# The latency in milliseconds
m_latency_ms = measure_module.MeasureFloat("repl/latency", "The latency in milliseconds per REPL loop", "ms")
	
# Counts the number of lines read in from standard input
m_lines_in = measure_module.MeasureInt("repl/lines_in", "The number of lines read in", "1")

# Encounters the number of non EOF(end-of-file) errors.
m_errors = measure_module.Int("repl/errors", "The number of errors encountered", "1")

# Counts/groups the lengths of lines read in.
m_line_lengths = measure_module.Int("repl/line_lengths", "The distribution of line lengths", "By")
{{</highlight>}}

{{<highlight python>}}
#!/usr/bin/env python

import sys
import time

from opencensus.stats import aggregation as aggregation_module
from opencensus.stats import measure as measure_module
from opencensus.stats import stats
from opencensus.tags import tag_key as tag_key_module
from opencensus.tags import tag_map as tag_map_module
from opencensus.tags import tag_value as tag_value_module

# Create the measures
# The latency in milliseconds
m_latency_ms = measure_module.MeasureFloat("repl/latency", "The latency in milliseconds per REPL loop", "ms")
	
# Counts the number of lines read in from standard input
m_lines_in = measure_module.MeasureInt("repl/lines_in", "The number of lines read in", "1")

# Encounters the number of non EOF(end-of-file) errors.
m_errors = measure_module.MeasureInt("repl/errors", "The number of errors encountered", "1")

# Counts/groups the lengths of lines read in.
m_line_lengths = measure_module.MeasureInt("repl/line_lengths", "The distribution of line lengths", "By")

# The stats recorder
stats_recorder = stats.Stats().stats_recorder

# Create the tag key
key_method = tag_key_module.TagKey("method")

def main():
    # In a REPL:
    # 1. Read input
    # 2. process input
    while True:
        readEvaluateProcess()

def readEvaluateProcess():
    line = sys.stdin.readline()
    start = time.time()
    print(line.upper())

    # Now record the stats
    # Create the measure_map into which we'll insert the measurements
    mmap = stats_recorder.new_measurement_map()
    end_ms = (time.time() - start) * 1000.0 # Seconds to milliseconds

    # Record the latency
    mmap.measure_float_put(m_latency_ms, end_ms)

    # Record the number of lines in
    mmap.measure_int_put(m_lines_in, 1)

    # Record the line length
    mmap.measure_int_put(m_line_lengths, len(line))

    tmap = tag_map_module.TagMap()
    tmap.insert(key_method, tag_value_module.TagValue("repl"))

    # Insert the tag map finally
    mmap.record(tmap)

if __name__ == "__main__":
    main()
{{</highlight>}}
{{</tabs>}}

#### With views and all enabled
```python
#!/usr/bin/env python

import sys
import time

from opencensus.stats import stats
from opencensus.stats import aggregation as aggregation_module
from opencensus.stats import measure as measure_module
from opencensus.stats import view as view_module
from opencensus.tags import tag_key as tag_key_module
from opencensus.tags import tag_map as tag_map_module
from opencensus.tags import tag_value as tag_value_module

# Create the measures
# The latency in milliseconds
m_latency_ms = measure_module.MeasureFloat("repl/latency", "The latency in milliseconds per REPL loop", "ms")
	
# Counts the number of lines read in from standard input
m_lines_in = measure_module.MeasureInt("repl/lines_in", "The number of lines read in", "1")

# Encounters the number of non EOF(end-of-file) errors.
m_errors = measure_module.MeasureInt("repl/errors", "The number of errors encountered", "1")

# Counts/groups the lengths of lines read in.
m_line_lengths = measure_module.MeasureInt("repl/line_lengths", "The distribution of line lengths", "By")

# The stats recorder
stats_recorder = stats.Stats().stats_recorder

# Create the tag key
key_method = tag_key_module.TagKey("method")

latency_view = view_module.View("demo/latency", "The distribution of the latencies",
                [key_method],
                m_latency_ms,
		# Latency in buckets:
		# [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
		aggregation_module.DistributionAggregation([0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]))
    
line_count_view = view_module.View("demo/lines_in", "The number of lines from standard input",
		[],
                m_lines_in,
                aggregation_module.CountAggregation())

error_count_view = view_module.View("demo/errors", "The number of errors encountered",
                [key_method],
                m_errors,
                aggregation_module.CountAggregation())

line_length_view = view_module.View("demo/line_lengths", "Groups the lengths of keys in buckets",
                [],
		m_line_lengths,
		# Lengths: [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
		aggregation_module.DistributionAggregation([0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]))

def main():
    # In a REPL:
    # 1. Read input
    # 2. process input
    while True:
        readEvaluateProcess()

def readEvaluateProcess():
    line = sys.stdin.readline()
    start = time.time()
    print(line.upper())

    # Now record the stats
    # Create the measure_map into which we'll insert the measurements
    mmap = stats_recorder.new_measurement_map()
    end_ms = (time.time() - start) * 1000.0 # Seconds to milliseconds

    # Record the latency
    mmap.measure_float_put(m_latency_ms, end_ms)

    # Record the number of lines in
    mmap.measure_int_put(m_lines_in, 1)

    # Record the line length
    mmap.measure_int_put(m_line_lengths, len(line))

    tmap = tag_map_module.TagMap()
    tmap.insert(key_method, tag_value_module.TagValue("repl"))

    # Insert the tag map finally
    mmap.record(tmap)

if __name__ == "__main__":
    main()
```

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
