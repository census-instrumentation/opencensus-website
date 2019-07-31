---
title: "Metrics"
date: 2018-08-20T07:12:03-13:00
draft: false
class: "shadowed-image lightbox"
aliases: [/quickstart/node.js/metrics]
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Brief Overview](#brief-overview)
- [Getting started](#getting-started)
- [Enable Metrics](#enable-metrics)
    - [Import Packages](#import-packages)
    - [Create Metrics](#create-metrics)
- [Record and Aggregate Data](#record-and-aggregate-data)
    - [Create Views and Tags](#create-views-and-tags)
    - [Recording Metrics](#recording-metrics)
- [Exporting to Prometheus](#exporting-to-prometheus)
- [Viewing your metrics](#viewing-your-metrics)
- [References](#references)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Collect metrics using [OpenCensus Metrics](/core-concepts/metrics) and [Tags](/core-concepts/tags)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View the metrics on the backend of our choice

## Requirements
- [Node.js](https://nodejs.org/) 6 or above and `npm` (already comes with Node.js)

{{% notice tip %}}
For assistance setting up Node.js, [Click here](https://nodejs.org/) for instructions.
{{% /notice %}}

- Prometheus as our choice of metrics backend: we are picking it beause it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Prometheus, [Click here](/codelabs/prometheus) for a guided codelab.

You can swap out any other exporter from the [list of Node.js exporters](/guides/exporters/supported-exporters/node.js/)
{{% /notice %}}

## Installation

First, let's create a folder called `repl-app` for our project and navigate inside it:

```bash
mkdir repl-app
cd repl-app
```

Then, let's install the OpenCensus and Prometheus packages with:

```bash
npm install @opencensus/core
npm install @opencensus/exporter-prometheus
```

## Brief Overview
By the end of this tutorial, we will do these four things to obtain metrics using OpenCensus:

1. Create quantifiable `metrics` (numerical) that we will **record**
2. Create [tags](/core-concepts/tags) that we will associate with our metrics
3. Organize our metrics, similar to writing a report, in to a `View`
4. Export our views to a backend (Prometheus in this case)

## Getting Started

{{% notice note %}}
Unsure how to write and execute Node.js code? [Click here](https://nodejs.org/en/docs/guides/getting-started-guide/).
{{% /notice %}}

We will be a simple "read-evaluate-print-loop" (REPL) app. In there we'll collect some metrics to observe the work that is going on within this code, such as:

- Latency per processing loop
- Number of lines read
- Line lengths

First, create a file called `repl.js`:

```bash
touch repl.js
```

Next, put the following code inside of `repl.js`:

{{<highlight javascript>}}
const fs = require('fs');
const readline = require('readline');

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  const processedLine = processLine(line);    // Evaluate
  console.log(processedLine);                // Print
});

/**
 * Takes a line and process it.
 * @param {string} line The line to process
 */
function processLine(line) {
  // Currently, it just capitalizes it.
  return line.toUpperCase();
}
{{</highlight>}}

Then, let's create our text file that we'll feed the REPL. Let's call it `test.txt`:

```bash
touch test.txt
```

And put the following lines inside of `test.txt`:

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.
```

Now, you can run the code via `node repl.js` and see it working.

## Enable Metrics

### Import Packages

To enable metrics, we'll import a few items from OpenCensus Core package.

{{<tabs Snippet All>}}
{{<highlight javascript>}}
const { globalStats, MeasureUnit, AggregationType, TagMap } = require('@opencensus/core');
{{</highlight>}}

{{<highlight javascript>}}
const { globalStats, MeasureUnit, AggregationType, TagMap } = require('@opencensus/core');

const fs = require('fs');
const readline = require('readline');

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  const processedLine = processLine(line);    // Evaluate
  console.log(processedLine);                // Print
});

/**
 * Takes a line and process it.
 * @param {string} line The line to process
 */
function processLine(line) {
  // Currently, it just capitalizes it.
  return line.toUpperCase();
}
{{</highlight>}}
{{</tabs>}}

### Create Metrics

First, we will create the variables needed to later record our metrics.

{{<tabs Snippet All>}}
{{<highlight javascript>}}
// The latency in milliseconds
const mLatencyMs = globalStats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts/groups the lengths of lines read in.
const mLineLengths = globalStats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");
{{</highlight>}}

{{<highlight javascript>}}
const { globalStats, MeasureUnit, AggregationType, TagMap } = require('@opencensus/core');

const fs = require('fs');
const readline = require('readline');

// The latency in milliseconds
const mLatencyMs = globalStats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts/groups the lengths of lines read in.
const mLineLengths = globalStats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  const processedLine = processLine(line);    // Evaluate
  console.log(processedLine);                // Print
});

/**
 * Takes a line and process it.
 * @param {string} line The line to process
 */
function processLine(line) {
  // Currently, it just capitalizes it.
  return line.toUpperCase();
}
{{</highlight>}}
{{</tabs>}}

## Record and Aggregate Data

### Create Views and Tags
We now determine how our metrics will be organized by creating `Views`. We will also create the variable needed to add extra text meta-data to our metrics -- `methodTagKey`, `statusTagKey`, and `errorTagKey`.

{{<tabs Snippet All>}}
{{<highlight javascript>}}
const methodTagKey = { name: "method" };
const statusTagKey = { name: "status" };
const errorTagKey = { name: "error" };

// Create and Register the view.
const latencyView = globalStats.createView(
  "demo/latency",
  mLatencyMs,
  AggregationType.DISTRIBUTION,
  [methodTagKey, statusTagKey, errorTagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);
globalStats.registerView(latencyView);

// Create and Register the view.
const lineCountView = globalStats.createView(
  "demo/lines_in",
  mLineLengths,
  AggregationType.COUNT,
  [methodTagKey],
  "The number of lines from standard input"
);
globalStats.registerView(lineCountView);

// Create and Register the view.
const lineLengthView = globalStats.createView(
  "demo/line_lengths",
  mLineLengths,
  AggregationType.DISTRIBUTION,
  [methodTagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
);
globalStats.registerView(lineLengthView);
{{</highlight>}}

{{<highlight javascript>}}
const { globalStats, MeasureUnit, AggregationType, TagMap } = require('@opencensus/core');

const fs = require('fs');
const readline = require('readline');

// The latency in milliseconds
const mLatencyMs = globalStats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts/groups the lengths of lines read in.
const mLineLengths = globalStats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

const methodTagKey = { name: "method" };
const statusTagKey = { name: "status" };
const errorTagKey = { name: "error" };

// Create and Register the view.
const latencyView = globalStats.createView(
  "demo/latency",
  mLatencyMs,
  AggregationType.DISTRIBUTION,
  [methodTagKey, statusTagKey, errorTagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);
globalStats.registerView(latencyView);

// Create and Register the view.
const lineCountView = globalStats.createView(
  "demo/lines_in",
  mLineLengths,
  AggregationType.COUNT,
  [methodTagKey, statusTagKey],
  "The number of lines from standard input"
);
globalStats.registerView(lineCountView);

// Create and Register the view.
const lineLengthView = globalStats.createView(
  "demo/line_lengths",
  mLineLengths,
  AggregationType.DISTRIBUTION,
  [methodTagKey, statusTagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
);
globalStats.registerView(lineLengthView);

// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  const processedLine = processLine(line);    // Evaluate
  console.log(processedLine);                // Print
});

/**
 * Takes a line and process it.
 * @param {string} line The line to process
 */
function processLine(line) {
  // Currently, it just capitalizes it.
  return line.toUpperCase();
}
{{</highlight>}}
{{</tabs>}}

We will later use this tag key, to record what method is being invoked. In our scenario, we will only use it to record that "repl" is calling our data.

Again, this is arbitrary and purely up the user. For example, if we wanted to track what operating system a user is using, we could create a tag key `"operating_system"` and later, when we use it, we will be given an opportunity to enter values such as "windows" or "mac".

### Recording Metrics

Now we will record the desired metrics. To do so, we will use `globalStats.record()` and pass in our list of measurements.

{{<tabs Snippet All>}}
{{<highlight javascript>}}
lineReader.on("line", function (line) {
  // Registers the Tags for our measurements
  const tags = new TagMap();
  tags.set(methodTagKey, { value: "REPL" });
  tags.set(statusTagKey, { value: "OK" });

  try {
    // ...

    globalStats.record([{
      measure: mLineLengths,
      value: processedLine.length
    }, {
     measure: mLatencyMs,
     value: (new Date()) - startTime.getTime()
   }], tags);
  } catch (err) {
    const errTags = new TagMap();
    errTags.set(methodTagKey, { value: "REPL" });
    errTags.set(statusTagKey, { value: "ERROR" });
    errTags.set(errorTagKey, { value: err.message });

    globalStats.record([{
      measure: mLatencyMs,
      value: (new Date()) - startTime.getTime()
    }], errTags);
  }

  // Restarts the start time for the REPL
  startTime = new Date();
});
{{</highlight>}}

{{<highlight javascript>}}
const { globalStats, MeasureUnit, AggregationType, TagMap } = require('@opencensus/core');

const fs = require('fs');
const readline = require('readline');

// The latency in milliseconds
const mLatencyMs = globalStats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts/groups the lengths of lines read in.
const mLineLengths = globalStats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

const methodTagKey = { name: "method" };
const statusTagKey = { name: "status" };
const errorTagKey = { name: "error" };

// Create and Register the view.
const latencyView = globalStats.createView(
  "demo/latency",
  mLatencyMs,
  AggregationType.DISTRIBUTION,
  [methodTagKey, statusTagKey, errorTagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);
globalStats.registerView(latencyView);

// Create and Register the view.
const lineCountView = globalStats.createView(
  "demo/lines_in",
  mLineLengths,
  AggregationType.COUNT,
  [methodTagKey, statusTagKey],
  "The number of lines from standard input"
);
globalStats.registerView(lineCountView);

// Create and Register the view.
const lineLengthView = globalStats.createView(
  "demo/line_lengths",
  mLineLengths,
  AggregationType.DISTRIBUTION,
  [methodTagKey, statusTagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
);
globalStats.registerView(lineLengthView);

// The beginning of our REPL loop
let startTime = new Date();
let endTime;

// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  // Registers the Tags for our measurements
  const tags = new TagMap();
  tags.set(methodTagKey, { value: "REPL" });
  tags.set(statusTagKey, { value: "OK" });

  try {
    const processedLine = processLine(line);    // Evaluate
    console.log(processedLine);                // Print

    globalStats.record([{
      measure: mLineLengths,
      value: processedLine.length
    }, {
     measure: mLatencyMs,
     value: (new Date()) - startTime.getTime()
   }], tags);
  } catch (err) {
    const errTags = new TagMap();
    errTags.set(methodTagKey, { value: "REPL" });
    errTags.set(statusTagKey, { value: "ERROR" });
    errTags.set(errorTagKey, { value: err.message });

    globalStats.record([{
      measure: mLatencyMs,
      value: (new Date()) - startTime.getTime()
    }], errTags);
  }

  // Restarts the start time for the REPL
  startTime = new Date();
});

/**
 * Takes a line and process it.
 * @param {string} line The line to process
 */
function processLine(line) {
  // Currently, it just capitalizes it.
  return line.toUpperCase();
}
{{</highlight>}}
{{</tabs>}}

## Exporting to Prometheus

We will be adding the Prometheus package: `@opencensus/exporter-prometheus`, create the Prometheus exporter and pass it to the global stats manager:

{{<tabs Snippet All>}}
{{<highlight javascript>}}
const { globalStats, MeasureUnit, AggregationType, TagMap } = require('@opencensus/core');
const { PrometheusStatsExporter } = require("@opencensus/exporter-prometheus");

const fs = require('fs');
const readline = require('readline');

// Enable OpenCensus exporters to export metrics to Prometheus Monitoring.
const exporter = new PrometheusStatsExporter({
  // Metrics will be exported on https://localhost:{port}/metrics
  port: 9464,
  startServer: true
});

// Pass the created exporter to global Stats
globalStats.registerExporter(exporter);
{{</highlight>}}

{{<highlight javascript>}}
const { globalStats, MeasureUnit, AggregationType, TagMap } = require('@opencensus/core');
const { PrometheusStatsExporter } = require("@opencensus/exporter-prometheus");

const fs = require('fs');
const readline = require('readline');

// Enable OpenCensus exporters to export metrics to Prometheus Monitoring.
const exporter = new PrometheusStatsExporter({
  // Metrics will be exported on https://localhost:{port}/metrics
  port: 9464,
  startServer: true
});

// Pass the created exporter to global Stats
globalStats.registerExporter(exporter);

// The latency in milliseconds
const mLatencyMs = globalStats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts/groups the lengths of lines read in.
const mLineLengths = globalStats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

const methodTagKey = { name: "method" };
const statusTagKey = { name: "status" };
const errorTagKey = { name: "error" };

// Create and Register the view.
const latencyView = globalStats.createView(
  "demo/latency",
  mLatencyMs,
  AggregationType.DISTRIBUTION,
  [methodTagKey, statusTagKey, errorTagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);
globalStats.registerView(latencyView);

// Create and Register the view.
const lineCountView = globalStats.createView(
  "demo/lines_in",
  mLineLengths,
  AggregationType.COUNT,
  [methodTagKey, statusTagKey],
  "The number of lines from standard input"
);
globalStats.registerView(lineCountView);

// Create and Register the view.
const lineLengthView = globalStats.createView(
  "demo/line_lengths",
  mLineLengths,
  AggregationType.DISTRIBUTION,
  [methodTagKey, statusTagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
);
globalStats.registerView(lineLengthView);

// The beginning of our REPL loop
let startTime = new Date();
let endTime;
// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  // Registers the Tags for our measurements
  const tags = new TagMap();
  tags.set(methodTagKey, { value: "REPL" });
  tags.set(statusTagKey, { value: "OK" });

  try {
    const processedLine = processLine(line);    // Evaluate
    console.log(processedLine);                // Print

    globalStats.record([{
      measure: mLineLengths,
      value: processedLine.length
    }, {
     measure: mLatencyMs,
     value: (new Date()) - startTime.getTime()
   }], tags); 
  } catch (err) {
    const errTags = new TagMap();
    errTags.set(methodTagKey, { value: "REPL" });
    errTags.set(statusTagKey, { value: "ERROR" });
    errTags.set(errorTagKey, { value: err.message });

    globalStats.record([{
      measure: mLatencyMs,
      value: (new Date()) - startTime.getTime()
    }], errTags);
  }


  // Restarts the start time for the REPL
  startTime = new Date();
});

/**
 * Takes a line and process it.
 * @param {string} line The line to process
 */
function processLine(line) {
  // Currently, it just capitalizes it.
  return line.toUpperCase();
}
{{</highlight>}}
{{</tabs>}}

### Prometheus configuration file

To allow Prometheus to scrape from our application, we have to point it towards the tutorial application whose
server is running on "localhost:8889".

To do this, we firstly need to create a YAML file with the configuration e.g. `promconfig.yaml`
whose contents are:
```yaml
scrape_configs:
  - job_name: 'ocnodejsmetricstutorial'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8889']
```

### Running Prometheus

With that file saved as `promconfig.yaml` we should now be able to run Prometheus like this

```shell
prometheus --config.file=promconfig.yaml
```

## Viewing your metrics

With the above you should now be able to navigate to the Prometheus UI at http://localhost:9464/metrics

```
# HELP demo_lines_in The number of lines from standard input
# TYPE demo_lines_in counter
demo_lines_in{method="REPL",status="OK"} 6

# HELP demo_line_lengths Groups the lengths of keys in buckets
# TYPE demo_line_lengths histogram
demo_line_lengths_bucket{le="5",method="REPL",status="OK"} 0
demo_line_lengths_bucket{le="10",method="REPL",status="OK"} 0
demo_line_lengths_bucket{le="15",method="REPL",status="OK"} 0
demo_line_lengths_bucket{le="20",method="REPL",status="OK"} 0
demo_line_lengths_bucket{le="40",method="REPL",status="OK"} 0
demo_line_lengths_bucket{le="60",method="REPL",status="OK"} 1
demo_line_lengths_bucket{le="80",method="REPL",status="OK"} 6
demo_line_lengths_bucket{le="100",method="REPL",status="OK"} 6
demo_line_lengths_bucket{le="200",method="REPL",status="OK"} 6
demo_line_lengths_bucket{le="400",method="REPL",status="OK"} 6
demo_line_lengths_bucket{le="600",method="REPL",status="OK"} 6
demo_line_lengths_bucket{le="800",method="REPL",status="OK"} 6
demo_line_lengths_bucket{le="1000",method="REPL",status="OK"} 6
demo_line_lengths_bucket{le="+Inf",method="REPL",status="OK"} 6
demo_line_lengths_sum{method="REPL",status="OK"} 440
demo_line_lengths_count{method="REPL",status="OK"} 6

# HELP demo_latency The distribution of the latencies
# TYPE demo_latency histogram
demo_latency_bucket{le="25",method="REPL",status="OK"} 6
demo_latency_bucket{le="50",method="REPL",status="OK"} 6
demo_latency_bucket{le="75",method="REPL",status="OK"} 6
demo_latency_bucket{le="100",method="REPL",status="OK"} 6
demo_latency_bucket{le="200",method="REPL",status="OK"} 6
demo_latency_bucket{le="400",method="REPL",status="OK"} 6
demo_latency_bucket{le="600",method="REPL",status="OK"} 6
demo_latency_bucket{le="800",method="REPL",status="OK"} 6
demo_latency_bucket{le="1000",method="REPL",status="OK"} 6
demo_latency_bucket{le="2000",method="REPL",status="OK"} 6
demo_latency_bucket{le="4000",method="REPL",status="OK"} 6
demo_latency_bucket{le="6000",method="REPL",status="OK"} 6
demo_latency_bucket{le="+Inf",method="REPL",status="OK"} 6
demo_latency_sum{method="REPL",status="OK"} 5
demo_latency_count{method="REPL",status="OK"} 6
```

## References

Resource|URL
---|---
Prometheus project|https://prometheus.io/
Setting up Prometheus|[Prometheus Codelab](/codelabs/prometheus)
NPM: @opencensus/exporter-prometheus|https://www.npmjs.com/package/@opencensus/exporter-prometheus
NPM: @opencensus/nodejs|https://www.npmjs.com/package/@opencensus/nodejs
Github: OpenCensus for Node.js|https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-nodejs
