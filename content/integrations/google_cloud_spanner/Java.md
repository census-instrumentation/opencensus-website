---
title: "Java"
date: 2018-07-24T15:14:00-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/images/java.png)

{{% notice note %}}
This guide makes use of a couple of APIs

API|Guided codelab
---|---
Spanner|[Spanner codelab](/codelabs/spanner)
Stackdriver |[Stackdriver codelab](/codelabs/stackdriver)
{{% /notice %}}

Cloud Spanner's Java package was already instrumented for:
* Tracing with OpenCensus
* Metrics with gRPC

## Table of contents
- [Packages to import](#packages-to-import)
    - [Pom.xml](#pom.xml)
- [Enable metric reporting](#register-views)
    - [Register client metric views](#register-client-metric-views)
    - [Register server metric views](#register-server-metric-views)
- [Enable tracing](#enable-tracing)
- [End to end code sample](#end-to-end-code-sample)
- [Running it](#running-it)
    - [Maven install](#maven-install)
    - [Run the code](#run-the-code)
- [Viewing your traces](#viewing-your-traces)
- [Viewing your metrics](#viewing-your-metrics)

#### Packages to import

For tracing and metrics on Spanner, we'll import a couple of packages

Package Name|Package link
---|---
The Cloud Spanner Java package|[com.google.cloud.spanner](https://googlecloudplatform.github.io/google-cloud-java)
The OpenCensus trace package|[io.opencensus.trace](https://www.javadoc.io/doc/io.opencensus/opencensus-trace)
The OpenCensus Java gRPC views|[io.opencensus.contrib.grpc.metrics.RpcViews](https://github.com/census-instrumentation/opencensus-java/tree/master/contrib/grpc_metrics)

And when imported in code:

```java
import com.google.cloud.spanner;
import io.opencensus.contrib.grpc.metrics.RpcViews;
import io.opencensus.trace.Tracing;
```

#### Enable metric reporting

To enable metric reporting/exporting, we need to enable a metrics exporter, but before that we'll need
to register and enable the views that match the metrics to collect. For a complete list of the available views
available please visit [io.opencensus.contrib.grpc.metrics.RpcViews](https://github.com/census-instrumentation/opencensus-java/tree/master/contrib/grpc_metrics)

Finally, we'll register all the views

##### Register gRPC views

```java
RpcViews.registerAllGrpcViews();
```

##### Exporting traces and metrics
The last step is to enable trace and metric exporting. For that we'll use say [Stackdriver Exporter](/supported-exporters/java/stackdriver) or
any of the  [Java exporters](/supported-exporters/java/)

##### End to end code sample
With all the steps combined, we'll finally have this code snippet

{{<tabs Source Pom_xml>}}
{{<highlight java>}}
package com.opencensus.examples;

import com.google.cloud.spanner.DatabaseClient;
import com.google.cloud.spanner.DatabaseId;
import com.google.cloud.spanner.Key;
import com.google.cloud.spanner.Mutation;
import com.google.cloud.spanner.ResultSet;
import com.google.cloud.spanner.Spanner;
import com.google.cloud.spanner.SpannerOptions;
import com.google.cloud.spanner.Statement;

import io.opencensus.common.Scope;
import io.opencensus.contrib.grpc.metrics.RpcViews;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;

import java.util.Arrays;
import java.util.List;

public class SpannerOpenCensusTutorial {
    private DatabaseClient dbClient;
    private Spanner spanner;

    private static String parentSpanName = "create-players";
    public SpannerOpenCensusTutorial(String instanceId, String databaseId) throws Exception {
      // Instantiate the client.
      SpannerOptions options = SpannerOptions.getDefaultInstance();
      this.spanner = options.getService();

      // And then create the Spanner database client.
      this.dbClient = this.spanner.getDatabaseClient(DatabaseId.of(
          options.getProjectId(), instanceId, databaseId));

      // Next up let's  install the exporter for Stackdriver tracing.
      StackdriverTraceExporter.createAndRegister();
      Tracing.getExportComponent().getSampledSpanStore()
             .registerSpanNamesForCollection(Arrays.asList(parentSpanName));

      // Then the exporter for Stackdriver monitoring/metrics.
      StackdriverStatsExporter.createAndRegister();
      RpcViews.registerAllGrpcViews();
    }

    public void close() {
      this.spanner.close();
    }

    public void warmUpRead() {
      this.dbClient.singleUse().readRow("Players", Key.of("foo@gmail.com"), Arrays.asList("email"));
    }

    public static void main(String ...args) throws Exception {
      if (args.length < 2) {
        System.err.println("Usage: ZeuSports <instance_id> <database_id>");
        return;
      }

      try {
        SpannerOpenCensusTutorial zdb = new SpannerOpenCensusTutorial(args[0], args[1]);
	// Warm up the spanner client session. In normal usage
	// you'd have hit this point after the first operation.
	zdb.warmUpRead();

	for (int i=0; i < 3; i++) {
	  String up = i + "-" + (System.currentTimeMillis() / 1000) + ".";
	  List<Mutation> mutations = Arrays.asList(
	    playerMutation("Poke", "Mon", up + "poke.mon@example.org", "f1578551-eb4b-4ecd-aee2-9f97c37e164e"),
	    playerMutation("Go", "Census", up + "go.census@census.io", "540868a2-a1d8-456b-a995-b324e4e7957a"),
	    playerMutation("Quick", "Sort", up + "q.sort@gmail.com", "2b7e0098-a5cc-4f32-aabd-b978fc6b9710")
	  );

	  zdb.insertPlayers(mutations);
	}

        zdb.close();
      } catch (Exception e) {
        System.out.printf("Exception while adding player: " + e);
      } finally {
        System.out.println("Bye!");
      }
    }

    public static Mutation playerMutation(String firstName, String lastName, String email, String uuid) {
        return Mutation.newInsertBuilder("Players")
          .set("first_name")
          .to(firstName)
          .set("last_name")
          .to(lastName)
          .set("uuid")
          .to(uuid)
          .set("email")
          .to(email)
          .build();
    }

    public void insertPlayers(List<Mutation> players) throws Exception {
      try (Scope ss = Tracing.getTracer()
        .spanBuilderWithExplicitParent(parentSpanName, null)
        // Enable the trace sampler.
        //  We are always sampling for demo purposes only: this is a very high sampling
        // rate, but sufficient for the purpose of this quick demo.
        // More realistically perhaps tracing 1 in 10,000 might be more useful
        .setSampler(Samplers.alwaysSample())
        .startScopedSpan()) {

        this.dbClient.write(players);
      } finally {
      }
    }
}
{{</highlight>}}

{{<highlight xml>}}
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.opencensus.tutorials</groupId>
  <artifactId>opencensus-tutorials</artifactId>
  <packaging>jar</packaging>
  <version>1.0-SNAPSHOT</version>
  <name>opencensus-examples</name>
  <url>http://maven.apache.org</url>

  <properties>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.source>1.8</maven.compiler.source>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <opencensus.version>0.11.0</opencensus.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>com.google.cloud</groupId>
      <artifactId>google-cloud-spanner</artifactId>
      <version>0.33.0-beta</version>
      <exclusions>
	<exclusion>
	  <groupId>com.google.guava</groupId>
	  <artifactId>guava-jdk5</artifactId>
	</exclusion>
	<exclusion>
	  <groupId>io.opencensus</groupId>
	  <artifactId>opencensus-api</artifactId>
	</exclusion>
      </exclusions>
    </dependency>

    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>20.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-api</artifactId>
      <version>0.11.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-exporter-stats-stackdriver</artifactId>
      <version>0.11.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
      <version>0.11.0</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-contrib-grpc-metrics</artifactId>
      <version>0.11.0</version>
    </dependency>


    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-impl</artifactId>
      <version>0.11.0</version>
      <scope>runtime</scope>
    </dependency>

  </dependencies>

  <build>
    <plugins>
      <plugin>
	<groupId>org.codehaus.mojo</groupId>
	<artifactId>exec-maven-plugin</artifactId>
	<version>1.4.0</version>
	<configuration>
	  <mainClass>com.opencensus.tutorials.spanner</mainClass>
	</configuration>
      </plugin>
    </plugins>
  </build>

</project>
{{</highlight>}}
{{</tabs>}}

#### Running it
##### Maven install
```shell
mvn install
```

##### Run the code
```shell
mvn exec:java -Dexec.mainClass=com.opencensus.tutorials.spanner -Dexec.args="census-demos demo1"
```

#### Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

#### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
