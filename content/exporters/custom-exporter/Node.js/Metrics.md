---
title: "Stats exporter"
draft: false
weight: 3
aliases: [/custom_exporter/nodejs/metrics, /custom_exporter/node.js/metrics, /guides/exporters/custom-exporter/nodejs/metrics, /guides/exporters/custom-exporter/node.js/metrics]
---

### Table of contents
- [Introduction](#introduction)
- [Implementation](#implementation)
- [Runnable example](#runnable-example)
- [Notes](#notes)
- [References](#references)

#### Introduction
A stats exporter must implement [Stats Event Listener](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/exporters/types.ts#L34). Which must contain two methods, `onRegisterView` and `onRecord`, that is called whenever a new view is registered and whenever a new measurement is registered, respectively.

Implemented in [Typescript](https://www.typescriptlang.org/), a stats exporter implementation should look something like this:

Placed inside a file statsExporter.ts

```typescript
/** Defines a trace exporter interface. */
class MyExporter implements StatsEventListener {
  /**
   * Is called whenever a new view is registered
   * @param view The registered view
   */
  onRegisterView(view: View): void {
    // Your on record code
  };

  /**
   * Is called whenever a new measurement is recorded.
   * @param views The views related to the measurement
   * @param measurement The recorded measurement
   */
  onRecord(views: View[], measurement: Measurement): void {
    // Your on record code
  };
}
```

#### Implementation

For example, let's make a custom span exporter that will print span data to standard output.

```typescript
/** Exporter that receives stats data and shows in the log console. */
export class MyConsoleStatsExporter implements StatsEventListener {
  /**
   * Called whenever a new view is registered
   * @param view The registered view
   */
  onRegisterView(view: View) {
    console.log(`View registered: ${view.name}, Measure registered: ${
        view.measure.name}`);
  }

  /**
   * Called whenever a measurement is recorded
   * @param views The updated views
   * @param measurement The recorded measurement
   */
  onRecord(views: View[], measurement: Measurement) {
    console.log(`Measurement recorded: ${measurement.measure.name}`);
  }
}
```

#### Runnable example

And now to test it out as we would in a typically linked program, let's create a `expample.js` file:

{{<highlight javascript>}}
const { globalStats, AggregationType, TagMap } = require('@opencensus/core');

// Let's create an instance of our just created exporter
const exporter = new MyConsoleStatsExporter();
// And register it
globalStats.registerExporter(exporter);

// Let's create a measure
const measure = globalStats.createMeasureInt64('my/measure', "1");
// our tags
const myTagKey = { name: "myTagKey" };
const tags = new TagMap();
tags.set(myTagKey, { value: "myTagValue" });

// Create and Register the view
const view = globalStats.createView(
  /* name */ 'my/view',
  measure, 
  AggregationType.LAST_VALUE, 
  [myTagKey], 
  /* description */ 'my view'
);
globalStats.registerView(view);
// and our measurement
const measurement = {measure, value: 10};

// finally, let's record it
globalStats.record([measurement], tags);
{{</highlight>}}

Now, run it with `node example.js` and you should see logs for our view being created and our measurement being recorded.
