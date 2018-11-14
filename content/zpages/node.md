---
title: "Node"
weight: 2
aliases: [/core-concepts/zpages/node]
---

- [Packages to import](#packages-to-import)
- [Source code example](#source-code-example)
- [Tracez](#tracez)
- [TraceConfigz](#traceconfigz)
- [References](#references)

### Packages to import
```sh
npm install @opencensus/nodejs
npm install @opencensus/exporter-zpages
```

### Source code example
{{% tabs Minimal REPL %}}
```js
const tracing = require('@opencensus/nodejs');
const zpages = require('@opencensus/exporter-zpages');

const options = {
  port: 8080,   // default
  startServer: true,  // default
  spanNames: ['predefined/span1', 'predefined/span2']
};

const exporter = new zpages.ZpagesExporter(options);
const tracer = tracing.registerExporter(exporter).start().tracer;
```

```js
const tracing = require('@opencensus/nodejs');
const zpages = require('@opencensus/exporter-zpages');
const stdin = process.openStdin();

const options = {
  port: 8080,   // default
  startServer: true,  // default
  spanNames: ['predefined/span1', 'predefined/span2']
};

const defaultConfig = {
  name: 'readEvaulateProcessLine',
  samplingRate: 1.0  // always sample
};

function delay() {
  for (let i = 0; i < 1000000; i++) {}
}

const exporter = new zpages.ZpagesExporter(options);
const tracer = tracing.registerExporter(exporter).start().tracer;

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
{{% /tabs %}}

### Tracez
On visiting http://localhost:8080/tracez
![](/images/zpages-tracez-node.png)

### TraceConfigz
On visiting http://localhost:8080/traceconfigz
![](/images/zpages-traceconfigz-node.png)

### References
Resource|URL
---|---
zPages NodeDoc|https://github.com/census-instrumentation/opencensus-node/tree/master/packages/opencensus-exporter-zpages
