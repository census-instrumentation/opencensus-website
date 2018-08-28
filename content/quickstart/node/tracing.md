---
title: "Tracing"
date: 2018-07-22T20:29:06-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting to Stackdriver](#exporting-to-stackdriver)
    - [Import Packages](#import-exporting-packages)
    - [Create the Exporter](#create-the-exporter)
- [Optional: Add a Delay](#optional-add-a-delay)
- [Viewing your Traces on Stackdriver](#viewing-your-traces-on-stackdriver)

In this quickstart, we’ll gleam insights from code segments and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

## Requirements
- Node
- Google Cloud Platform account and project
- Google Stackdriver Tracing enabled on your project

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
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

{{% notice warning %}}
While the latest version of the [Stackdriver exporter on the Github repository](https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-exporter-stackdriver) exports attributes, the version found on `npm` as of the time of writing **does not**. This will be resolved soon. In the meantime, you can clone [opencensus-node](https://github.com/census-instrumentation/opencensus-node).
{{% /notice %}}

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

## Exporting to Stackdriver
To create the exporter, you'll need to:

* Have a GCP Project ID
* Have already enabled [Stackdriver Trace](https://cloud.google.com/trace/docs/quickstart), if not, please visit the [Code lab](/codelabs/stackdriver)
* Enable your [Application Default Credentials](https://cloud.google.com/docs/authentication/getting-started) for authentication with:

{{<highlight bash>}}
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credential.json
{{</highlight>}}

<a name="import-exporting-packages"></a>
### Import Packages
To turn on Stackdriver Tracing, we’ll need to install a new package.

Enter the following code snippet in your terminal:

```bash
npm install --save @opencensus/exporter-stackdriver
```
Append and modify the following code snippet to your `require` statements:

{{% tabs Snippet All %}}
```js
const stackdriver = require('@opencensus/exporter-stackdriver');
```

```js
const tracing = require('@opencensus/nodejs');
const stackdriver = require('@opencensus/exporter-stackdriver');
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

First we will retrieve your Google Cloud Project ID by placing this function at the end of our file:

{{% tabs Snippet All%}}
```js
function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
}
```

```js
const tracing = require('@opencensus/nodejs');
const stackdriver = require('@opencensus/exporter-stackdriver');
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

function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
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

Next, we will initialize the exporter.

{{% tabs Snippet All %}}
```js
const exporter = new stackdriver.StackdriverTraceExporter({projectId: getProjectId()});
```

```js
const tracing = require('@opencensus/nodejs');
const stackdriver = require('@opencensus/exporter-stackdriver');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const exporter = new stackdriver.StackdriverTraceExporter({projectId: getProjectId()});

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

function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
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
const stackdriver = require('@opencensus/exporter-stackdriver');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const exporter = new stackdriver.StackdriverTraceExporter({projectId: getProjectId()});

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

function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
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
const stackdriver = require('@opencensus/exporter-stackdriver');
const stdin = process.openStdin();

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

const exporter = new stackdriver.StackdriverTraceExporter({projectId: 'your-project-id'});

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

function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
}

/*
 * In a REPL:
 * 1. Read input
 * 2. process input
 */
stdin.addListener("data", readEvaluateProcessLine);
process.stdout.write('> ');
```

## Viewing your Traces on Stackdriver
With the above you should now be able to navigate to the [Google Cloud Platform console](https://console.cloud.google.com/traces/traces), select your project, and view the traces.

![viewing traces 1](/images/node-trace-overall.png)

And on clicking on the `readLine` span, we should be able to see the attributes.

![viewing traces 2](/images/node-trace-attributes.png)
