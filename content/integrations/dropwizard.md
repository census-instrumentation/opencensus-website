---
title: "Dropwizard"
date: 2018-11-05T14:42:17-07:00
draft: false
class: "shadowed-image lightbox"
aliases: [/guides/integrations/dropwizard]
weight: 5
---

- [Background](#background)
- [Prerequisite](#prerequisites)
- [Adding dependencies](#adding-dependencies)
- [Enable an exporter](#enable-an-exporter)
- [End to end example](#end-to-end-example)
- [Visuals](#visuals)
- [References](#references)

## Background
Dropwizard Metrics is a popular solution used by Java developers to capture JVM and application-level metrics from their services. In addition to distributed tracing, OpenCensus also captures application-level metrics from Java services, and interoperability between Dropwizard and OpenCensus has been one of our most asked for Java features.

We have good news: OpenCensus now provides an easy way to export and migrate Dropwizard metrics to OpenCensus, and then on to your backend of choice.

## Prerequisites
- Assuming, you already have both the OpenCensus and Dropwizard client libraries setup and working inside your application.

- Prometheus as our choice of metrics backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Prometheus, [Click here](/codelabs/prometheus) for a guided codelab.

You can swap out any other exporter from the [list of Java exporters](/guides/exporters/supported-exporters/java)
{{% /notice %}}

## Adding dependencies
If you’ve got a Maven application, you’ll need to add opencensus-contrib-dropwizard as a dependency.

```xml
<dependencies>
    <dependency>
        <groupId>io.opencensus</groupId>
        <artifactId>opencensus-contrib-dropwizard</artifactId>                  
        <version>0.17.0</version>
    </dependency>
</dependencies>
```

And you can find its latest version [\[here\]](https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-dropwizard).

For Gradle add to your dependencies:
```xml
compile ‘io.opencensus:opencensus-dropwizard:0.17.0’
```

## Enable an exporter
Add the following code snippet to your `<dependencies>...</dependencies>` node in `pom.xml`:

```xml
<dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-exporter-stats-prometheus</artifactId>
    <version>0.17.0</version>
</dependency>

<dependency>
    <groupId>io.prometheus</groupId>
    <artifactId>simpleclient_httpserver</artifactId>
    <version>0.4.0</version>
</dependency>
```
We also need to expose the Prometheus endpoint say on address “localhost:8888” in order for Prometheus to scrape our application. Please add the following to our Java code.

{{<highlight java>}}
private static void setupOpenCensusAndPrometheusExporter() throws IOException {
  // Register the Prometheus exporter
  PrometheusStatsCollector.createAndRegister();

  // Run the server as a daemon on address "localhost:8888"
  HTTPServer server = new HTTPServer("localhost", 8888, true);
}
{{</highlight>}}

## End to end example

{{<highlight java>}}
import java.util.Collections;
import java.io.IOException;
import io.opencensus.exporter.stats.prometheus.PrometheusStatsCollector;
import io.prometheus.client.exporter.HTTPServer;

public class YourClass {
  // Create registry for Dropwizard metrics.
  static final com.codahale.metrics.MetricRegistry
    codahaleRegistry = new com.codahale.metrics.MetricRegistry();

  // Create a Dropwizard counter.
  static final com.codahale.metrics.Counter
     requests = codahaleRegistry.counter("requests");

  public static void main(String[] args) {

    // Increment the requests.
    requests.inc();

    // Hook the Dropwizard registry into the OpenCensus registry
    // via the DropWizardMetrics metric producer.
    io.opencensus.metrics.Metrics.getExportComponent().getMetricProducerManager().add(
          new io.opencensus.contrib.dropwizard.DropWizardMetrics(
            Collections.singletonList(codahaleRegistry)));

    setupOpenCensusAndPrometheusExporter();

    //...Continue with the rest of your application here
  }

  private static void setupOpenCensusAndPrometheusExporter() throws IOException {
    // Register the Prometheus exporter
    PrometheusStatsCollector.createAndRegister();

    // Run the server as a daemon on address "localhost:8888"
    HTTPServer server = new HTTPServer("localhost", 8888, true);
  }
}
{{</highlight>}}

## Visuals
Here are a few sample charts created out of data exported by OpenCensus using Prometheus exporter.

http://localhost:9090
![](/images/prometheus-graph.png)

Go to http://localhost:9090/graph and, start typing “codahale”. Select “codahale_requests_counter”:
![](/images/prometheus-counter-graph.png)
Prometheus “codahale_requests_counter”
![](/images/prometheus-gauge-graph.png)
Prometheus “codahale_get_requests_duration_size_gauge”

## References
Resource|URL
---|---
Dropwizard Project|https://www.dropwizard.io
OpenCensus-Dropwizard on Maven Central|https://mvnrepository.com/artifact/io.opencensus/opencensus-contrib-dropwizard
