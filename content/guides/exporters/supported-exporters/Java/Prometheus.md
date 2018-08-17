---
title: "Prometheus (Stats)"
date: 2018-07-22T14:27:35-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/img/prometheus-logo.png)

{{% notice note %}}
This guide makes use of Prometheus for receiving and visualizing your data. For assistance setting up Prometheus, [Click here](/codelabs/prometheus) for a guided codelab.
{{% /notice %}}

Prometheus is a monitoring system that collects metrics, by scraping
exposed endpoints at regular intervals, evaluating rule expressions.
It can also trigger alerts if certain conditions are met.

OpenCensus Java allows exporting stats to Prometheus by means of the Prometheus package
[io.opencensus.exporter.stats.prometheus](https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-stats-prometheus)

#### Table of contents
- [Creating the exporter](#creating-the-exporter)
- [Running Prometheus](#running-prometheus)
- [Viewing your metrics](#viewing-your-metrics)
- [Project link](#project-link)

##### Creating the exporter
To create the exporter, we'll need to:

* Import and use the Prometheus exporter package
* Define a namespace that will uniquely identify our metrics when viewed on Prometheus
* Expose a port on which we shall run a `/metrics` endpoint
* With the defined port, we'll need a Promethus configuration file so that Prometheus can scrape from this endpoint


#### pom.xml

Add this to your pom.xml file:

```xml
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.15.0</opencensus.version> <!-- The OpenCensus version to use -->
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
        </dependency>
        
        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-stats-prometheus</artifactId>
            <version>${opencensus.version}</version>
        </dependency>
 
        <dependency>
            <groupId>prometheus</groupId>
            <artifactId>simpleclient_httpserver</artifactId>
            <version>0.3.0</version>
        </dependency>
    </dependencies>
```

We also need to expose the Prometheus endpoint say on address "localhost:8888".

{{<highlight java>}}
package io.opencensus.tutorial.prometheus;

import io.opencensus.exporter.stats.prometheus.PrometheusStatsExporter;
import io.prometheus.client.exporter.HTTPServer;

public class PrometheusTutorial {
    public static void main(String ...args) {
        // Register the Prometheus exporter
        PrometheusStatsExporter.createAndRegister();
        
        // Run the server as a daemon on address "localhost:8888"
        HTTPServer server = new HTTPServer("localhost", 8888, true);
    }
}
{{</highlight>}}

and then for our corresponding `prometheus.yaml` file:

```shell
global:
  scrape_interval: 10s

  external_labels:
    monitor: 'demo'

scrape_configs:
  - job_name: 'demo'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8888']
```

##### Running Prometheus
And then run Prometheus with your configuration
```shell
prometheus --config.file=prometheus.yaml
```

##### Viewing your metrics
Please visit [http://localhost:9090](http://localhost:9090)

#### Project link
You can find out more about the Prometheus project at [https://prometheus.io/](https://prometheus.io/)
