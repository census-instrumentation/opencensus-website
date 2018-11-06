---
title: "Dropwizard"
date: 2018-11-05T14:42:17-07:00
draft: false
class: "shadowed-image lightbox"
aliases: [/integrations/dropwizard]
weight: 5
---

- [Background](#background)
- [How it works](#how-it-works)
    - [Prerequisites](#1-prerequisites)
    - [Add the dependencies to your project](#2-add-the-dependencies-to-your-project)
    - [And the following code](#3-and-the-following-code)
    - [Viewing your metrics](#4-viewing-your-metrics)

## Background
Dropwizard Metrics is a popular solution used by Java developers to capture JVM and application-level metrics from their services. In addition to distributed tracing, OpenCensus also captures application-level metrics from Java services, and interoperability between Dropwizard and OpenCensus has been one of our most asked for Java features. 

We have good news: OpenCensus now provides an easy way to export and migrate Dropwizard metrics to OpenCensus, and then on to your backend of choice.

## How it works
We will follow four steps to complete the work.

##### 1. Prerequisites
Assuming, you already have both the OpenCensus and Dropwizard client libraries setup and working inside your application.

##### 2. Add the dependencies to your project
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

##### 3. And the following code

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
    ...
  }

  private static void setupOpenCensusAndPrometheusExporter() throws IOException {
    // Register the Prometheus exporter
    PrometheusStatsCollector.createAndRegister();

    // Run the server as a daemon on address "localhost:8888"
    HTTPServer server = new HTTPServer("localhost", 8888, true);
  }
}
{{</highlight>}}

##### 4. Viewing your metrics
Here are a few sample charts created out of data exported by OpenCensus using Prometheus exporter.

http://localhost:9090
![](/images/prometheus-graph.png)

Go to http://localhost:9090/graph and, start typing “codahale”. Select “codahale_requests_counter”:
![](/images/prometheus-counter-graph.png)
Prometheus “codahale_requests_counter”
![](/images/prometheus-gauge-graph.png)
Prometheus “codahale_get_requests_duration_size_gauge”


