---
title: "Java"
date: 2018-07-25T09:38:03-07:00
draft: false
class: "integration-page"
---

![](/images/java-opencensus.png)

{{% notice note %}}
This guide makes use of Redis. If you don't yet have an installation of Redis, please [Click here to get started](https://redis.io/topics/quickstart)
{{% /notice %}}

{{% notice note %}}
This guide makes use of Stackdriver. If you haven't yet, please [Click here to get started with Stackdriver](/codelabs/stackdriver)
{{% /notice %}}


Some Redis clients were already instrumented to provide traces and metrics with OpenCensus

Packages|Repository link
---|---
jedis|https://github.com/opencensus-integrations/jedis

## Table of contents
- [Generating the JAR](#generating-the-jar)
    - [Clone this repository](#clone-this-repository)
    - [Generate and install](#generate-and-install)
- [Available metrics](#available-metrics)
- [Enabling observability](#enabling-observability)
- [End to end example](#end-to-end-example)
    - [Running it](#running-it)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

#### Generating the JAR

##### Clone this repository
```shell
git clone https://github.com/opencensus-integrations
```

##### Generating the JAR
Inside the cloned repository's directory run
```shell
mvn install:install-file -Dfile=$(pwd)/target/jedis-3.0.0-SNAPSHOT.jar \
-DgroupId=redis.clients -DartifactId=jedis -Dversion=3.0.0 \
-Dpackaging=jar -DgeneratePom=true
```

#### Enabling observability
To enable observability, we'll need to use Jedis normally but with one change

{{<highlight java>}}
import redis.clients.jedis.Observability;
{{</highlight>}}

and then finally to enable metrics
{{<highlight java>}}
// Enable exporting of all the Jedis specific metrics and views
Observability.registerAllViews();
{{</highlight>}}

#### Available metrics
Metric search suffix|Description
---|---
redis/bytes_read|The number of bytes read from the Redis server
redis/bytes_written|The number of bytes written out to the Redis server
redis/dials|The number of connection dials made to the Redis server
redis/dial_latency_milliseconds|The number of milliseconds spent performing Redis operations
redis/errors|The number of errors encountered
redis/connections_opened|The number of new connections
redis/roundtrip_latency|The latency spent for various Redis operations
redis/reads|The number of reads performed
redis/writes|The number of writes performed

#### End to end example
{{<tabs Source Pom>}}

{{<highlight java>}}
package io.opencensus.tutorials.jedis;

import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.config.TraceParams;
import io.opencensus.trace.samplers.Samplers;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.Observability;

public class JedisOpenCensus {
    private static final Jedis jedis = new Jedis("localhost");

    public static void main(String ...args) {
        // Enable exporting of all the Jedis specific metrics and views.
        Observability.registerAllViews();

        // Now enable OpenCensus exporters
        setupOpenCensusExporters();

        // Now for the repl
        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        while (true) {
            try {
                System.out.print("> ");
                System.out.flush();
                String query = stdin.readLine();

                // Check Redis if we've got a hit firstly
                String result = jedis.get(query);
                if (result == null || result == "") {
                    // Cache miss so process it and memoize it
                    result = "$" + query + "$";
                    jedis.set(query, result);
                }
                System.out.println("< " + result + "\n");
            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static void setupOpenCensusExporters() {
        String gcpProjectId = "census-demos";

        try {
            StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());

            StackdriverStatsExporter.createAndRegister(
                StackdriverStatsConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
        } catch (Exception e) {
            System.err.println("Failed to setup OpenCensus " + e);
        }

        // Change the sampling rate to always sample
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());
    }
}
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>io.ocgrpc</groupId>
    <artifactId>ocgrpc</artifactId>
    <packaging>jar</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>ocgrpc</name>
    <url>http://maven.apache.org</url>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <opencensus.version>0.15.0</opencensus.version> <!-- The OpenCensus version to use -->
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.opencensus</groupId>
            <artifactId>opencensus-exporter-stats-stackdriver</artifactId>
            <version>${opencensus.version}</version>
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
            <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
            <version>${opencensus.version}</version>
        </dependency>

        <dependency>
            <groupId>redis.clients</groupId>
            <artifactId>jedis</artifactId>
            <version>3.0.0</version>
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
                            <id>JedisOpenCensus</id>
                            <mainClass>io.opencensus.tutorials.jedis.JedisOpenCensus</mainClass>
                        </program>
                    </programs>
                </configuration>
            </plugin>

        </plugins>
    </build>

</project>
{{</highlight>}}
{{</tabs>}}

##### Running it
```shell
mvn install && mvn exec:java -Dexec.mainClass=io.opencensus.tutorials.jedis.JedisOpenCensus
```

##### Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

##### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
