---
title: "Java APM"
date: 2018-09-14T23:20:36-06:00
draft: false
logo: /images/mongo-java.png
aliases: [/guides/integrations/mongodb/java_apm]
---

- [Introduction](#introduction)
- [Metrics](#metrics)
- [Installing it](#installing-it)
- [Sample](#sample)
    - [Install sample](#install-sample)
    - [Running sample](#running-sample)
- [Viewing metrics](#viewing-metrics)
- [References](#references)

### Introduction

OpenCensus-Java has been integrated with MongoDB's event listeners to retrieve metrics
for executed operations.

The integration can be found at [OpenCensus enabled EventListener.java](https://github.com/opencensus-integrations/mongodb-apm/blob/master/src/main/java/io/opencensus/apm/EventListener.java)

and used accordingly with http://mongodb.github.io/mongo-java-driver/3.6/javadoc/?com/mongodb/event/CommandListener.html

as per

```java
import io.opencensus.apm.EventListener; // The integration to add to your MongoDB Java driver user

MongoClientOptions opts = MongoClientOptions.builder()
                                            .addCommandListener(new EventListener())
                                            .build();

MongoClient client = new MongoClient(new ServerAddress(serverAddress), opts);
```

### Metrics

The metrics that we are collecting include

Metric|Search suffix|Unit
---|---|---
Bytes read|mongo/client/bytes_read|By
Bytes written|mongo/client/bytes_written|By
Roundtrip latency|mongo/client/roundtrip_latency|ms
Errors|mongo/client/errors|"1"

as per https://github.com/opencensus-integrations/mongodb-apm/blob/master/src/main/java/io/opencensus/apm/EventListener.java

### Installing it

Assuming that we are using Maven, we can download and install the integration
```shell
git clone https://github.com/opencensus-integrations/mongodb-apm mongodb-apm-java
```

### Sample

#### Install sample

Assuming you have a MongoDB instance running at `localhost:27017` with a created database `media-searches` and some
content with a key called `key` inside a collection `youtube-searches`, let's change directories into the directory
that we git-cloned the integration as per [Installing it](#installing-it)
```shell
cd mongodb-apm-java
mvn install
```

Next our code looks like this
```java
package io.opencensus.apm;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.ServerAddress;

import io.opencensus.apm.EventListener;

import java.io.BufferedReader;
import java.io.InputStreamReader;;
import java.io.IOException;;

import io.opencensus.exporter.stats.stackdriver.StackdriverStatsConfiguration;
import io.opencensus.exporter.stats.stackdriver.StackdriverStatsExporter;

public class Inspector {
    public static void main(String ...args) {
        try {
            enableOpenCensusExporting();
        } catch (Exception e) {
            System.err.println("Error while enabling OpenCensus and its exporters: " + e.toString());
            return;
        }

        BufferedReader stdin = new BufferedReader(new InputStreamReader(System.in));

        MongoClientOptions opts = MongoClientOptions.builder()
                                    .addCommandListener(new EventListener())
                                    .build();

        MongoClient client = new MongoClient(new ServerAddress("localhost"), opts);

        DB db = client.getDB("media-searches");
        DBCollection dc = db.getCollection("youtube_searches");

        while (true) {
            try {
                System.out.print("> ");
                System.out.flush();
                String line = stdin.readLine();
                String processed = line.toUpperCase();

                DBCursor dcc = dc.find(BasicDBObjectBuilder.start("key", line).get());
                while (dcc.hasNext()) {
                    DBObject cur = dcc.next();
                    System.out.println("< " + cur);
                }

            } catch (IOException e) {
                System.err.println("Exception "+ e);
            }
        }
    }

    private static void enableOpenCensusExporting() throws IOException {
        String gcpProjectId = "census-demos";

        // The stats exporter
        StackdriverStatsExporter.createAndRegister(
                StackdriverStatsConfiguration.builder()
                .setProjectId(gcpProjectId)
                .build());
    }
}
```
stored in file  `mongodb-apm-java/src/main/java/io/opencensus/apm/Inspector.java`

#### Running sample

For simplicity while writing this tutorial, we used Stackdriver Monitoring in the code sample and then

```shell
mvn exec:java -Dexec.mainClass=io.opencensus.apm.Inspector
```

whose prompt screen should look like this
![](/images/mongodb-apm-java-repl.png)

### Viewing metrics

On opening up Stackdriver Monitoring at https://app.google.stackdriver.com/metrics-explorer

and searching for prefix "OpenCensus/mongo/client/"

* All metrics
![](/images/mongodb-apm-java-all-stats.png)

* Bytes read
![](/images/mongodb-apm-java-bytes_read.png)

* Roundtrip latency
![](/images/mongodb-apm-java-roundtrip-latency.png)


### References

Resource|URL
---|---
OpenCensus enabled Java EventListener|https://github.com/opencensus-integrations/mongodb-apm
MongoDB Event listener JavaDoc|http://mongodb.github.io/mongo-java-driver/3.6/javadoc/?com/mongodb/event/CommandListener.html
