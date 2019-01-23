---
title: "Java"
date: 2018-07-30T18:44:00-07:00
draft: false
weight: 3
class: "resized-logo"
aliases: [/integrations/google_cloud_bigtable/java, /guides/integrations/google_cloud_bigtable/java]
logo: /images/java.png
---

- [Introduction](#introduction)
- [Packages to import](#packages-to-import)
- [Enable Reporting](#enable-reporting)
    - [Import packages](#import-packages)
    - [Adding tracing](#adding-tracing)
    - [End to end code sample](#end-to-end-code-sample)
- [Running it](#running-it)
    - [Maven install](#maven-install)
    - [Run the code](#run-the-code)
- [Viewing your metrics](#viewing-your-metrics)
- [Viewing your traces](#viewing-your-traces)

## Introduction
Cloud Bigtable (cbt) is a petabyte-scale, fully managed NoSQL database service for large analytical and operational workloads.
For more information you can read about it here and get started [Bigtable docs](https://cloud.google.com/bigtable/docs/how-to/)

Cloud Bigtable's Java package was already instrumented for Tracing with OpenCensus.

For more information, visit the [Bigtable docs](https://cloud.google.com/bigtable/docs).

{{% notice note %}}
This guide makes use of a couple of APIs

API|Reference
---|---
Bigtable how-to-guides|[Google Cloud Platform Bigtable how-to-guides](https://cloud.google.com/bigtable/docs/how-to/)
Stackdriver|[Stackdriver codelab](/codelabs/stackdriver/)
{{% /notice %}}

## Enable Reporting

### Import packages
For tracing and metrics on Bigtable, we'll import a couple of packages

Package Name|Package link
---|---
The Cloud Bigtable Java package|[com.google.cloud.bigtable](https://googlecloudplatform.github.io/google-cloud-java)
The OpenCensus trace package|[io.opencensus.trace](https://www.javadoc.io/doc/io.opencensus/opencensus-trace)
The OpenCensus Java gRPC views|[io.opencensus.contrib.grpc.metrics.RpcViews](https://github.com/census-instrumentation/opencensus-java/tree/master/contrib/grpc_metrics)

For the source code, please see [Java BigTable Hello world](https://cloud.google.com/bigtable/docs/samples-java-hello)

### Adding tracing

```java
import io.opencensus.common.Scope;
import io.opencensus.contrib.grpc.metrics.RpcViews;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.config.TraceParams;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.samplers.Samplers;

private void enableOpenCensusObservability() throws IOException {
        // Start: enable observability with OpenCensus tracing and metrics
        // Create and register the Stackdriver Tracing exporter
        StackdriverTraceExporter.createAndRegister(
                StackdriverTraceConfiguration.builder()
                .setProjectId(PROJECT_ID)
                .build());

        // Create and register the Stackdriver Monitoring/Metrics exporter
        StackdriverStatsExporter.createAndRegister(
                StackdriverStatsConfiguration.builder()
                .setProjectId(PROJECT_ID)
                .build());

        // Register all the gRPC views
        RpcViews.registerAllGrpcViews();

        // For demo purposes, we are enabling the always sampler
        TraceConfig traceConfig = Tracing.getTraceConfig();
        traceConfig.updateActiveTraceParams(
                traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());
        // End: enable observability with OpenCensus
}
```

### End to end code sample

With all the steps combined, we'll finally have this code snippet, adapted from [Bigtable Java helloworld](https://cloud.google.com/bigtable/docs/samples-java-hello/)

{{<tabs Source "pom.xml">}}
{{<highlight java>}}
// Inside file: src/main/java/io/opencensus/tutorials/bigtable/BigtableOpenCensus.java
package io.opencensus.tutorials.bigtable;

import com.google.cloud.bigtable.hbase.BigtableConfiguration;
import io.opencensus.common.Scope;
import io.opencensus.contrib.grpc.metrics.RpcViews;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceConfiguration;
import io.opencensus.exporter.trace.stackdriver.StackdriverTraceExporter;
import io.opencensus.trace.Tracer;
import io.opencensus.trace.Tracing;
import io.opencensus.trace.config.TraceConfig;
import io.opencensus.trace.samplers.Samplers;
import java.io.IOException;
import org.apache.hadoop.hbase.HColumnDescriptor;
import org.apache.hadoop.hbase.HTableDescriptor;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.Put;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.ResultScanner;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.util.Bytes;

public class BigtableOpenCensus implements AutoCloseable {
  private static final String PROJECT_ID = "census-demos";
  private static final String INSTANCE_ID = "census-demos";
  private static final byte[] TABLE_NAME = Bytes.toBytes("Hello-Bigtable");
  private static final byte[] COLUMN_FAMILY_NAME = Bytes.toBytes("cf1");
  private static final byte[] COLUMN_NAME = Bytes.toBytes("greeting");
  private static final String[] GREETINGS = {
    "Hello World!", "Hello Cloud Bigtable!", "Hello HBase!"
  };
  private static final Tracer tracer = Tracing.getTracer();

  private Admin admin;
  private Connection connection;

  public BigtableOpenCensus(String projectId, String instanceId) throws Exception {
    // Create the admin client to use for table creation and management
    this.connection = BigtableConfiguration.connect(projectId, instanceId);
    this.admin = this.connection.getAdmin();

    // Enable observability with OpenCensus
    this.enableOpenCensusObservability();
  }

  @Override
  public void close() throws IOException {
    this.connection.close();
  }

  public static void main(String... args) {
    // Create the Bigtable connection
    try (BigtableOpenCensus boc = new BigtableOpenCensus(PROJECT_ID, INSTANCE_ID)) {
      // Now for the application code
      try (Scope ss = tracer.spanBuilder("opencensus.Bigtable.Tutorial").startScopedSpan()) {
        HTableDescriptor descriptor = new HTableDescriptor(TableName.valueOf(TABLE_NAME));

        // Create the table
        Table table = boc.createTable(descriptor);

        // Write some data to the table
        boc.writeRows(table, GREETINGS);

        // Read the written rows
        boc.readRows(table);

        // Finally cleanup by deleting the created table
        boc.deleteTable(table);
      }
    } catch (Exception e) {
      System.err.println("Exception while running HelloWorld: " + e.getMessage());
      e.printStackTrace();
      System.exit(1);
    }
  }

  private Table createTable(HTableDescriptor tableDesc) throws Exception {
    try (Scope ss = tracer.spanBuilder("CreateTable").startScopedSpan()) {
      tableDesc.addFamily(new HColumnDescriptor(COLUMN_FAMILY_NAME));
      System.out.println("Create table " + tableDesc.getNameAsString());
      this.admin.createTable(tableDesc);
      return this.connection.getTable(TableName.valueOf(TABLE_NAME));
    }
  }

  private void writeRows(Table table, String[] rows) throws IOException {
    try (Scope ss = tracer.spanBuilder("WriteRows").startScopedSpan()) {
      System.out.println("Write rows to the table");
      for (int i = 0; i < rows.length; i++) {
        String rowKey = "greeting" + i;

        Put put = new Put(Bytes.toBytes(rowKey));
        put.addColumn(COLUMN_FAMILY_NAME, COLUMN_NAME, Bytes.toBytes(rows[i]));
        table.put(put);
      }
    }
  }

  private void deleteTable(Table table) throws Exception {
    try (Scope ss = tracer.spanBuilder("DeleteTable").startScopedSpan()) {
      System.out.println("Deleting the table");
      this.admin.disableTable(table.getName());
      this.admin.deleteTable(table.getName());
    }
  }

  private void readRows(Table table) throws Exception {
    try (Scope ss = tracer.spanBuilder("ReadRows").startScopedSpan()) {
      System.out.println("Scan for all greetings:");
      Scan scan = new Scan();

      ResultScanner scanner = table.getScanner(scan);
      for (Result row : scanner) {
        byte[] valueBytes = row.getValue(COLUMN_FAMILY_NAME, COLUMN_NAME);
        System.out.println('\t' + Bytes.toString(valueBytes));
      }
    }
  }

  private void enableOpenCensusObservability() throws IOException {
    // Start: enable observability with OpenCensus tracing and metrics
    // Create and register the Stackdriver Tracing exporter
    StackdriverTraceExporter.createAndRegister(
        StackdriverTraceConfiguration.builder().setProjectId(PROJECT_ID).build());

    // Create and register the Stackdriver Monitoring/Metrics exporter
    StackdriverStatsExporter.createAndRegister(
        StackdriverStatsConfiguration.builder().setProjectId(PROJECT_ID).build());

    // Register all the gRPC views
    RpcViews.registerAllGrpcViews();

    // For demo purposes, we are enabling the always sampler
    TraceConfig traceConfig = Tracing.getTraceConfig();
    traceConfig.updateActiveTraceParams(
        traceConfig.getActiveTraceParams().toBuilder().setSampler(Samplers.alwaysSample()).build());
    // End: enable observability with OpenCensus
  }
}
{{</highlight>}}
{{<highlight xml>}}
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>io.opencensus</groupId>
    <artifactId>cloud-bigtable-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <opencensus.version>0.18.0</opencensus.version> <!-- The OpenCensus version to use -->
  </properties>

  <dependencies>
    <dependency>
     <!-- https://mvnrepository.com/artifact/com.google.cloud.bigtable/bigtable-hbase-1.x-hadoop -->
        <groupId>com.google.cloud.bigtable</groupId>
        <artifactId>bigtable-hbase-1.x-hadoop</artifactId>
        <version>1.8.0</version>
    </dependency>

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
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-contrib-grpc-metrics</artifactId>
      <version>${opencensus.version}</version>
    </dependency>

    <dependency>
      <groupId>org.apache.hbase</groupId>
      <artifactId>hbase</artifactId>
      <version>2.1.0</version>
      <type>pom</type>
    </dependency>

    <!-- https://mvnrepository.com/artifact/com.google.cloud/google-cloud-bigtable -->
    <dependency>
      <groupId>com.google.cloud</groupId>
      <artifactId>google-cloud-bigtable</artifactId>
      <version>0.78.0-alpha</version>
    </dependency>

    <dependency>
      <groupId>com.google.guava</groupId>
      <artifactId>guava</artifactId>
      <version>20.0</version>
    </dependency>

    <!-- https://mvnrepository.com/artifact/com.google.cloud/google-cloud-monitoring -->
    <dependency>
      <groupId>com.google.cloud</groupId>
      <artifactId>google-cloud-monitoring</artifactId>
      <version>1.60.0</version>
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
              <id>BigtableOpenCensus</id>
              <mainClass>io.opencensus.tutorials.bigtable.BigtableOpenCensus</mainClass>
            </program>
          </programs>
        </configuration>
      </plugin>

    </plugins>
  </build>

  <dependencyManagement>
    <dependencies>
      <dependency>
        <groupId>com.google.protobuf</groupId>
        <artifactId>protobuf-java</artifactId>
        <version>3.6.1</version>
      </dependency>
      <dependency>
        <groupId>io.grpc</groupId>
        <artifactId>grpc-all</artifactId>
        <version>1.13.1</version>
      </dependency>
      <dependency>
        <groupId>io.netty</groupId>
        <artifactId>netty-all</artifactId>
        <version>4.1.28.Final</version>
      </dependency>
    </dependencies>
  </dependencyManagement>
</project>
{{</highlight>}}
{{</tabs>}}

## Running it
### Maven install
```shell
mvn install
```

### Run the code
```shell
mvn exec:java -Dexec.mainClass=io.opencensus.tutorials.bigtable.BigtableOpenCensus
```

## Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

## Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
