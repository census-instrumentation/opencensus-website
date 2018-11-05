---
title: "Stackdriver (Tracing)"
date: 2018-07-21T14:27:35-07:00
draft: false
class: "shadowed-image lightbox"
aliases: [/guides/exporters/supported-exporters/java/stackdriver-trace]
logo: /images/logo_gcp_vertical_rgb.png
---

- [Introduction](#introduction)
- [Creating the exporters](#creating-the-exporters)
    - [Import Packages](#creating-the-exporters)
    - [Basic Example](#creating-the-exporters)
- [Viewing your traces](#viewing-your-traces)
- [References](#references)

## Introduction
Stackdriver Trace is a distributed tracing system that collects latency data from your applications and displays it in the Google Cloud Platform Console.

You can track how requests propagate through your application and receive detailed near real-time performance insights.
Stackdriver Trace automatically analyzes all of your application's traces to generate in-depth latency reports to surface performance degradations, and can capture traces from all of your VMs, containers, or Google App Engine projects.

OpenCensus Java has support for this exporter available through packages:
* Exporters/Trace [io.opencensus.exporter.trace.stackdriver](https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-trace-stackdriver)

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

## Creating the exporters
To create the exporters, you'll need to:

* Have a GCP Project ID
* Have already enabled Stackdriver Tracing, if not, please visit the [Code lab](/codelabs/stackdriver)
* Use Maven setup your pom.xml file
* Create the exporters in code

Using OpenCensus for tracing involves three general steps:

* Importing the OpenCensus trace and OpenCensus Stackdriver exporter packages.
* Initializing the Stackdriver exporter.
* Using the OpenCensus API to instrument your code.

#### A basic example

Following is a minimal program that illustrates these steps.

{{<tabs Example Import>}}
{{<highlight java>}}
package io.opencensus.tutorial.stackdriver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import io.opencensus.common.Scope;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
import io.opencensus.trace.AttributeValue;
import io.opencensus.trace.Span;
import io.opencensus.trace.Status;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;

public class Repl {
  private static final Tracer tracer = Tracing.getTracer();

  public static void main(String ...args) {
    try {
      setupOpenCensusAndStackdriverExporter();
    } catch (IOException e) {
      System.err.println("Failed to create and register OpenCensus Stackdriver Trace exporter "+ e);
      return;
    }

    // Step 2. The normal REPL.
    BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

    while (true) {
      try {
        readEvaluateProcessLine(stdin);
      } catch (IOException e) {
        System.err.println("Exception "+ e);
      }
    }
  }

  private static String processLine(String line) {
    try (Scope ss = tracer.spanBuilder("processLine").startScopedSpan()) {
      return line.toUpperCase();
    }
  }

  private static String readLine(BufferedReader in) {
    Scope ss = tracer.spanBuilder("readLine").startScopedSpan();

    String line = "";

    try {
      line = in.readLine();
    } catch (Exception e) {
      Span span = tracer.getCurrentSpan();
      span.setStatus(Status.INTERNAL.withDescription(e.toString()));
    } finally {
      ss.close();
      return line;
    }
  }

  private static void readEvaluateProcessLine(BufferedReader in) throws IOException {
    try (Scope ss = tracer.spanBuilder("repl").startScopedSpan()) {
      System.out.print("> ");
      System.out.flush();
      String line = readLine(in);

      // Annotate the span to indicate we are invoking processLine next.
      Map<String, AttributeValue> attributes = new HashMap<String, AttributeValue>();
      attributes.put("len", AttributeValue.longAttributeValue(line.length()));
      attributes.put("use", AttributeValue.stringAttributeValue("repl"));
      Span span = tracer.getCurrentSpan();
      span.addAnnotation("Invoking processLine", attributes);

      String processed = processLine(line);
      System.out.println("< " + processed + "\n");
    }
  }

  private static void setupOpenCensusAndStackdriverExporter() throws IOException {
    String gcpProjectId = envOrAlternative("GCP_PROJECT_ID");

    StackdriverTraceExporter.createAndRegister(
      StackdriverTraceConfiguration.builder()
        .setProjectId(gcpProjectId)
        .build());
  }

  private static String envOrAlternative(String key, String ...alternatives) {
    String value = System.getenv().get(key);
    if (value != null && value != "")
      return value;

    // Otherwise now look for the alternatives.
    for (String alternative : alternatives) {
      if (alternative != null && alternative != "") {
        value = alternative;
        break;
      }
    }

    return value;
  }
}
{{</highlight>}}

{{<highlight xml>}}
Insert the following snippet in your `pom.xml`:
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.16.0</opencensus.version> <!-- The OpenCensus version to use -->
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-api</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-impl</artifactId>
            <version>${opencensus.version}</version>
            <scope>runtime</scope>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
            <version>${opencensus.version}</version>
        </dependency>
    </dependencies>
{{</highlight>}}
{{</tabs>}}


## Viewing your traces
With the above you should now be able to navigate to the Stackdriver UI at https://console.cloud.google.com/traces/traces

which will produce such a screenshot:
![](/images/trace-java-stackdriver.png)

## References

Resource|URL
---|---
Setting up Stackdriver|[Stackdriver Codelab](/codelabs/stackdriver)
Stackdriver Java exporter|https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-trace-stackdriver
OpenCensus Java Trace package|https://www.javadoc.io/doc/io.opencensus/opencensus-api/
