---
title: "Go driver"
date: 2018-12-25T00:03:36+03:00
draft: false
logo: /images/mongo-gopher.png
aliases: [/guides/integrations/mongodb/go_driver]
---

- [Introduction](#introduction)
- [Pre-requisites](#pre-requisites)
- [Using it](#using-it)
- [Instrumentation](#instrumentation)
    - [Enabling tracing](#enabling-tracing)
    - [Enabling metrics](#enabling-metrics)
    - [Enabling exporters](#enabling-exporters)
- [Metrics](#metrics)
    - [Tags](#tags)
        - [method](#method)
        - [status](#status)
        - [error](#error)
- [Instrumentation matrix](#instrumentation-matrix)
- [End-to-end example](#end-to-end-example)
    - [Results](#results)
        - [Traces screenshots](#traces-screenshots)
        - [Metrics screenshots](#metrics-screenshots)
- [References](#references)

### Introduction

A wrapper for [the official MongoDB Go driver](https://github.com/mongodb/mongo-go-driver) has been instrumented with OpenCensus for Tracing and metrics at [https://github.com/opencensus-integrations/gomongowrapper](https://godoc.org/github.com/opencensus-integrations/gomongowrapper)

### Pre-requisites

- [Go](https://golang.org/doc/install)
- [MongoDB server](https://www.mongodb.com/)
- [Stackdriver Tracing and Monitoring](https://opencensus.io/codelabs/stackdriver) which we are using only because it provides both tracing and metrics

### Using it

To install the wrapper, please run this command
```shell
go get -u -v github.com/opencensus-integrations/gomongowrapper/...
```

and then in your code, just exactly like you would when using the original driver (except now with the new import)

```go
import (
        "context"
        "log"

        "github.com/opencensus-integrations/gomongowrapper"
)

func main() {
        client, err := mongowrapper.NewClient(MONGO_URL)
        if err != nil {
                log.Fatalf("Failed to create the new client: %v", err)
        }
        ctx := context.Background()
        if err := client.Connect(ctx); err != nil {
                log.Fatalf("Failed to open client connection: %v", err)
        }
        defer client.Disconnect(ctx)
}
```

### Instrumentation

The designers of the [official MongoDB Go driver](https://github.com/mongodb/mongo-go-driver) ensured that each method takes in a [context.Context](https://golang.org/pkg/context#Context).

Fortunately for us, this permits context propagation, which is the mechanism with which observability signals are propagated across RPCs and over the wire.

#### Enabling tracing
To enable trace continuity, just use the same context that contains your traces and at some point, to consume the produced
traces, please enable a [Trace exporter](/exporters/go)

For example
```go
        // Start a span like your application would start one.
        ctx, span := trace.StartSpan(context.Background(), "Fetch")
        defer span.End()

        // Now for the mongo connections, using the context
        // with the span in it for continuity.
        client, err := mongowrapper.NewClient("mongodb://localhost:27017")
        if err != nil {
                log.Fatalf("Failed to create the new client: %v", err)
        }
        if err := client.Connect(ctx); err != nil {
                log.Fatalf("Failed to open client connection: %v", err)
        }
        defer client.Disconnect(ctx)
        coll := client.Database("the_db").Collection("music")
```

#### Enabling metrics
To enable metrics, just use the same context that contains your metrics or tags and at some point, to consume the produced metrics, please enable a [Metrics exporter](/exporters/go)

However, most importantly, please make sure to invoke [gomongowrapper.RegisterAllViews](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#RegisterAllViews)

```go
import (
	"log"

	"github.com/opencensus-integrations/gomongowrapper"
)

if err := gomongowrapper.RegisterAllViews(); err != nil {
	log.Fatalf("Failed to register MongoDB views: %v", err)
}
```

#### Enabling exporters

Please select your target Go trace and metrics exporters from [Go exporters](/guides/exporters/supported-exporters/go/)

### Metrics

Metric|Query Suffix|Description|Aggregation|Tags
---|---|---|---|---
Latency|"mongo/client/latency"|The latencies of the various calls in milliseconds|[Distribution](/stats/view/#aggregations)|"method", "status", "error"
Calls|"mongo/client/calls"|The various calls|[Count](/stats/view/#aggregations)|"method", "status", "error"


#### Tags

As per [Metrics](#metrics), we have a couple of tags applied to some measurements to provide metrics

##### method
The tag key "method" will have a fully qualified name such as

```go
    "github.com/mongodb/mongo-go-driver.Client.EndSession"
```

to distinguish between the various calls as per [Instrumentation matrix](#instrumentation-matrix)


##### status
The tag key "status" will be either one of the following values

* OK -- if set indicates that the call was successful
* ERROR -- if set indicates that the error will be set in the tag key ["error"](#error)

##### error
The tag key "error" will contain a description of the encountered error.

### Instrumentation matrix

This is the full list of methods that have been instrumented with tracing and metrics

Method|Method Name
---|---
[Client.Connect](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedClient.Connect)|"github.com/mongodb/mongo-go-driver.Client.Connect"
[Client.Disconnect](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedClient.Disconnect)|github.com/mongodb/mongo-go-driver.Client.Disconnect
[Client.ListDatabaseNames](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedClient.ListDatabaseNames)|"github.com/mongodb/mongo-go-driver.Client.ListDatabaseNames"
[Client.ListDatabases](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedClient.ListDatabases)|"github.com/mongodb/mongo-go-driver.Client.ListDatabases"
[Client.Ping](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedClient.Ping)|"github.com/mongodb/mongo-go-driver.Client.Ping"
[Collection.Aggregate](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.Aggregate)|"github.com/mongodb/mongo-go-driver.Collection.Aggregate"
[Collection.BulkWrite](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.BulkWrite)|"github.com/mongodb/mongo-go-driver.Collection.BulkWrite"
[Collection.Count](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.Count)|"github.com/mongodb/mongo-go-driver.Collection.Count"
[Collection.CountDocuments](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.CountDocuments)|"github.com/mongodb/mongo-go-driver.Collection.CountDocuments"
[Collection.DeleteMany](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.DeleteMany)|"github.com/mongodb/mongo-go-driver.Collection.DeleteMany"
[Collection.DeleteOne](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.DeleteOne)|"github.com/mongodb/mongo-go-driver.Collection.DeleteOne"
[Collection.Distinct](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.Distinct)|"github.com/mongodb/mongo-go-driver.Collection.Distinct"
[Collection.Drop](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.Drop)|"github.com/mongodb/mongo-go-driver.Collection.Drop"
[Collection.EstimatedDocumentCount](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.EstimatedDocumentCount)|"github.com/mongodb/mongo-go-driver.Collection.EstimatedDocumentCount"
[Collection.Find](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.Find)|"github.com/mongodb/mongo-go-driver.Collection.Find"
[Collection.FindOne](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.FindOne)|"github.com/mongodb/mongo-go-driver.Collection.FindOne"
[Collection.FindOneAndDelete](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.FindOneAndDelete)|"github.com/mongodb/mongo-go-driver.Collection.FindOneAndDelete"
[Collection.FindOneAndReplace](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.FindOneAndReplace)|"github.com/mongodb/mongo-go-driver.Collection.FindOneAndReplace"
[Collection.FindOneAndUpdate](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.FindOneAndUpdate)|"github.com/mongodb/mongo-go-driver.Collection.FindOneAndUpdate"
[Collection.InsertMany](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.InsertMany)|"github.com/mongodb/mongo-go-driver.Collection.InsertMany"
[Collection.InsertOne](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.InsertOne)|"github.com/mongodb/mongo-go-driver.Collection.InsertOne"
[Collection.ReplaceOne](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.ReplaceOne)|"github.com/mongodb/mongo-go-driver.Collection.ReplaceOne"
[Collection.UpdateMany](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.UpdateMany)|"github.com/mongodb/mongo-go-driver.Collection.UpdateMany"
[Collection.UpdateOne](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.UpdateOne)|"github.com/mongodb/mongo-go-driver.Collection.UpdateOne"
[Collection.Watch](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedCollection.Watch)|"github.com/mongodb/mongo-go-driver.Collection.Watch"
[Database.Drop](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedDatabase.Drop)|"github.com/mongodb/mongo-go-driver.Database.Drop"
[Database.ListCollections](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedDatabase.ListCollections)|"github.com/mongodb/mongo-go-driver.Database.ListCollections"
[Database.RunCommand](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedDatabase.RunCommand)|"github.com/mongodb/mongo-go-driver.Database.RunCommand"
[Session.AbortTransaction](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedSession.AbortTransaction)|"github.com/mongodb/mongo-go-driver.Session.AbortTransaction"
[Session.CommitTransaction](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedSession.CommitTransaction)|"github.com/mongodb/mongo-go-driver.Session.CommitTransaction"
[Session.EndSession](https://godoc.org/github.com/opencensus-integrations/gomongowrapper#WrappedSession.EndSession)|"github.com/mongodb/mongo-go-driver.Client.EndSession"


### End to end example
Assuming that you already have a [MongoDB server](https://docs.mongodb.com/manual/installation/) running at "localhost:27017"

```go
package main

import (
	"context"
	"log"
	"time"

	"github.com/mongodb/mongo-go-driver/bson"

	"github.com/opencensus-integrations/gomongowrapper"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

func main() {
	// Enabling the OpenCensus exporter.
	// Just using Stackdriver since it has both Tracing and Metrics
	// and is easy to whip up. Add your desired one here.
	sde, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    "census-demos",
		MetricPrefix: "mongosample",
	})
	if err != nil {
		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
	}
	sde.StartMetricsExporter()
	defer sde.StopMetricsExporter()
	trace.RegisterExporter(sde)
	if err := mongowrapper.RegisterAllViews(); err != nil {
		log.Fatalf("Failed to register all views: %v\n", err)
	}

	defer func() {
		<-time.After(2 * time.Minute)
	}()

	// Start a span like your application would start one.
	ctx, span := trace.StartSpan(context.Background(), "Fetch", trace.WithSampler(trace.AlwaysSample()))
	defer span.End()

	// Now for the mongo connections, using the context
	// with the span in it for continuity.
	client, err := mongowrapper.NewClient("mongodb://localhost:27017")
	if err != nil {
		log.Fatalf("Failed to create the new client: %v", err)
	}
	if err := client.Connect(ctx); err != nil {
		log.Fatalf("Failed to open client connection: %v", err)
	}
	defer client.Disconnect(ctx)
	coll := client.Database("the_db").Collection("music")

	q := bson.M{"name": "Examples"}
	cur, err := coll.Find(ctx, q)
	if err != nil {
		log.Fatalf("Find error: %v", err)
	}

	for cur.Next(ctx) {
		elem := make(map[string]int)
		if err := cur.Decode(elem); err != nil {
			log.Printf("Decode error: %v", err)
			continue
		}
		log.Printf("Got result: %v\n", elem)
	}
	log.Print("Done iterating")

	_, err = coll.DeleteMany(ctx, q)
	if err != nil {
		log.Fatalf("Failed to delete: %v", err)
	}
}
```

#### Results

After running the above sample, and examining the results by visiting

Resource|URL
---|---
Traces on Stackdriver|https://console.cloud.google.com/traces/traces
Metrics on Stackdriver|https://console.cloud.google.com/traces/monitoring

##### Traces screenshots
![Trace](/images/gomongo-trace.png)

##### Metrics screenshots
* All metrics
![All metrics](/images/gomongo-metrics-all.png)

* Latency heatmap
![Latency heatmap](/images/gomongo-metrics-latency-heatmap.png)

* Latency rate
![Latency rate](/images/gomongo-metrics-latency-line.png)

* Calls rate
![Latency rate](/images/gomongo-metrics-calls-line.png)


### References

Resource|URL
---|---
MongoDB website|https://www.mongodb.com/
Official MongoDB Go driver|https://godoc.org/github.com/mongodb/mongo-go-driver/mongo
OpenCensus wrapper for MongoDB Go driver|https://godoc.org/github.com/opencensus-integrations/gomongowrapper
