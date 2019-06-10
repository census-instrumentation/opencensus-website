---
title: "SignalFx (Stats)"
date: 2018-07-22T16:58:03-07:00
draft: false
weight: 3
class: "resized-logo"
aliases: [/supported-exporters/java/signalfx, /guides/exporters/supported-exporters/java/signalfx]
logo: /img/partners/signalFx_logo.svg
---

- [Introduction](#introduction)
- [Creating the exporter](#creating-the-exporter)
- [References](#references)

## Introduction
SignalFx is a real-time monitoring solution for cloud and distributed applications.
SignalFx ingests that data and offers various visualizations on charts, dashboards and service maps,
as well as real-time anomaly detection.

OpenCensus Java has support for this exporter available through the package:

* Stats [io.opencensus.exporter.stats.signalfx](https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-stats-signalfx)

{{% notice tip %}}
This guide makes use of SignalFx.
You'll need to have:

* A [SignalFx account](https://signalfx.com/)
* The corresponding [data ingest token](https://docs.signalfx.com/en/latest/admin-guide/tokens.html)
{{% /notice %}}

## Creating the exporter


Insert the following snippet in your `pom.xml`:

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
    <artifactId>opencensus-exporter-stats-signalfx</artifactId>
    <version>${opencensus.version}</version>
  </dependency>
  <dependency>
    <groupId>io.opencensus</groupId>
    <artifactId>opencensus-impl</artifactId>
    <version>${opencensus.version}</version>
    <scope>runtime</scope>
  </dependency>
</dependencies>
```

Instrument your application code with the following snippet:

{{<highlight java>}}
package io.opencensus.tutorial.signalfx;

import io.opencensus.common.Duration;
import io.opencensus.exporter.stats.signalfx.SignalFxStatsConfiguration;
import io.opencensus.exporter.stats.signalfx.SignalFxStatsExporter;

public class SignalFxTutorial {
    public static void main(String ...args) {
        String signalFxToken = "<this is my token>";

        SignalFxStatsExporter.create(
            SignalFxStatsConfiguration.builder()
            .setToken(signalFxToken)
            .setExportInterval(Duration.create(3, 2))
            .build();
        );
    }
}
{{</highlight>}}

## References

Resource|URL
---|---
SignalFx stats exporter JavaDoc|https://www.javadoc.io/doc/io.opencensus/opencensus-exporter-stats-signalfx
