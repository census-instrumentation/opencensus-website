---
title: "Metrics"
date: 2018-08-20T07:12:03-13:00
draft: false
class: "shadowed-image lightbox"
url: quickstart/nodejs/metrics
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
- [Exporting to Stackdriver](#exporting-to-stackdriver)

In this quickstart, we’ll gleam insights from code segments and learn how to:

1. Collect metrics using [OpenCensus Metrics](/core-concepts/metrics) and [Tags](/core-concepts/tags)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View the metrics on the backend of our choice

## Requirements
- [Node.js](https://nodejs.org/) 6 or above and `npm` (already comes with Node.js)
- Google Cloud Platform account and project
- Google Stackdriver Monitoring enabled on your project

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

## Installation

First, let's create a folder called `repl-app` for our project and navigate inside it:

```bash
mkdir repl-app
cd repl-app
```

Then, let's install the OpenCensus and Stackdriver packages with:

```bash
npm install @opencensus/core
npm install @opencensus/exporter-stackdriver
```

## Brief Overview
By the end of this tutorial, we will do these four things to obtain metrics using OpenCensus:

1. Create quantifiable `metrics` (numerical) that we will **record**
2. Create [tags](/core-concepts/tags) that we will associate with our metrics
3. Organize our metrics, similar to writing a report, in to a `View`
4. Export our views to a backend (Stackdriver in this case)

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

Then, let's create our text file that we'll feed the REPL. LEt's call it `test.txt`:

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
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');
{{</highlight>}}

{{<highlight javascript>}}
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');

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
// Our Stats manager
const stats = new Stats();

// The latency in milliseconds
const mLatencyMs = stats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts the number of lines read in from standard input
const mLinesIn = stats.createMeasureInt64("repl/lines_in", MeasureUnit.UNIT, "The number of lines read in");

// Counts/groups the lengths of lines read in.
const mLineLengths = stats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");
{{</highlight>}}

{{<highlight javascript>}}
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');

const fs = require('fs');
const readline = require('readline');

// Our Stats manager
const stats = new Stats();

// The latency in milliseconds
const mLatencyMs = stats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts the number of lines read in from standard input
const mLinesIn = stats.createMeasureInt64("repl/lines_in", MeasureUnit.UNIT, "The number of lines read in");

// Counts/groups the lengths of lines read in.
const mLineLengths = stats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

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
We now determine how our metrics will be organized by creating `Views`. We will also create the variable needed to add extra text meta-data to our metrics, `tagKey`.

{{<tabs Snippet All>}}
{{<highlight javascript>}}
const tagKey = "method";

const latencyView = stats.createView(
  "demo/latency",
  mLatencyMs,
  AggregationType.DISTRIBUTION,
  [tagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);

const lineCountView = stats.createView(
  "demo/lines_in",
  mLinesIn,
  AggregationType.COUNT,
  [tagKey],
  "The number of lines from standard input"
)

const lineLengthView = stats.createView(
  "demo/line_lengths",
  mLineLengths,
  AggregationType.DISTRIBUTION,
  [tagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
)
{{</highlight>}}

{{<highlight javascript>}}
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');

const fs = require('fs');
const readline = require('readline');

// Our Stats manager
const stats = new Stats();

// The latency in milliseconds
const mLatencyMs = stats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts the number of lines read in from standard input
const mLinesIn = stats.createMeasureInt64("repl/lines_in", MeasureUnit.UNIT, "The number of lines read in");

// Counts/groups the lengths of lines read in.
const mLineLengths = stats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

const tagKey = "method";

const latencyView = stats.createView(
  "demo/latency",
  mLatencyMs,
  AggregationType.DISTRIBUTION,
  [tagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);

const lineCountView = stats.createView(
  "demo/lines_in",
  mLinesIn,
  AggregationType.COUNT,
  [tagKey],
  "The number of lines from standard input"
)

const lineLengthView = stats.createView(
  "demo/line_lengths",
  mLineLengths,
  AggregationType.DISTRIBUTION,
  [tagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
)

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

Now we will record the desired metrics. To do so, we will use `stats.record()` and pass in our measurements.

{{<tabs Snippet All>}}
{{<highlight javascript>}}  
const tags = { "method": "repl" };

// Records a new line
stats.record({
  measure: mLinesIn,
  tags,
  value: 1
});

stats.record({
  measure: mLineLengths,
  tags,
  value: processedLine.length
});

stats.record({
  measure: mLatencyMs,
  tags,
  value: endTime.getTime() - startTime.getTime()
});
{{</highlight>}}

{{<highlight javascript>}}
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');

const fs = require('fs');
const readline = require('readline');

// Our Stats manager
const stats = new Stats();

// The latency in milliseconds
const mLatencyMs = stats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts the number of lines read in from standard input
const mLinesIn = stats.createMeasureInt64("repl/lines_in", MeasureUnit.UNIT, "The number of lines read in");

// Counts/groups the lengths of lines read in.
const mLineLengths = stats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

const tagKey = "method";

const latencyView = stats.createView(
  "demo/latency",
  mLatencyMs,
  3,
  [tagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);

const lineCountView = stats.createView(
  "demo/lines_in",
  mLinesIn,
  0,
  [tagKey],
  "The number of lines from standard input"
)

const lineLengthView = stats.createView(
  "demo/line_lengths",
  mLineLengths,
  3,
  [tagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
)

// The begining of our REPL loop
let startTime = new Date();

// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  const processedLine = processLine(line);    // Evaluate
  console.log(processedLine);                // Print

  // Registers the end of our REPL
  const endTime = new Date();

  const tags = { "method": "repl" };

  // Records a new line
  stats.record({
    measure: mLinesIn,
    tags,
    value: 1
  });

  stats.record({
    measure: mLineLengths,
    tags,
    value: processedLine.length
  });

  stats.record({
    measure: mLatencyMs,
    tags,
    value: endTime.getTime() - startTime.getTime()
  });

  // Restarts the start time for the REPL
  startTime = endTime;
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

## Exporting to Stackdriver

We will be adding the Stackdriver package: `@opencensus/exporter-stackdriver`, create the Stackdriver exporter and pass it to the stats manager:

{{<tabs Snippet All>}}
{{<highlight javascript>}}
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');
const { StackdriverStatsExporter } = require('@opencensus/exporter-stackdriver');

const fs = require('fs');
const readline = require('readline');

// Our Stats manager
const stats = new Stats();

// Add your project id to the Stackdriver options
const exporter = new StackdriverStatsExporter({projectId: "your-project-id"});

// Pass the created exporter to Stats
stats.registerExporter(exporter);
{{</highlight>}}

{{<highlight javascript>}}
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');
const { StackdriverStatsExporter } = require('@opencensus/exporter-stackdriver');

const fs = require('fs');
const readline = require('readline');

// Our Stats manager
const stats = new Stats();

// Add your project id to the Stackdriver options
const exporter = new StackdriverStatsExporter({projectId: "your-project-id"});

// Pass the created exporter to Stats
stats.registerExporter(exporter);

// The latency in milliseconds
const mLatencyMs = stats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts the number of lines read in from standard input
const mLinesIn = stats.createMeasureInt64("repl/lines_in", MeasureUnit.UNIT, "The number of lines read in");

// Counts/groups the lengths of lines read in.
const mLineLengths = stats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

const tagKey = "method";

const latencyView = stats.createView(
  "demo/latency",
  mLatencyMs,
  3,
  [tagKey],
  "The distribution of the latencies",
  // Bucket Boundaries:
  // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
  [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);

const lineCountView = stats.createView(
  "demo/lines_in",
  mLinesIn,
  0,
  [tagKey],
  "The number of lines from standard input"
)

const lineLengthView = stats.createView(
  "demo/line_lengths",
  mLineLengths,
  3,
  [tagKey],
  "Groups the lengths of keys in buckets",
  // Bucket Boudaries:
  // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
  [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
)

// The begining of our REPL loop
let startTime = new Date();

// REPL is the read, evaluate, print and loop
lineReader.on("line", function (line) {       // Read
  const processedLine = processLine(line);    // Evaluate
  console.log(processedLine);                // Print

  // Registers the end of our REPL
  const endTime = new Date();

  const tags = { "method": "repl" };

  // Records a new line
  stats.record({
    measure: mLinesIn,
    tags,
    value: 1
  });

  stats.record({
    measure: mLineLengths,
    tags,
    value: processedLine.length
  });

  stats.record({
    measure: mLatencyMs,
    tags,
    value: endTime.getTime() - startTime.getTime()
  });

  // Restarts the start time for the REPL
  startTime = endTime;
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

Once registed, the Stackdriver exporter will be notified on every view registered and measurement recorded. It will translate and send the collected data on its own. Now, simply go to the [monitoring console](https://app.google.stackdriver.com/) and check the collected data.
