---
title: "Metrics exporter"
draft: false
weight: 3
aliases: [/custom_exporter/java/stats, /guides/custom_exporter/java/stats]
---

- [Introduction](#introduction)
- [Implementation](#implementation)
- [Runnable example](#runnable-example)
- [References](#references)

## Introduction

A metrics exporter must extend the abstract class [MetricExporter](https://static.javadoc.io/io.opencensus/opencensus-exporter-metrics-util/0.19.2/io/opencensus/exporter/metrics/util/MetricExporter.html) implementing the `export` method:
which for purposes of brevity is:

```java
import java.util.Collection;

import io.opencensus.exporter.metrics.util.MetricExporter;

public void export(Collection<Metric> metrics);
```

The sole method `export` will be used to process and translate a collection of [Metric](https://static.javadoc.io/io.opencensus/opencensus-api/0.19.2/io/opencensus/metrics/export/Metric.html) to your desired monitoring backend's data.

## Implementation
The [Metric](https://static.javadoc.io/io.opencensus/opencensus-api/0.19.2/io/opencensus/metrics/export/Metric.html) class contains a [MetricDescriptor](https://static.javadoc.io/io.opencensus/opencensus-api/0.19.2/io/opencensus/metrics/export/MetricDescriptor.html), which describes the type of metric and also contains a name, description, and units. `Metric` also includes a list of [TimeSeries](https://static.javadoc.io/io.opencensus/opencensus-api/0.19.2/io/opencensus/metrics/export/TimeSeries.html) objects that contain the metric data.

In this example, the metrics will be written to the log, which will send output to the console when running from the command line

```java
StringBuffer sb = new StringBuffer();
for (Point p : ts.getPoints()) {
  Timestamp t = p.getTimestamp();
  long s = t.getSeconds();
  long nanos = t.getNanos();
  String line = s + "\t" + nanos + "\t" + p.getValue();
  sb.append(line);
}
logger.info("Timeseries to export:\n" + sb);
```

The [IntervalMetricReader](https://static.javadoc.io/io.opencensus/opencensus-exporter-metrics-util/0.19.2/io/opencensus/exporter/metrics/util/IntervalMetricReader.html) class conveniently provides a service that runs in the background and writes out the metric values that have been received during the collection interval. It may be useful to keep a reference to it to shutdown the background thread gracefully.

## Runnable example

Following the previous description, here is a ful runnable example, that we'll run using Maven. Create the Java class in the file `src/main/java/io/opencensus/examples/exporter/stats/ExampleStatsExporter.java`.

{{<tabs Java_Code pom_xml>}}
{{<highlight java>}}
package io.opencensus.examples.exporter.stats;

import io.opencensus.common.Timestamp;
import io.opencensus.exporter.metrics.util.IntervalMetricReader;
import io.opencensus.exporter.metrics.util.MetricExporter;
import io.opencensus.exporter.metrics.util.MetricReader;
import io.opencensus.metrics.LabelKey;
import io.opencensus.metrics.LabelValue;
import io.opencensus.metrics.Metrics;
import io.opencensus.metrics.export.Metric;
import io.opencensus.metrics.export.MetricDescriptor;
import io.opencensus.metrics.export.Point;
import io.opencensus.metrics.export.TimeSeries;
import io.opencensus.stats.Aggregation;
import io.opencensus.stats.Aggregation.Distribution;
import io.opencensus.stats.BucketBoundaries;
import io.opencensus.stats.Measure.MeasureLong;
import io.opencensus.stats.Stats;
import io.opencensus.stats.StatsRecorder;
import io.opencensus.stats.View;
import io.opencensus.stats.View.Name;
import io.opencensus.stats.ViewManager;
import io.opencensus.tags.TagKey;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Random;
import java.util.logging.Logger;

/**                                                                                                                                         
 * Example OpenCensus Stats Exporter.
 */
public final class ExampleStatsExporter extends MetricExporter {
  private static final String EXAMPLE_STATS_EXPORTER = "ExampleStatsExporter";
  private static final Logger logger = Logger.getLogger(ExampleStatsExporter.class.getName());
  private static final MeasureLong M_LATENCY_MS =
      MeasureLong.create("example/latency", "A measure to test the exporter", "ms");
  private static final StatsRecorder statsRecorder = Stats.getStatsRecorder();
  private final IntervalMetricReader intervalMetricReader;

  /** Entry point from the command line to test the exporter. */
  public static void main(String... args) {
    ExampleStatsExporter exporter = ExampleStatsExporter.createAndRegister();
    registerAllViews();
    // Collect some data to test the exporter
    Random rand = new Random();
    try {
      for (int i = 0; i < 100; i++) {
        long latency = rand.nextInt(20); // A random value to test the exporter
        statsRecorder.newMeasureMap().put(M_LATENCY_MS, latency).record();
        Thread.sleep(latency);
      }
      exporter.stop();
    } catch (InterruptedException e) {
      logger.info("Got an error: " + e.getMessage());
    }
  }

  /** Creates and registers the ExampleStatsExporter. */
  public static ExampleStatsExporter createAndRegister() {
    return new ExampleStatsExporter();
  }

  private ExampleStatsExporter() {
    IntervalMetricReader.Options.Builder options = IntervalMetricReader.Options.builder();
    MetricReader reader =
        MetricReader.create(
            MetricReader.Options.builder()
                .setMetricProducerManager(Metrics.getExportComponent().getMetricProducerManager())
                .setSpanName(EXAMPLE_STATS_EXPORTER)
                .build());
    intervalMetricReader = IntervalMetricReader.create(this, reader, options.build());
  }

  /**
   * Exports the list of given {@link Metric} objects.
   *
   * @param metrics the list of {@link Metric} to be exported.
   */
  @Override
  public void export(Collection<Metric> metrics) {
    logger.info("Exporting  metrics");
    for (Metric metric : metrics) {
      MetricDescriptor md = metric.getMetricDescriptor();
      MetricDescriptor.Type type = md.getType();
      logger.info("Name: " + md.getName() + ", type: " + type);
      List<LabelKey> keys = md.getLabelKeys();
      StringBuffer keysSb = new StringBuffer("Keys: ");
        for (LabelKey k : keys) {
        keysSb.append(k.getKey() + " ");
      }
      logger.info("Keys: " + keysSb);
      StringBuffer sb = new StringBuffer();
      sb.append("Seconds\tNanos\tValue\n");
      List<TimeSeries> tss = metric.getTimeSeriesList();
      for (TimeSeries ts : tss) {
        Timestamp start = ts.getStartTimestamp();
        logger.info("Start " + start + "\n");
        List<LabelValue> lvs = ts.getLabelValues();
        StringBuffer lvSb = new StringBuffer("Keys: ");
        for (LabelValue v : lvs) {
          lvSb.append(v.getValue() + " ");
        }
        logger.info("Label values: " + lvSb + "\n");
        for (Point p : ts.getPoints()) {
          Timestamp t = p.getTimestamp();
          long s = t.getSeconds();
          long nanos = t.getNanos();
          String line = s + "\t" + nanos + "\t" + p.getValue();
          sb.append(line);
        }
        logger.info("Timeseries to export:\n" + sb);
      }
    }
  }

  private static void registerAllViews() {
    // Defining the distribution aggregations
    Aggregation latencyDistribution =
        Distribution.create(BucketBoundaries.create(Arrays.asList(0.0, 5.0, 10.0, 15.0, 20.0)));

    // Define the views
    List<TagKey> noKeys = new ArrayList<TagKey>();
    View[] views =
    new View[] {
          View.create(
              Name.create("ocjavaexporter/latency"),
              "The distribution of latencies",
              M_LATENCY_MS,
              latencyDistribution,
              noKeys)
        };

    // Create the view manager
    ViewManager vmgr = Stats.getViewManager();

    // Then finally register the views
    for (View view : views) {
      vmgr.registerView(view);
    }
  }
  
  public void stop() {
    intervalMetricReader.stop();
  }
}
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>io.opencensus</groupId>
  <artifactId>exporter-stats-example</artifactId>
  <packaging>jar</packaging>
  <version>1.0-SNAPSHOT</version>
  <name>quickstart</name>
  <url>http://maven.apache.org</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <opencensus.version>0.19.2</opencensus.version> <!-- The OpenCensus version to use -->
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
      <artifactId>opencensus-exporter-metrics-util</artifactId>
      <version>${opencensus.version}</version>
    </dependency>
  
  </dependencies>
  <build>
    <extensions>
      <extension>
        <groupId>kr.motd.maven</groupId>
        <artifactId>os-maven-plugin</artifactId>
        <version>1.5.0.Final</version>
      </extension>
    </extensions>

    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.apache.maven.plugins</groupId>
          <artifactId>maven-compiler-plugin</artifactId>
          <version>3.7.0</version>
          <configuration>
            <source>1.8</source>
            <target>1.8</target>
          </configuration>
        </plugin>
        <plugin>
          <groupId>org.codehaus.mojo</groupId>
          <artifactId>appassembler-maven-plugin</artifactId>
          <version>1.10</version>
          <configuration>
            <programs>
              <program>
                <id>ExampleStatsExporter</id>
                <mainClass>io.opencensus.examples.exporter.stats.ExampleStatsExporter</mainClass>
              </program>
            </programs>
          </configuration>
        </plugin>
      </plugins>

    </pluginManagement>

  </build>
</project>
{{</highlight>}}
{{</tabs>}}

Run the example with the command and observe the exported metrics output to the console
```shell
mvn install
mvn exec:java -Dexec.mainClass=io.opencensus.examples.exporter.stats.ExampleStatsExporter
...
INFO: Timeseries to export:
Seconds Nanos   Value
1550971415      491000000       ValueDistribution{value=Distribution{count=100, sum=865.0, sumOfSquaredDeviations=3068.7500000000005, bucketOptions=ExplicitOptions{bucketBoundaries=[5.0, 10.0, 15.0, 20.0]}, buckets=[Bucket{count=25, exemplar=null}, Bucket{count=33, exemplar=null}, Bucket{count=24, exemplar=null}, Bucket{count=18, exemplar=null}, Bucket{count=0, exemplar=null}]}}
```

## References

Name|Link
---|---
Exporter Utilities JavaDoc |[io.opencensus.exporter.metrics.util.*](https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-metrics-util)
OpenCensus JavaDoc|[io.opencensus.*](https://www.javadoc.io/doc/io.opencensus/opencensus-api/)
OpenCensus Java exporters|[Some OpenCensus Java exporters](/supported-exporters/java/)
