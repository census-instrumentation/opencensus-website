---
title: "Trace exporter"
draft: false
weight: 3
aliases: [/custom_exporter/nodejs/trace, /custom_exporter/node.js/trace, /guides/exporters/custom-exporter/nodejs/trace, /guides/exporters/custom-exporter/node.js/trace]
---

### Table of contents
- [Introduction](#introduction)
- [Implementation](#implementation)
- [Runnable example](#runnable-example)
- [Notes](#notes)
- [References](#references)

#### Introduction
A trace exporter must implement [Exporter](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/exporters/types.ts). Which must contain a method `onEndSpan`, that is called whenever a new span is ended. Usually, this method writes the span to an [Exporter Buffer](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/exporters/exporter-buffer.ts#L26), allowing the Exporter to store spans and send batched data to a client. A trace exporter must also contain a `publish` method that will translate and export [root spans](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/trace/model/types.ts#L206) and its [child spans](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/trace/model/types.ts#L94) to the service, if an Exporter Buffer is used, it will be responsible for calling the `publish` method when it has reached its time or size capacity.

A trace exporter should also have a `onStartSpan` method, that will be called whenever a span is started. This method is useful for close to real time exporters, like zPages.

A trace exporter implementation should look something like this:

```typescript
/** Defines a trace exporter interface. */
class MyExporter implements Exporter {
  /**
   * Sends a list of root spans to the service.
   * @param rootSpans A list of root spans to publish.
   */
  publish(rootSpans: modelTypes.RootSpan[]): Promise<number|string|void> {
	// Your publishing code
  };

  /**
   * Event called whenever a span is started.
   * @param span The started span
   */
  onStartSpan(span: RootSpan): void {
	// Your on start span code
  };
  
  /**
   * Event called whenever a span is ended.
   * @param span The ended span
   */
  onEndSpan(span: RootSpan): void {
	// Your on end span code
  };
}
```

#### Implementation

For example, let's make a custom trace exporter that will print span data to standard output.

```typescript
/** Format and sends span data to the console. */
export class MyConsoleTraceExporter implements types.Exporter {
  /** Buffer object to store the spans. */
  private buffer: ExporterBuffer;

  /**
   * Constructs a new ConsoleLogExporter instance.
   * @param config Exporter configuration object to create a console log
   * exporter.
   */
  constructor(config: types.ExporterConfig) {
    this.buffer = new ExporterBuffer(this, config);
  }

  /** 
   * Our onStartSpan will do nothing. The exporting logic will be concentrated
   * at the onEndSpan event.
   */
  onStartSpan(root: modelTypes.RootSpan) {}

  /**
   * Called whenever a span is ended.
   * @param root Ended span.
   */
  onEndSpan(root: modelTypes.RootSpan) {
	// We will just add the ended span to the buffer and wait for it to call
	// the exporter back giving all the stored spans. This allow us to print
	// spans in batch.
    this.buffer.addToBuffer(root);
  }
  /**
   * Sends the spans information to the console.
   * @param rootSpans The stored spans
   */
  publish(rootSpans: modelTypes.RootSpan[]) {
	// Let's iterate over all root spans formating the data the way we want
    rootSpans.map((root) => {
      const ROOT_STR = `RootSpan: {traceId: ${root.traceId}, spanId: ${
          root.id}, name: ${root.name} }`;

      const SPANS_STR: string[] = root.spans.map(
          (span) => [`\t\t{spanId: ${span.id}, name: ${span.name}}`].join(
              '\n'));

      const result: string[] = [];
      result.push(
          ROOT_STR + '\n\tChildSpans:\n' +
          `${SPANS_STR.join('\n')}`);
      console.log(`${result}`);
    });

    return Promise.resolve();
  }
}
```

#### Runnable example

And now to test it out as we would in a typically linked program, let's create a `expample.js` file:

```javascript
const tracing = require('@opencensus/opencensus-nodejs');

// Let's create an instance of our just created exporter
const exporter = new MyConsoleTraceExporter();
// And start tracing with it
tracing.registerExporter(exporter).start();

// Now, lets create a simple HTTP/2 server
const http2 = require('http2')
const server2 = http2.createServer();

// On every call to http://localhost:8080 we will return a Hello World message
server2.on('stream', (stream, requestHeaders) => {
    stream.end("Hello World");
});
server2.listen(8080);
```

Now, run it with `node example.js` and go to [http://localhost:8080](http://localhost:8080) on your browser. In the beginning, you may see nothing in the console, but a few seconds latter, the exporter buffer kicks in and calls the publish method on your console log exporter, this will print the span info we wanted.
