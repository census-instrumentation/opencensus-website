---
title: "Stats exporter"
draft: false
weight: 3
---

### Table of contents
- [Introduction](#introduction)
- [Implementation](#implementation)
- [Runnable example](#runnable-example)
- [Notes](#notes)
- [References](#references)

#### Introduction
A stats exporter must implement [Stats Event Listener](https://github.com/census-instrumentation/opencensus-node/blob/master/packages/opencensus-core/src/exporters/types.ts#L34). Which must contain two methods, `onRegisterView` and `onRecord`, that is called whenever a new view is registered and whenever a new measurement is registered, respectively.

A stats exporter implementation should look something like this:

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

```javascript
var opencensus = require('@opencensus/core');
var stats = new opencensus.Stats();

// Let's create an instance of our just created exporter
var exporter = new MyConsoleStatsExporter();
// And register it
stats.registerExporter(exporter);

// Let's create a measure
var measure = stats.createMeasureInt64('my/measure', "1");
// our tags
var tags = {myTagKey: 'myTagValue'};
// a view
var view = stats.createView('my/view', measure, 2, ['myTagKey'], 'my view');
// and our measurement
var measurement = {measure, tags, value: 10};

// finaly, let's record it
stats.record(measurement);
```

Now, run it with `node example.js` and you should see logs for our view beeing created and our measurement beeing recorded.
