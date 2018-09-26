---
title: "Java"
date: 2018-09-25T00:25:42-07:00
draft: false
aliases: [/integrations/sql/java]
logo: /img/sql-java.png
---

- [Introduction](#Introduction)
- [Installing it](#installing-it)
- [Using it](#using-it)
- [Enabling OpenCensus](#enabling-opencensus)
- [End to end example](#end-to-end-example)
    - [Source code](#source-code)
    - [Running it](#running-it)
- [Examining the traces](#examining-the-traces)
- [Examining the metrics](#examining-the-metrics)
- [References](#references)

## Introduction
The Java Database Connectivity(JDBC) API provides universal data access from the Java programming language as
documented at https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/

Using OpenCensus, we've combined the best of both worlds: observability with distributed tracing and metrics
to empower Java developers that use any sort of a database/data source with a JDBC driver.

ocjdbc is a type-4 JDBC wrapper for the Java language. We've instrumented it with OpenCensus to provide
observability with tracing and metrics. It works by wrapping your already obtained JDBC Connection using
the class `ocjdbc.Connection`. It wraps any JDBC driver. It is hosted on our integrations page on
Github at https://github.com/opencensus-integrations/ocjdbc
but also distributed as a Maven artifact as you'll shortly see below.

## Installing it
Using Apache Maven, please add the following to your pom.xml file

```xml
<dependency>
    <groupId>io.opencensus.integraion</groupId>
    <artifactId>opencensus-ocjdbc</artifactId>
    <version>0.0.2</version>
</dependency>
```

## Using it
Using it simply requires you to just wrap your already created JDBC connection and it wraps every method
to provide observability by metrics and tracing. For example
```java
import io.opencensus.integration.ocjdbc.Connection;
import io.opencensus.integration.ocjdbc.Observability;

public static void main(String ...args) {
    // Load and use the MySQL Connector/J driver.
    Class.forName("com.mysql.cj.jdbc.Driver").newInstance();

    java.sql.Connection originalConn = java.sql.DriverManager.getConnection("jdbc:mysql://localhost/test?useSSL=false&serverTimezone=UTC");

    // Then create/wrap it with the instrumented Connection from "io.opencensus.integration.ocjdbc".
    java.sql.Connection conn = new Connection(originalConn);

    // Use conn like you would normally below as per your original program
}

// Enabling observability by subscribing to the views
// and then creating the exporters is necessary too.
public static void enableObservability() {
    // Enable metrics with OpenCensus.
    Observability.registerAllViews();

    // Then create the trace and metrics exporters here
}
```

## Enabling OpenCensus
To enable observability with OpenCensus, you need to have enabled trace and metrics exporters e.g.
```java
import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;
import io.opencensus.exporter.stats.prometheus.PrometheusStatsCollector;
import io.prometheus.client.exporter.HTTPServer;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.common.Scope;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;

public static void enableObservability() throws Exception {
    // Enable metrics with OpenCensus.
    Observability.registerAllViews();

    TraceConfig traceConfig = Tracing.getTraceConfig();
    // For demo purposes, lets always sample.
    traceConfig.updateActiveTraceParams(
            traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

    // The trace exporter.
    ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "ocjdbc-demo");

    // The metrics exporter.
    PrometheusStatsCollector.createAndRegister();

    // Run the server as a daeon on address "localhost:8889".
    HTTPServer server = new HTTPServer("localhost", 8889);
}
```

## End to end example
In this example, we'll just wrap a MySQL Connector/J app as below. Please place the file in `src/main/java/io/opencensus/tutorial/ocjdbc/App.java`. It uses exporters:

* Zipkin for trace exporting
* Prometheus for stats exporting
* MySQL server -- please have one running locally or take a look at https://dev.mysql.com/doc/mysql-getting-started/en/

### Source code

{{% tabs App_java pom_xml %}}
{{<highlight java>}}
// Please place the file in: src/main/java/io/opencensus/tutorial/ocjdbc/App.java
package io.opencensus.tutorial.ocjdbc;

import io.opencensus.integration.ocjdbc.Connection;
import io.opencensus.integration.ocjdbc.Observability;

import io.opencensus.exporter.trace.zipkin.ZipkinTraceExporter;
import io.opencensus.exporter.stats.prometheus.PrometheusStatsCollector;
import io.prometheus.client.exporter.HTTPServer;
import io.opencensus.trace.samplers.Samplers;
import io.opencensus.common.Scope;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;

public class App {
    private static final Tracer tracer = Tracing.getTracer();

    public static void main(String ...args) {
        try {
            enableObservability();

            // Load and use the MySQL Connector/J driver.
            Class.forName("com.mysql.cj.jdbc.Driver").newInstance();

            java.sql.Connection originalConn = java.sql.DriverManager.getConnection("jdbc:mysql://localhost/repro?user=root&useSSL=false&serverTimezone=UTC");
            // Then create/wrap it with the instrumented Connection from "io.opencensus.integration.ocjdbc".
            java.sql.Connection conn = new Connection(originalConn);
            doWork(conn);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println(String.format("Failed to create SQLDriver: %s", e));
            return;
        }
    }

    public static void doWork(java.sql.Connection conn) throws Exception {
        System.out.println("Hello OCJDBC!");

        for (int i = 0; i < 200; i++) {
            Scope ss = tracer.spanBuilder(String.format("DoWork-%d", i)).startScopedSpan();
            try {
                java.sql.Statement stmt = conn.createStatement();
                java.sql.ResultSet rs = stmt.executeQuery("SELECT * from repro");
                rs.close();
                System.out.println("Iteration #" + i);
            } finally {
                ss.close();
            }

            Thread.sleep(4000);
        }
    }

    public static void enableObservability() throws Exception {
        // Enable metrics with OpenCensus.
        Observability.registerAllViews();

         TraceConfig traceConfig = Tracing.getTraceConfig();
        // For demo purposes, lets always sample.
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());

        // The trace exporter.
        ZipkinTraceExporter.createAndRegister("http://localhost:9411/api/v2/spans", "ocjdbc-demo");

        // The metrics exporter.
        PrometheusStatsCollector.createAndRegister();

        // Run the server as a daeon on address "localhost:8889".
        HTTPServer server = new HTTPServer("localhost", 8889);
    }
}
{{</highlight>}}
{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.opencensus</groupId>
    <artifactId>ocjdbc-app</artifactId>
    <packaging>jar</packaging>
    <version>0.0.1</version>
    <name>ocjdbc-app</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.16.1</opencensus.version>
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
            <groupId>io.opencensus.integration</groupId>
            <artifactId>opencensus-ocjdbc</artifactId>
            <version>0.0.2</version>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.12</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-stats-prometheus</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>io.prometheus</groupId>
            <artifactId>simpleclient_httpserver</artifactId>
            <version>0.4.0</version>
        </dependency>

        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-trace-zipkin</artifactId>
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
            </plugins>
        </pluginManagement>

        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>appassembler-maven-plugin</artifactId>
                <version>1.10</version>
                <configuration>
                    <programs>
                        <program>
                            <id>SQLApp</id>
                            <mainClass>io.opencensus.tutorials.ocjdbc.App</mainClass>
                        </program>
                    </programs>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
{{</highlight>}}
{{% /tabs %}}

but also the Prometheus config.yaml file saved in `config.yaml`
```yaml
scrape_configs:
  - job_name: 'ocjavametricstutorial'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8889']
```

### Running it
With the Java source code properly placed in `src/main/java/io/opencensus/tutorial/ocjdbc/App.java` and the `pom.xml` file,
we can now do
```shell
mvn install && mvn exec:java -Dexec.mainClass=io.opencensus.tutorial.ocjdbc.App
```

and then start up Zipkin and Prometheus as per

Starter|URL
---|---
Zipkin|https://opencensus.io/codelabs/zipkin
Prometheus|https://opencensus.io/codelabs/prometheus

in another terminal, please run Prometheus as per
```shell
prometheus --config.file=config.yaml
```

which should then produce such output
```shell
Hello OCJDBC!
Iteration #0
Iteration #1
Iteration #2
Iteration #3
Iteration #4
Iteration #5
Iteration #6
Iteration #7
Iteration #8
Iteration #9
Iteration #10
Iteration #11
Iteration #12
Iteration #13
Iteration #14
Iteration #15
Iteration #16
```

## Examining the traces
With Zipkin running, we can navigate to the Zipkin UI at http://localhost:9411/zipkin
you should be able to see such visuals

* All traces
![](/images/ocjdbc-tracing-all.png)

* An individual trace
![](/images/ocjdbc-tracing-single.png)

## Examining the metrics
With Prometheus running, we can navigate to the Prometheus UI at http://localhost:9090/graph
you should be able to see such visuals

* All metrics
![](/images/ocjdbc-metrics-all.png)

* Latency buckets
![](/images/ocjdbc-metrics-latency-bucket.png)

* Calls
![](/images/ocjdbc-metrics-calls.png)

## References

Resource|URL
---|---
JDBC information page|https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/
OCJDBC Github repository|https://github.com/opencensus-integrations/ocjdbc
JDBC JavaDoc|https://docs.oracle.com/javase/8/docs/api/index.html?java/sql/package-summary.html
