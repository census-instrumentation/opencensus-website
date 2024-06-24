author:            Emmanuel Odeke and Henry Ventura
summary:           Node.js Metrics Quickstart
environments:      Web
id:                nodemetrics

# Node.js Metrics Quickstart

## Overview of the tutorial
Duration: 0:07

By the end of this tutorial, we will do these four things to obtain metrics using OpenCensus:

1. Create quantifiable `metrics` (numerical) that we will **record**
2. Create [tags](/core-concepts/tags) that we will associate with our metrics
3. Organize our metrics, similar to writing a report, in to a `View`
4. Export our views to a backend (Stackdriver in this case)

Requirements:
- [Node.js](https://nodejs.org/) 6 or above and `npm` (already comes with Node.js)
- Google Cloud Platform account and project
- Google Stackdriver Monitoring enabled on your project

Positive
: For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.


## Installation
Duration: 0:06

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

## Getting Started
Duration: 0:05

Positive
: Unsure how to write and execute Node.js code? [Click here](https://nodejs.org/en/docs/guides/getting-started-guide/).

We will be a simple "read-evaluate-print-loop" (REPL) app. In there we'll collect some metrics to observe the work that is going on within this code, such as:

- Latency per processing loop
- Number of lines read
- Line lengths

First, create a file called `repl.js`:

```bash
touch repl.js
```

Next, put the following code inside of `repl.js`:

```javascript
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
```

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
Duration: 00:03

### Import Packages

To enable metrics, we'll import a few items from OpenCensus Core package.

```javascript
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');
```

### Create Metrics

First, we will create the variables needed to later record our metrics.

```javascript
// Our Stats manager
const stats = new Stats();

// The latency in milliseconds
const mLatencyMs = stats.createMeasureDouble("repl/latency", MeasureUnit.MS, "The latency in milliseconds per REPL loop");

// Counts/groups the lengths of lines read in.
const mLineLengths = stats.createMeasureInt64("repl/line_lengths", MeasureUnit.BYTE, "The distribution of line lengths");
```



## Record and Aggregate Data
Duration: 00:02

### Create Views and Tags
We now determine how our metrics will be organized by creating `Views`. We will also create the variable needed to add extra text meta-data to our metrics -- `methodTagKey`, `statusTagKey`, and `errorTagKey`.

```javascript
const methodTagKey = "method";
const statusTagKey = "status";
const errorTagKey = "error";

const latencyView = stats.createView(
    "demo/latency",
    mLatencyMs,
    AggregationType.DISTRIBUTION,
    [methodTagKey, statusTagKey, errorTagKey],
    "The distribution of the latencies",
    // Bucket Boundaries:
    // [>=0ms, >=25ms, >=50ms, >=75ms, >=100ms, >=200ms, >=400ms, >=600ms, >=800ms, >=1s, >=2s, >=4s, >=6s]
    [0, 25, 50, 75, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6000]
);

const lineCountView = stats.createView(
        "demo/lines_in",
        mLineLengths,
        AggregationType.COUNT,
        [methodTagKey],
        "The number of lines from standard input"
)

const lineLengthView = stats.createView(
    "demo/line_lengths",
    mLineLengths,
    AggregationType.DISTRIBUTION,
    [methodTagKey],
    "Groups the lengths of keys in buckets",
    // Bucket Boudaries:
    // [>=0B, >=5B, >=10B, >=15B, >=20B, >=40B, >=60B, >=80, >=100B, >=200B, >=400, >=600, >=800, >=1000]
    [0, 5, 10, 15, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000]
)
```

We will later use this tag key, to record what method is being invoked. In our scenario, we will only use it to record that "repl" is calling our data.

Again, this is arbitrary and purely up the user. For example, if we wanted to track what operating system a user is using, we could create a tag key `"operating_system"` and later, when we use it, we will be given an opportunity to enter values such as "windows" or "mac".

### Recording Metrics

Now we will record the desired metrics. To do so, we will use `stats.record()` and pass in our measurements.

```javascript
lineReader.on("line", function (line) {
    // Registers the Tags for our measurements
    const tags = {method: "repl", status: "OK"};

    try {
        // ...
        stats.record({
        measure: mLineLengths,
        tags,
        value: processedLine.length
        });
    } catch (err) {
        tags.status = "ERROR";
        tags.error = err.message;
    }

    stats.record({
        measure: mLatencyMs,
        tags,
        value: (new Date()) - startTime.getTime()
    });

    // Restarts the start time for the REPL
    startTime = new Date();
});
```


## Exporting to Stackdriver
Duration: 00:01

We will be adding the Stackdriver package: `@opencensus/exporter-stackdriver`, create the Stackdriver exporter and pass it to the stats manager:

```javascript
const { Stats, MeasureUnit, AggregationType } = require('@opencensus/core');
const { StackdriverStatsExporter } = require('@opencensus/exporter-stackdriver');

const fs = require('fs');
const readline = require('readline');

// Create the Stats manager
const stats = new Stats();

// Add your project id to the Stackdriver options
const exporter = new StackdriverStatsExporter({projectId: "your-project-id"});

// Pass the created exporter to Stats
stats.registerExporter(exporter);
```


## Viewing your metrics
Duration: 00:00

Once registed, the Stackdriver exporter will be notified on every view registered and measurement recorded. It will translate and send the collected data on its own. Now, simply go to the [monitoring console](https://app.google.stackdriver.com/) and check the collected data.
![](./nodemetrics/img/metrics-node-stackdriver.png)
Each bar in the heatmap represents one run of the program, and the colored components of each bar represent part of the latency distribution.
