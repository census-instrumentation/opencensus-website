---
title: "Spymemcached"
date: 2019-01-15T16:15:40+07:00
draft: false
aliases: [/integrations/memcached/java/spymemcached]
---

![Memcached OpenCensus integration logo](/img/memcached-java.png)

- [Introduction](#introduction)
- [Installing it](#installing-it)
- [Create the client](#create-the-client)
- [Traces](#traces)
- [Stats](#stats)
    - [Enabling stats](#enabling-stats)
    - [Available stats](#available-stats)
- [Tags](#tags)
- [End to end example](#end-to-end-example)
    - [Source code](#source-code)
    - [Running it](#running-it)
- [Examining your traces](#examining-your-traces)
    - [All traces](#all-traces)
    - [Single trace with explanation](#single-trace-with-explanation)
    - [Cache miss](#cache-miss)
    - [Cache hit](#cache-hit)
- [Examining your metrics](#examining-your-metrics)
    - [All metrics](#all-metrics)
    - [Calls](#calls)
    - [Latency](#latency)
    - [Lengths](#lengths)
- [Observability signal names](#observability-signal-names)
- [References](#references)

## Introduction
[Memcached](https://memcached.org) is one of the most used server caching and scaling technologies.

It was created by [Brad Fitzpatrick](https://en.wikipedia.org/wiki/Brad_Fitzpatrick) in 2003 as a
solution to scale his social media product [Live Journal](https://www.livejournal.com/)

[net.spy.memcached](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/internal/package-frame.html) is a popular Java API client for Memcached.
We've created an observability instrumented wrapper using OpenCensus. It provides traces and metrics that
you can then extract from your applications.

## Installing it

{{<tabs Maven Gradle Ivy Buildr>}}
{{<highlight xml>}}
<!-- https://mvnrepository.com/artifact/io.orijtech.integrations/ocspymemcached -->
<dependency>
  <groupId>io.orijtech.integrations</groupId>
  <artifactId>ocspymemcached</artifactId>
  <version>0.0.1</version>
</dependency>
{{</highlight>}}

{{<highlight gradle>}}
// https://mvnrepository.com/artifact/io.orijtech.integrations/ocspymemcached
compile group: 'io.orijtech.integrations', name: 'ocspymemcached', version: '0.0.1'
{{</highlight>}}

{{<highlight xml>}}
<!-- https://mvnrepository.com/artifact/io.orijtech.integrations/ocspymemcached -->
<dependency org="io.orijtech.integrations" name="ocspymemcached" rev="0.0.1"/>
{{</highlight>}}

{{<highlight python>}}
# https://mvnrepository.com/artifact/io.orijtech.integrations/ocspymemcached
'io.orijtech.integrations:ocspymemcached:jar:0.0.1'
{{</highlight>}}

{{</tabs>}}

## Creating the client

To get started, one needs to a create an `OcWrapClient` which wraps [MemcachedClient](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html)

Its constructor matches that of [MemcachedClient](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html)
```java
import io.orijtech.integrations.ocspymemcached.OcWrapClient;
import java.net.InetSocketAddress;

public class MemcachedOpenCensusTutorial {
  public static void main(String[] args) {
    OcWrapClient mc;

    try {
      // Create the wrapped Memcached client.
      mc = new OcWrapClient(new InetSocketAddress("localhost", 11211));
    } catch (Exception e) {
      System.err.println("Failed to create Memcached client: " + e.toString());
      return;
    }
  }
}
```

## Traces
Each method that performs a network request is traced as per [Observability signal names](#observability-signal-names)

Both synchronous and asynchronous methods that make network requests have been instrumented.
Please remember to enable an [OpenCensus Java stats exporter](/exporters/supported-exporters/java/)

## Stats

To enable extraction of stats, please make sure to:

1) Invoke `Observability.registerAllViews`
2) Enable an [OpenCensus Java stats exporter](/exporters/supported-exporters/java/)

### Enabling stats

```java
import io.orijtech.integrations.ocspymemcached.Observability;

public class MemcachedOpenCensusTutorial {
  public static void main(String[] args) {
    // Enable exporting of all the Memcached specific metrics and views.
    Observability.registerAllViews();
  }

  private static void setupOpenCensusExporters() {
    // Enable the stats exporter in here.
  }
}
```

### Available stats
We've compounded stats into the following

View|Search name|Description|Unit|Tags|Aggregation
---|---|---|---|---|---
Latency|"net.spy.memcached/latency"|The latencies of the various methods in milliseconds|ms|"method", "error", "status"|Distribution
Lengths|"net.spy.memcached/length"|The lengths of either keys or values|By|"method", "error", "status"|Distribution
Calls|"net.spy.memcached/calls"|The number of the various method calls|1|"method", "type"|Count

## Tags

Tag|Description|Enumeration of values
---|---|---
method|Any of the qualified names of the spymemcached.MemcachedClient methods|For example "net.spy.memcached.MemcachedClient.shutdown" as per [Observability signal-names](#observability-signal-names)
type|Disambiguates between the various lengths|"KEY", "VALUE"
status|Indicates either success or failure of an operation|"OK", "ERROR"
error|Only set if tag key "status" value is "ERROR"|The error string collected from the operation for example "io.IOException: closed connection"

## End to end example
{{% notice tip %}}
This demo uses the following dependencies, please install them first

Resource|URL
---|---
Memcached|[Memcached Installation wiki](https://github.com/memcached/memcached/wiki/Install)
Prometheus|[Prometheus setup guided codelab](/codelabs/prometheus)
Zipkin|[Zipkin setup guided codelab](/codelabs/zipkin)
{{% /notice %}}

With Memcached now installed and running, we can now start the code sample.

For simplicitly examining metrics, we'll use Prometheus for examining our stats and Zipkin to examine our traces.

Please place the Java source code in the following file `src/main/java/io/opencensus/tutorials/ocspymemcached/MemcachedOpenCensusTutorial.java` in your current working directory. You can do this for example by:
```shell
mkdir -p src/main/java/io/opencensus/tutorials/ocspymemcached
touch src/main/java/io/opencensus/tutorials/ocspymemcached/MemcachedOpenCensusTutorial.java
```

and then the `pom.xml` file too

### Source code

{{<tabs Code Pom>}}
{{<highlight java>}}
// Please place this code sample in your current working directory in this file:
//   src/main/java/io/opencensus/tutorials/ocspymemcached/MemcachedOpenCensusTutorial.java
package io.opencensus.tutorials.ocspymemcached;

import io.opencensus.common.Scope;
import io.opencensus.exporter.stats.prometheus.PrometheusStatsCollector;
import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import io.orijtech.integrations.ocspymemcached.Observability;
import io.orijtech.integrations.ocspymemcached.OcWrapClient;
import io.prometheus.client.exporter.HTTPServer;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import net.spy.memcached.internal.GetFuture;
import net.spy.memcached.internal.OperationFuture;

public class MemcachedOpenCensusTutorial {
  public static void main(String[] args) {
    OcWrapClient mc;

    try {
      // Create the wrapped Memcached client.
      mc = new OcWrapClient(new InetSocketAddress("localhost", 11211));
    } catch (Exception e) {
      System.err.println("Failed to create Memcached client: " + e.toString());
      return;
    }

    // Enable exporting of all the Memcached specific metrics and views.
    Observability.registerAllViews();

    // Now enable OpenCensus exporters.
    setupOpenCensusExporters();

    // Create the tracer that we'll use to create custom spans.
    Tracer tracer = Tracing.getTracer();

    // Then prepare the source for queries i.e. standard input.
    BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

    while (true) {
      String query = "";

      try {
        // Print out the prompt.
        System.out.print("> ");
        System.out.flush();

        // Read the input.
        query = stdin.readLine();
      } catch (Exception e) {
        System.err.println("Exception " + e);
        return;
      }

      if (query.length() == 0) query = "*";

      // Create our custom span that will be the parent of all the child
      // spans from the instrumentation inside the Memcached client wrapper.
      // This span is optional but is useful to group and examine the flow
      // of requests.
      Scope ss = tracer.spanBuilder("MemcachedOpenCensusTutorial").startScopedSpan();

      System.out.println(query);

      try {
        // Perform an asynchronous Get to get back a Future.
        GetFuture<Object> getRes = mc.asyncGet(query);

        // You can perform some work here on the main thread,
        // since the asyncGet is run asynchronously/in-the-background.

        String result = "";

        // Now attempt to get the result from the Future.
        try {
          result = (String) getRes.get();
        } catch (Exception e) {
          System.err.println("Result.Get exception: " + e);
        }

        Boolean cacheHit = result != null && result != "";

        if (cacheHit) {
          System.out.println("Cache hit!");
        } else {
          // Cache miss, so process the data and then
          // memoize it for later cache hits.
          System.out.println("Cache miss");

          // Performing some "expensive" processing here.
          // This could be something more sophisticated
          // like searching for media, emails, reservations etc.
          result = query.toUpperCase();

          // Process it in the background so that
          // we that we don't block on our critical path.
          mc.set(query, 3600, result);
        }

        System.out.println("< " + result + "\n");

        if (cacheHit && System.nanoTime() % 2 == 1) {
          OperationFuture<Boolean> deleteFuture = mc.delete(query);

          // In this case we have to wait for the deletion to complete.
          // We can otherwise take out the waiting code.
          try {
            Boolean success = deleteFuture.get();
            if (success) System.out.println("Successfully performed delete!");
            else System.err.println("Failed to perform delete!");

          } catch (Exception e) {
            System.err.println("Deletion failed with exception: " + e);
          }
        }
      } finally {
        // End our custom span.
        ss.close();
      }
    }
  }

  private static void setupOpenCensusExporters() {
    // Firstly, change the sampling rate to always sample so
    // that our demo can always produce trace spans.
    // This rate is very high, please lower it in production apps!
    TraceConfig traceConfig = Tracing.getTraceConfig();
    traceConfig.updateActiveTraceParams(
        traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

    try {
      // Create the Zipkin Trace exporter.
      ZipkinTraceExporter.createAndRegister(
          "http://localhost:9411/api/v2/spans", "spymemcached-opencensus");

      // Create the Prometheus stats scrape endpoint.
      PrometheusStatsCollector.createAndRegister();
      // Run the server as a daemon on address "localhost:8888"
      HTTPServer server = new HTTPServer("localhost", 8888, true);
    } catch (Exception e) {
      System.err.println("Failed to setup OpenCensus Exporters " + e);
    }
  }
}
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus.tutorials</groupId>
    <artifactId>ocspymemcached</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>ocspymemcached</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.18.0</opencensus.version>
        <ocspymemcached.version>0.0.2</ocspymemcached.version>
        <prometheus.server.version>0.3.0</prometheus.server.version> 
        <maven.plugin.version>1.5.0.Final</maven.plugin.version>
        <java.source.version>1.8</java.source.version>
        <maven.compiler.version>3.7.0</maven.compiler.version>
        <codehaus.version>1.10</codehaus.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.orijtech.integrations</groupId>
            <artifactId>ocspymemcached</artifactId>
            <version>${ocspymemcached.version}</version>
        </dependency>

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
            <artifactId>opencensus-exporter-trace-zipkin</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-stats-prometheus</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.prometheus</groupId>
            <artifactId>simpleclient_httpserver</artifactId>
            <version>${prometheus.server.version}</version>
        </dependency>
    </dependencies>

    <build>
        <extensions>
            <extension>
                <groupId>kr.motd.maven</groupId>
                <artifactId>os-maven-plugin</artifactId>
                <version>${maven.plugin.version}</version>
            </extension>
        </extensions>

        <pluginManagement>
          <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>${maven.compiler.version}</version>
                <configuration>
                    <source>${java.source.version}</source>
                    <target>${java.source.version}</target>
                </configuration>
            </plugin>
          </plugins>
        </pluginManagement>

        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>appassembler-maven-plugin</artifactId>
                <version>${codehaus.version}</version>
                <configuration>
                    <programs>
                        <program>
                            <id>MemcachedOpenCensus</id>
                            <mainClass>io.opencensus.tutorials.ocspymemcached.MemcachedOpenCensusTutorial</mainClass>
                        </program>
                    </programs>
                </configuration>
            </plugin>

        </plugins>
    </build>

</project>
{{</highlight>}}
{{</tabs>}}

### Running it

With Memcached running, your `pom.xml` file and Java source code placed in `src/main/java/io/opencensus/tutorials/ocspymemcached/MemcachedOpenCensusTutorial.java` relative to the same directory that `pom.xml` exists

```shell
mvn install && mvn exec:java -Dexec.mainClass=io.opencensus.tutorials.ocspymemcached.MemcachedOpenCensusTutorial
```

and this should then produce a prompt which requires input. On typing and hitting "Enter", it should look like this:
```shell
> searched.
Cache miss
< SEARCHED.

> Two
Cache miss
< TWO

> attempts
Cache hit!
< ATTEMPTS

Successfully performed delete!
> of
Cache hit!
< OF

> the
Cache hit!
< THE

Successfully performed delete!
> sort
Cache miss
< SORT

```

## Examining your traces

Navigate to the Zipkin UI at http://localhost:9411/zipkin and you should see something like

* All traces
![All traces](/img/ocspymemcached-trace-all.png)

* Single trace with explanation
![Single trace](/img/ocspymemcached-trace-single.png)

* Cache miss
![Cache miss](/img/ocspymemcached-trace-single-cache-miss.png)

* Cache hit
![Cache hit](/img/ocspymemcached-trace-single-cache-hit.png)

## Examining your metrics

Firstly we need to start Prometheus. To do this we need a `prom.yaml` file in the current working directory
```yaml
scrape_configs:
  - job_name: 'ocspymemcachedtutorial'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8888']
```

With that file saved as `prom.yaml`, let's now start Prometheus
```shell
prometheus --config.file=prom.yaml
```

and then navigate to the Prometheus UI at http://localhost:9090/graph and you should see something like

* All metrics

![All metrics](/img/ocspymemcached-metrics-all.png)

* Calls
![Calls](/img/ocspymemcached-metrics-calls.png)

* Latency

p95th latency graph by
```shell
histogram_quantile(0.95,
    sum(rate(net_spy_memcached_latency_bucket[5m])) by (method, status, error, le))
```

![p95th latency](/img/ocspymemcached-metrics-latency.png)

* Lengths
![Lengths graph](/img/ocspymemcached-metrics-length.png)

## Observability signal names
Methods that make network calls have been traced and are the following.

Span name and stats method|Java method signature
---|---
"net.spy.memcached.MemcachedClient.add"|[OperationFuture<Boolean> add(String, int, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#add(java.lang.String,%20int,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.add"|[<T> OperationFuture<Boolean> add(String, int, T, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#addObserver(net.spy.memcached.ConnectionObserver))
"net.spy.memcached.MemcachedClient.addObserver"|[boolean addObserver(ConnectionObserver)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#append(long,%20java.lang.String,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.append"|[OperationFuture<Boolean> append(long, String, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#append(long,%20java.lang.String,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.append"|[<T> OperationFuture<Boolean> append(long, String, T, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#append(long,%20java.lang.String,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.asyncCAS"|[<T> OperationFuture<CASResponse> asyncCAS](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncCAS(java.lang.String,%20long,%20int,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.asyncCAS"|[OperationFuture<CASResponse> asyncCAS(String, long, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncCAS(java.lang.String,%20long,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.asyncCAS"|[<T> OperationFuture<CASResponse> asyncCAS](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncCAS(java.lang.String,%20long,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.asyncDecr"|[OperationFuture<Long> asyncDecr(String, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncDecr(java.lang.String,%20int))
"net.spy.memcached.MemcachedClient.asyncGet"|[GetFuture<Object> asyncGet(String)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncGet(java.lang.String))
"net.spy.memcached.MemcachedClient.asyncGet"|[<T> GetFuture<T> asyncGet(String, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncGet(java.lang.String,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.asyncGetBulk"|[BulkFuture<Map<String, Object>> asyncGetBulk(Collection<String>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncGetBulk(java.util.Collection))
"net.spy.memcached.MemcachedClient.asyncGetBulk"|[<T> BulkFuture<Map<String, T>> asyncGetBulk(Collection<String>, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncGetBulk(java.util.Collection,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.asyncGetBulk"|[BulkFuture<Map<String, Object>> asyncGetBulk(String...)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncGetBulk(java.lang.String...))
"net.spy.memcached.MemcachedClient.asyncGetBulk"|[<T> BulkFuture<Map<String, T>> asyncGetBulk(Transcoder<T>, String...)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncGetBulk(net.spy.memcached.transcoders.Transcoder,%20java.lang.String...))
"net.spy.memcached.MemcachedClient.asyncGets"|[OperationFuture<CASValue<Object>> asyncGets(String)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncGets(java.lang.String))
"net.spy.memcached.MemcachedClient.asyncIncr"|[OperationFuture<Long> asyncIncr(String, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#asyncIncr(java.lang.String,%20int))
"net.spy.memcached.MemcachedClient.cas"|[CASResponse cas(String, long, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#cas(java.lang.String,%20long,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.cas"|[CASResponse cas(String, long, int, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#cas(java.lang.String,%20int,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.cas"|[<T> CASResponse cas(String, long, int, T, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#cas(java.lang.String,%20long,%20int,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.cas"|[<T> CASResponse cas(String, long, T, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#cas(java.lang.String,%20long,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.decr"|[long decr(String, long)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#decr(java.lang.String,%20long))
"net.spy.memcached.MemcachedClient.decr"|[long decr(String, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#decr(java.lang.String,%20int))
"net.spy.memcached.MemcachedClient.decr"|[long decr(String, int, long, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#decr(java.lang.String,%20int,%20long,%20int))
"net.spy.memcached.MemcachedClient.decr"|[long decr(String, long, long, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#decr(java.lang.String,%20long,%20long,%20int))
"net.spy.memcached.MemcachedClient.delete"|[OperationFuture<Boolean> delete(String)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#delete(java.lang.String))
"net.spy.memcached.MemcachedClient.flush"|[OperationFuture<Boolean> flush()](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#flush())
"net.spy.memcached.MemcachedClient.flush"|[OperationFuture<Boolean> flush(int delay)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#flush(int))
"net.spy.memcached.MemcachedClient.getAndTouch"|CASValue<Object> getAndTouch(String, int)
"net.spy.memcached.MemcachedClient.getBulk"|[Map<String, Object> getBulk(Iterator<String>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#getBulk(java.util.Iterator))
"net.spy.memcached.MemcachedClient.getBulk"|[Map<String, Object> getBulk(Collection<String>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#getBulk(java.util.Collection))
"net.spy.memcached.MemcachedClient.getBulk"|[<T> Map<String, T> getBulk(Transcoder<T> tc, String...)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#getBulk(net.spy.memcached.transcoders.Transcoder,%20java.lang.String...))
"net.spy.memcached.MemcachedClient.getBulk"|[Map<String, Object> getBulk(String...)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#getBulk(java.lang.String...))
"net.spy.memcached.MemcachedClient.getStats"|[Map<SocketAddress, Map<String, String>> getStats()](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#getStats())
"net.spy.memcached.MemcachedClient.getStats"|[Map<SocketAddress, Map<String, String>> getStats(String)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#getStats(java.lang.String))
"net.spy.memcached.MemcachedClient.getVersions"|[Map<SocketAddress, String> getVersions()](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#getVersions())
"net.spy.memcached.MemcachedClient.get"|[<T> T get(String, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#get(java.lang.String,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.get"|[Object get(String)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#get(java.lang.String))
"net.spy.memcached.MemcachedClient.gets"|[CASValue<Object> gets(String)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#gets(java.lang.String))
"net.spy.memcached.MemcachedClient.gets"|[<T> CASValue<T> gets(String key, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#gets(java.lang.String,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.incr"|[long incr(String, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#incr(java.lang.String,%20int))
"net.spy.memcached.MemcachedClient.incr"|[long incr(String, long)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#incr(java.lang.String,%20long))
"net.spy.memcached.MemcachedClient.incr"|[long incr(String, int, long)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#incr(java.lang.String,%20int,%20long))
"net.spy.memcached.MemcachedClient.incr"|[long incr(String, int, long, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#incr(java.lang.String,%20int,%20long,%20int))
"net.spy.memcached.MemcachedClient.incr"|[long incr(String, long, long, int)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#incr(java.lang.String,%20long,%20long,%20int))
"net.spy.memcached.MemcachedClient.listSaslMechanisms"|Set<String> listSaslMechanisms()
"net.spy.memcached.MemcachedClient.prepend"|[OperationFuture<Boolean> prepend(long, String, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#prepend(long,%20java.lang.String,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.prepend"|[<T> OperationFuture<Boolean> prepend(long, String, T, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#prepend(long,%20java.lang.String,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.replace"|[OperationFuture<Boolean> replace(String, int, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#replace(java.lang.String,%20int,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.replace"|[<T> OperationFuture<Boolean> replace(String, int, T, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#replace(java.lang.String,%20int,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.set"|[OperationFuture<Boolean> set(String, int, Object)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#set(java.lang.String,%20int,%20java.lang.Object))
"net.spy.memcached.MemcachedClient.set"|[<T> OperationFuture<Boolean> set(String, int, T, Transcoder<T>)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#set(java.lang.String,%20int,%20T,%20net.spy.memcached.transcoders.Transcoder))
"net.spy.memcached.MemcachedClient.shutdown"|[void shutdown()](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#shutdown())
"net.spy.memcached.MemcachedClient.shutdown"|[boolean shutdown(long timeout, TimeUnit unit)](http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/MemcachedClient.html#shutdown(long,%20java.util.concurrent.TimeUnit))


## References

Resource|URL
---|---
ocspymemcached on Maven Central|https://mvnrepository.com/artifact/io.orijtech.integrations/ocspymemcached
ocspymemcached source code on Github|https://github.com/opencensus-integrations/ocspymemcached
Memcached project|https://memcached.org
SpyMemcached JavaDoc|http://dustin.sallings.org/java-memcached-client/apidocs/net/spy/memcached/internal/package-frame.html
SpyMemcached project on Github|https://github.com/couchbase/spymemcached
OpenCensus Java exporters|[Java exporters](/exporters/supported-exporters/java/)
