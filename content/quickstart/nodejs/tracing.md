---
title: "Tracing"
date: 2018-07-22T20:29:06-07:00
draft: false
class: "shadowed-image lightbox"
aliases: [/quickstart/node.js/tracing]
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting to Zipkin](#exporting-to-zipkin)
    - [Create the Exporter](#create-the-exporter)
- [Optional: Add a Delay](#optional-add-a-delay)
- [Running the code](#running-the-code)
- [Viewing your Traces on Zipkin](#viewing-your-traces-on-zipkin)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

## Requirements
- [Node.js](https://nodejs.org/) 6 or above and `npm` (already comes with Node.js)
- Zipkin as our choice of tracing backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.

You can swap out any other exporter from the [list of Node.js exporters](/guides/exporters/supported-exporters/node.js)
{{% /notice %}}

## Installation
We will first create our project directory, initialize our project, and bootstrap our entry file.

```bash
mkdir repl-app
cd repl-app

npm init -y

touch index.js
```

Put this in your newly generated `index.js` file:

```js
const stdin = process.openStdin();

function readEvaluateProcessLine(input) {
  const text = readLine(input);
  const upperCase = processLine(text);

  process.stdout.write('< ' + upperCase + '\n> ');
}

function readLine(input) {
  return input.toString().trim();
}

function processLine(text) {
  return text.toUpperCase();
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```

## Getting Started
The Repl application takes input from users, converts any lower-case letters into upper-case letters, and echoes the result back to the user, for example:
```bash
> foo
< FOO
```

Let's first run the application and see what we have.
```bash
node index.js
```

You will be given a text prompt. Try typing in a lowercase word and hit enter to receive the uppercase equivalent.

You should see something like this after a few tries:
![node image 1](/images/node-quickstart-tracing-1.png)

To exit out of the application, hit ctrl + c on your keyboard.

From here on out, we will be rewriting sections of index.js.

## Enable Tracing

<a name="import-tracing-packages"></a>
### Import Packages

To enable tracing, we’ll import the `@opencensus/nodejs` package from `opencensus`.

Enter the following in your command line:
```bash
npm install --save @opencensus/nodejs
```
Insert the following snippet in the beginning of `index.js`:

{{% tabs Snippet All %}}
```js
const tracing = require('@opencensus/nodejs');
```

```js
const tracing = require('@opencensus/nodejs');
const stdin = process.openStdin();

function readEvaluateProcessLine(input) {
  const text = readLine(input);
  const upperCase = processLine(text);

  process.stdout.write('< ' + upperCase + '\n> ');
}

function readLine(input) {
  return input.toString().trim();
}

function processLine(text) {
  return text.toUpperCase();
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

<a name="instrument-tracing"></a>
### Instrumentation

We will be tracing the execution as it starts in `readEvaluateProcessLine`, goes to `readLine`, and finally travels through `processLine`.

To accomplish this, we must do four things:

**1. Initialize the Tracer and Tracing Configuration**

Insert the following snippet after the `require` statements:

{{% tabs Snippet All %}}
```js
const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const tracer = tracing.start().tracer;
```

```js
const tracing = require('@opencensus/nodejs');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const tracer = tracing.start().tracer;

function readEvaluateProcessLine(input) {
  const text = readLine(input);
  const upperCase = processLine(text);

  process.stdout.write('< ' + upperCase + '\n> ');
}

function readLine(input) {
  return input.toString().trim();
}

function processLine(text) {
  return text.toUpperCase();
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

**2. Create a Root Span**

We will modify our `readEvaluateProcessLine` function to create a root span:

{{% tabs Snippet All %}}
```js
function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');

    rootSpan.end();
  });
}
```

```js
const tracing = require('@opencensus/nodejs');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const tracer = tracing.start().tracer;

function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');

    rootSpan.end();
  });
}

function readLine(input) {
  return input.toString().trim();
}

function processLine(text) {
  return text.toUpperCase();
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

**3. Create a span in each of the three functions**

We will create a child span in `readLine` and `processLine`. To create a child span, use the following snippet:

```js
const span = tracer.startChildSpan('spanName');
span.start();
// code
span.end();
```

Our two instrumented functions, `readLine` and `processLine`, have become the following:

{{% tabs Snippet All %}}
```js
function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();

  span.end();
  return text;
}

function processLine(text) {
  const span = tracer.startChildSpan('processLine');
  span.start();

  const upperCaseText = text.toUpperCase();

  span.end();
  return upperCaseText;
}
```

```js
const tracing = require('@opencensus/nodejs');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const tracer = tracing.start().tracer;

function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');
  });
}

function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();

  span.end();
  return text;
}

function processLine(text) {
  const span = tracer.startChildSpan('processLine');
  span.start();

  const upperCaseText = text.toUpperCase();

  span.end();
  return upperCaseText;
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

**4. Add Attributes**

We can add metadata to our traces to increase our post-mortem insight.

Let's record the length of each requested string so that it is available to view when we are looking at our traces. We can do this by modifying our `readLine` function.

{{% tabs Snippet All %}}
```js
function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();
  span.addAttribute('length', text.length);
  span.addAttribute('text', text);

  span.end();
  return text;
}
```

```js
const tracing = require('@opencensus/nodejs');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const tracer = tracing.start().tracer;

function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');
  });
}

function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();
  span.addAttribute('length', text.length);
  span.addAttribute('text', text);

  span.end();
  return text;
}

function processLine(text) {
  const span = tracer.startChildSpan('processLine');
  span.start();

  const upperCaseText = text.toUpperCase();

  span.end();
  return upperCaseText;
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

## Exporting to Zipkin

Enter the following code snippet in your terminal:

```bash
npm install --save @opencensus/exporter-zipkin
```
Append and modify the following code snippet to your `require` statements:

{{% tabs Snippet All %}}
```js
var exporter = require('@opencensus/exporter-zipkin');
```

```js
const tracing = require('@opencensus/nodejs');
const zipkin = require('@opencensus/exporter-zipkin');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const tracer = tracing.start().tracer;

function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');
  });
}

function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();
  span.addAttribute('length', text.length);
  span.addAttribute('text', text);

  span.end();
  return text;
}

function processLine(text) {
  const span = tracer.startChildSpan('processLine');
  span.start();

  const upperCaseText = text.toUpperCase();

  span.end();
  return upperCaseText;
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

### Create the Exporter

We start by initilazing the exporter with a configuration, like so:

{{% tabs Snippet All %}}
```js
var options = {
    url: 'http://localhost:9411/api/v2/spans',
    serviceName: 'node.js-quickstart'
};
var exporter = new zipkin.ZipkinTraceExporter(options);
```

```js
const tracing = require('@opencensus/nodejs');
const zipkin = require('@opencensus/exporter-zipkin');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

var options = {
    url: 'http://localhost:9411/api/v2/spans',
    serviceName: 'node.js-quickstart'
};
var exporter = new zipkin.ZipkinTraceExporter(options);

const tracer = tracing.start().tracer;

function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');
  });
}

function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();
  span.addAttribute('length', text.length);
  span.addAttribute('text', text);

  span.end();
  return text;
}

function processLine(text) {
  const span = tracer.startChildSpan('processLine');
  span.start();

  const upperCaseText = text.toUpperCase();

  span.end();
  return upperCaseText;
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

Now we will invoke our `exporter` after we instantiate `tracer`.

{{% tabs Snippet All %}}
```js
tracer.registerSpanEventListener(exporter);
```

```js
const tracing = require('@opencensus/nodejs');
const zipkin = require('@opencensus/exporter-zipkin');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

var options = {
    url: 'http://localhost:9411/api/v2/spans',
    serviceName: 'node.js-quickstart'
};
var exporter = new zipkin.ZipkinTraceExporter(options);

const tracer = tracing.start().tracer;
tracer.registerSpanEventListener(exporter);

function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');
  });
}

function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();
  span.addAttribute('length', text.length);
  span.addAttribute('text', text);

  span.end();
  return text;
}

function processLine(text) {
  const span = tracer.startChildSpan('processLine');
  span.start();

  const upperCaseText = text.toUpperCase();

  span.end();
  return upperCaseText;
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```
{{% /tabs %}}

## Optional: Add a Delay
To illustrate the concepts of tracing, let's add a slight delay to each span.

Our delay function:

```js
function delay() {
  for (let i = 0; i < 1000000; i++) {}
}
```

Add the delay function to `readLine` and `processLine`.

The following snippet of code represents the final state of `index.js`:

```js
const tracing = require('@opencensus/nodejs');
const zipkin = require('@opencensus/exporter-zipkin');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

var options = {
    url: 'http://localhost:9411/api/v2/spans',
    serviceName: 'node.js-quickstart'
}
var exporter = new zipkin.ZipkinTraceExporter(options);

const tracer = tracing.start().tracer;
tracer.registerSpanEventListener(exporter);

function delay() {
  for (let i = 0; i < 1000000; i++) {}
}

function readEvaluateProcessLine(input) {
  tracer.startRootSpan(defaultConfig, rootSpan => {
    const text = readLine(input);
    const upperCase = processLine(text);

    process.stdout.write('< ' + upperCase + '\n> ');

    rootSpan.end();
  });
}

function readLine(input) {
  const span = tracer.startChildSpan('readLine');
  span.start();

  const text = input.toString().trim();
  span.addAttribute('length', text.length);
  span.addAttribute('text', text);

  delay();

  span.end();
  return text;
}

function processLine(text) {
  const span = tracer.startChildSpan('processLine');
  span.start();

  const upperCaseText = text.toUpperCase();

  delay();

  span.end();
  return upperCaseText;
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```

## Running the code

Having already successfully started Zipkin as in [Zipkin Codelab](/codelabs/zipkin), we can now run our code by

```shell
node index.js
```

## Viewing your Traces on Zipkin
With the above you should now be able to navigate to the Zipkin UI at http://localhost:9411, which will produce such a screenshot:
![](/images/trace-node-zipkin-all-traces.png)

On clicking on one of the traces, we should be able to see the following:
![](/images/trace-node-zipkin-single-trace.png)

And on clicking on `More info` we should see
![](/images/trace-node-zipkin-all-details.png)

## References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
Node.js exporters|[Node.js exporters](/guides/exporters/supported-exporters/node.js)

