---
title: "Tracing"
date: 2019-03-02T14:29:21-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Maven Configuration](#maven-configuration)
- [Run it locally](#run-it-locally)
- [Configure Exporter](#configure-exporter)
- [Configure Sampler](#configure-sampler)
- [Using the Tracer](#using-the-tracer)
- [Create a Span](#create-a-span)
- [Create a Child Span](#create-a-child-span)
- [Shutdown the Tracer](#shutdown-the-tracer)
- [References](#references)

#### Maven Configuration
```xml
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-api</artifactId>
    <version>${opencensus.version}</version>
</dependency>

<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-impl</artifactId>
    <version>${opencensus.version}</version>
</dependency>

<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-exporter-trace-zipkin</artifactId>
    <version>${opencensus.version}</version>
</dependency>
```

#### Run it locally

1. Clone the example repository: `git clone https://github.com/opencensus-otherwork/opencensus-quickstarts.git`
2. Change to the example directory: `cd opencensus-quickstarts/java/opencensus-tracing-to-zipkin`
3. Download Zipkin: `curl -sSL https://zipkin.io/quickstart.sh | bash -s`
4. Start Zipkin: `java -jar zipkin.jar`
5. Run the code: `mvn compile exec:java -Dexec.mainClass=com.example.TracingToZipkin`
6. Navigate to Zipkin Web UI: `http://localhost:9411`
7. Click _Find Traces_, and you should see a trace.
8. Click into that, and you should see the details.

![](/images/java-tracing-zipkin.png)

#### How does it work?

{{% tabs Snippet All %}}
```java
public static void main(String[] args) {
	// 1. Configure exporter to export traces to Zipkin.
	ZipkinTraceExporter.createAndRegister(
		"http://localhost:9411/api/v2/spans", "tracing-to-zipkin-service");

	// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
	TraceConfig traceConfig = Tracing.getTraceConfig();
	TraceParams activeTraceParams = traceConfig.getActiveTraceParams();
	traceConfig.updateActiveTraceParams(
		activeTraceParams.toBuilder().setSampler(
			Samplers.alwaysSample()).build());

	// 3. Get the global singleton Tracer object.
	Tracer tracer = Tracing.getTracer();

	// 4. Create a scoped span, a scoped span will automatically end when closed.
	// It implements AutoClosable, so it'll be closed when the try block ends.
	try (Scope scope = tracer.spanBuilder("main").startScopedSpan()) {
		System.out.println("About to do some busy work...");
		for (int i = 0; i < 10; i++) {
			doWork(i);
		}
	}

	// 5. Gracefully shutdown the exporter, so that it'll flush queued traces to Zipkin.
	Tracing.getExportComponent().shutdown();
}
```

```java
package com.example;

import java.util.HashMap;
import java.util.Map;

import io.opencensus.trace.AttributeValue;
import io.opencensus.common.Scope;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.config.TraceParams;
import io.opencensus.trace.samplers.Samplers;

public class TracingToZipkin {
	public static void main(String[] args) {
		// 1. Configure exporter to export traces to Zipkin.
		ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "tracing-to-zipkin-service");

		// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
		TraceConfig traceConfig = Tracing.getTraceConfig();
		TraceParams activeTraceParams = traceConfig.getActiveTraceParams();
		traceConfig.updateActiveTraceParams(activeTraceParams.toBuilder().setSampler(Samplers.alwaysSample()).build());

		// 3. Get the global singleton Tracer object.
		Tracer tracer = Tracing.getTracer();

		// 4. Create a scoped span, a scoped span will automatically end when closed.
		// It implements AutoClosable, so it'll be closed when the try block ends.
		try (Scope scope = tracer.spanBuilder("main").startScopedSpan()) {
			System.out.println("About to do some busy work...");
			for (int i = 0; i < 10; i++) {
				doWork(i);
			}
		}

		// 5. Gracefully shutdown the exporter, so that it'll flush queued traces to Zipkin.
		Tracing.getExportComponent().shutdown();
	}

	private static void doWork(int i) {
		// 6. Get the global singleton Tracer object.
		Tracer tracer = Tracing.getTracer();

		// 7. Start another span. If another span was already started, it'll use that span as the parent span.
		// In this example, the main method already started a span, so that'll be the parent span, and this will be
		// a child span.
		try (Scope scope = tracer.spanBuilder("doWork").startScopedSpan()) {
			// Simulate some work.
			Span span = tracer.getCurrentSpan();

			try {
				System.out.println("doing busy work");
				Thread.sleep(100L);
			}
			catch (InterruptedException e) {
				// 6. Set status upon error
        span.setStatus(Status.INTERNAL.withDescription(e.toString()));
			}

			// 7. Annotate our span to capture metadata about our operation
			Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
			attributes.put("use", AttributeValue.stringAttributeValue("demo"));
			span.addAnnotation("Invoking doWork", attributes);
		}
	}
}
```
{{% /tabs %}}

#### Configure Exporter

OpenCensus can export traces to different distributed tracing stores \(such as Zipkin, Jeager, Stackdriver Trace\). In \(1\), we configure OpenCensus to export to Zipkin, which is listening on `localhost` port `9411`, and all of the traces from this program will be associated with a service name `tracing-to-zipkin-service`.

```java
// 1. Configure exporter to export traces to Zipkin.
ZipkinTraceExporter.createAndRegister(
    "http://localhost:9411/api/v2/spans", "tracing-to-zipkin-service");
```

You can export trace data to different backends. Learn more in [OpenCensus Supported Exporters](/exporters/supported-exporters/).

#### Configure Sampler

Configure 100% sample rate, otherwise, few traces will be sampled.

```java
// 2. Configure 100% sample rate, otherwise, few traces will be sampled.
TraceConfig traceConfig = Tracing.getTraceConfig();
TraceParams activeTraceParams = traceConfig.getActiveTraceParams();
traceConfig.updateActiveTraceParams(
	activeTraceParams.toBuilder().setSampler(
		Samplers.alwaysSample()).build());
```

There are multiple ways to configure how OpenCensus sample traces. Learn more in  [OpenCensus Sampling](/tracing/sampling).

#### Using the Tracer

To start a trace, you first need to get a reference to the `Tracer` \(3\). It can be retrieved as a global singleton.

```java
// 3. Get the global singleton Tracer object.
Tracer tracer = Tracing.getTracer();
```

#### Create a Span

To create a span in a trace, we used the `Tracer` to start a new span \(4\). A span must be closed in order to mark the end of the span. A scoped span \(`Scope`\) implements `AutoCloseable`, so when used within a `try` block in Java 8, the span will be closed automatically when exiting the `try` block.

```java
// 4. Create a scoped span, a scoped span will automatically end when closed.
// It implements AutoClosable, so it'll be closed when the try block ends.
try (Scope scope = tracer.spanBuilder("main").startScopedSpan()) {
	System.out.println("About to do some busy work...");
	for (int i = 0; i < 10; i++) {
		doWork(i);
	}
}
```

#### Create a Child Span

The `main` method calls `doWork` a number of times. Each invocation also generates a child span. Take a look at `doWork`method.

```java
private static void doWork(int i) {
  // 6. Get the global singleton Tracer object.
  Tracer tracer = Tracing.getTracer();

  // 7. Start another span. If antoher span was already started, it'll use that span as the parent span.
  // In this example, the main method already started a span, so that'll be the parent span, and this will be
  // a child span.
  try (Scope scope = tracer.spanBuilder("doWork").startScopedSpan()) {
    // Simulate some work.
    Span span = tracer.getCurrentSpan();

    try {
      System.out.println("doing busy work");
      Thread.sleep(100L);
    }
    catch (InterruptedException e) {
      // 6. Set status upon error
      span.setStatus(Status.INTERNAL.withDescription(e.toString()));
    }

    // 7. Annotate our span to capture metadata about our operation
    Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
    attributes.put("use", AttributeValue.stringAttributeValue("demo"));
    span.addAnnotation("Invoking doWork", attributes);
  }
}
```

#### Shutdown the Tracer

Traces are queued up in memory and flushed to the trace store \(in this case, Zipkin\) periodically, and/or when the buffer is full. In \(5\), we need to make sure that any buffered traces that had yet been sent are flushed for a graceful shutdown.

```java
// 5. Gracefully shutdown the exporter, so that it'll flush queued traces to Zipkin.
Tracing.getExportComponent().shutdown();
```

#### Set the Status of the span
We can set the [status](https://opencensus.io/tracing/span/status/) of our span to create more observability of our traced operations.
```java
// 6. Set status upon error
span.setStatus(Status.INTERNAL.withDescription(e.toString()));
```

#### Create an Annotation
An [annotation](https://opencensus.io/tracing/span/time_events/annotation/) tells a descriptive story in text of an event that occurred during a span’s lifetime.
```java
// 7. Annotate our span to capture metadata about our operation
Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
attributes.put("use", AttributeValue.stringAttributeValue("demo"));
span.addAnnotation("Invoking doWork", attributes);
```


#### References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
Zipkin Java exporter|https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-trace-zipkin
Java exporters|[Java exporters](/guides/exporters/supported-exporters/java)
OpenCensus Java Trace package|https://www.javadoc.io/doc/io.opencensus/opencensus-api/
