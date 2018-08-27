---
title: "Tracing"
date: 2018-08-21T07:09:06-11:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import and Start Tracing](#import-and-start-tracing)
    - [Instrumentation](#instrumentation)
        - [Creating a RootSpan](#creating-a-root-span)
        - [Creating a ChildSpan](#creating-a-child-span)
- [Exporting to Stackdriver](#exporting-to-stackdriver)

In this quickstart, we'll gleam insights from code segments and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

## Requirements
- [Node.js](https://nodejs.org/) 6 or above and `npm` (already comes with Node.js)
- Google Cloud Platform account and project
- Google Stackdriver Tracing enabled on your project

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

## Installation

OpenCensus: `npm install @opencensus/nodejs`

Stackdriver exporter: `npm install @opencensus/exporter-stackdriver`

## Getting Started

{{% notice note %}}
Unsure how to write and execute Node.js code? [Click here](https://nodejs.org/en/docs/guides/getting-started-guide/).
{{% /notice %}}

We will be a simple "read-evaluate-print-loop" (REPL) app. It would be nice if we could trace the following code, thus giving us observability in to how the code functions.

First, create a file called `repl.js`. Next, put the following code inside of `repl.js`:

{{<highlight javascript>}}
import * as fs from "fs";
import * as readline from "readline";

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

You can run the code via `node repl.js`.

## Enable Tracing

### Import and Start Tracing

To enable metrics, we just need to import `@opencensus/opencensus-nodejs` and call `.start()` on the tracing instance, it will look like this:

{{<tabs Snippet All>}}
{{<highlight javascript>}}
import * as tracing from "@opencensus/opencensus-nodejs";
tracing.start();
{{</highlight>}}

{{<highlight javascript>}}
import * as tracing from "@opencensus/opencensus-nodejs";
tracing.start();

import * as fs from "fs";
import * as readline from "readline";

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

### Instrumentation

We will be tracing the execution as it starts by creating a root span. On every loop in the REPL, we'll create a child span to trace that specific operation.

#### Creating a Root Span

To create a Root Span, we need to call `tracing.tracer.startRootSpan()` and pass in a name for that span. the `startRootSpan` method takes in a callback that receives the created `rootSpan` as an argument. For our scenario, it will look like this:

{{<tabs Snippet All>}}
{{<highlight javascript>}}
tracing.tracer.startRootSpan({name: "repl-loop"}, rootSpan => {
  // Our REPL code

  // End our root span at the end of all the operation
  rootSpan.end();
});
{{</highlight>}}

{{<highlight javascript>}}
import * as tracing from "@opencensus/opencensus-nodejs";
tracing.start();

import * as fs from "fs";
import * as readline from "readline";

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

tracing.tracer.startRootSpan({name: "repl-loop"}, rootSpan => {
  // REPL is the read, evaluate, print and loop
  lineReader.on("line", function (line) {       // Read
    const processedLine = processLine(line);    // Evaluate
    console.log(processedLine);                // Print
  });

  // End our root span at the end of all the operation
  rootSpan.end();
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

#### Creating a Child Span

To trace individual loops from the REPL, we can create `ChildSpans` inside our just created `RootSpan`. To accomplish that, we use the method `tracing.tracer.createChildSpan()` and pass in an object that contains the child span name, like:

{{<tabs Snippet All>}}
{{<highlight javascript>}}
// Starts the child span
replSpan = tracing.tracer.startChildSpan("repl-iteration");

// Ends the child span
replSpan.end();
{{</highlight>}}

{{<highlight javascript>}}
import * as tracing from "@opencensus/opencensus-nodejs";
tracing.start();

const fs = require("fs");
const readline = require("readline");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

tracing.tracer.startRootSpan({name: "repl-loop"}, rootSpan => {

  // Creates a place holder for our child span
  let replSpan;

  // REPL is the read, evaluate, print and loop
  lineReader.on("line", function(line) {       // Read
    if (replSpan) {
      replSpan.end();
    }
    replSpan = tracing.tracer.startChildSpan("repl-iteration");
    
    const processedLine = processLine(line);    // Evaluate
    console.log(processedLine);                 // Print
  });
  
  // End our root span at the end of all the operation
  rootSpan.end();
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

In the code above, we keep finishing and starting a new child span on each iteration. On the first one, no child span was created, so we check with `if(replSpan) {` to make sure we don't end a non existing child span.

## Exporting to Stackdriver

To turn on Stackdriver Tracing, we’ll need to import the Stackdriver exporter from `@opencensus/opencensus-exporter-stackdriver` an pass in as an exporter to `tracing.start()`.

{{<tabs Snippet All>}}
{{<highlight javascript>}}
import {StackdriverTraceExporter} from "@opencensus/exporter-stackdriver";
// Add your project id to the Stackdriver options
const exporter = new StackdriverTraceExporter({projectId: "your-project-id"});

import * as tracing from "@opencensus/opencensus-nodejs";
tracing.start({"exporter": exporter});
{{</highlight>}}

{{<highlight javascript>}}
import {StackdriverTraceExporter} from "@opencensus/exporter-stackdriver";
// Add your project id to the Stackdriver options
const exporter = new StackdriverTraceExporter({projectId: "your-project-id"});

import * as tracing from "@opencensus/opencensus-nodejs";
tracing.start({"exporter": exporter});

const fs = require("fs");
const readline = require("readline");

// Creates a stream to read our file
const stream = fs.createReadStream("./test.txt");

// Creates an interface to read and process our file line by line
const lineReader = readline.createInterface({ input: stream });

tracing.tracer.startRootSpan({name: "repl-loop"}, rootSpan => {

  // Creates a place holder for our child span
  let replSpan;

  // REPL is the read, evaluate, print and loop
  lineReader.on("line", function(line) {       // Read
    if (replSpan) {
      replSpan.end();
    }
    replSpan = tracing.tracer.startChildSpan("repl-iteration");
    
    const processedLine = processLine(line);    // Evaluate
    console.log(processedLine);                 // Print
  });
  
  // End our root span at the end of all the operation
  rootSpan.end();
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

Once registed, the Stackdriver exporter will be notified on every root span ending. It will translate and send the collected data to Stackdriver Cloud Tracing on its own. Now, simply go to the [tracing console](console.cloud.google.com) and check the collected data.
