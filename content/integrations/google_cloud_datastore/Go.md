---
title: "Go"
date: 2018-08-02T20:59:20-07:00
draft: false
weight: 3
---

![](/images/gopher.png)

{{% notice note %}}
This guide makes use of a couple of APIs

API|Guided codelab
---|---
Cloud Datastore|[Enable Cloud Datastore](https://cloud.google.com/datastore)
Stackdriver|[Please visit the Stackdriver codelab to set it up](/codelabs/stackdriver)
{{% /notice %}}

Cloud Datastore's Go package was already instrumented for:

* Tracing with OpenCensus

## Table of contents
- [Background](#background)
- [Packages to import](#packages-to-import)
- [Enable tracing](#enable-tracing)
- [End to end code sample](#end-to-end-code-sample)
- [Viewing your traces](#viewing-your-traces)

#### Background

Our application is a segment of a source code mirroring service. It saves git commits and blobs to Cloud Datastore.
With OpenCensus, we'll gain insights into how our distributed application is performing by instrumenting our application to examine
traces.

#### Packages to import

For tracing on Datastore, we'll import the following packages

Package Name|Package link
---|---
The Cloud Datastore Go package|[cloud.google.com/go/datastore](https://godoc.org/cloud.google.com/go/datastore)
The OpenCensus trace package|[go.opencensus.io/trace](https://godoc.org/go.opencensus.io/trace)

And when imported in code
{{<highlight go>}}
import (
        "cloud.google.com/go/datastore"
        "go.opencensus.io/trace"
)
{{</highlight>}}

#### Enabling tracing

To enable tracing, we'll follow the steps for tracing by:

* Starting and stopping spans

{{<highlight go>}}
ctx, span := trace.StartSpan(ctx, "The span name")
// Ensure that the span is ended
defer span.End()
_ = ctx // Use the context below
{{</highlight>}}

#### Add the trace exporter
The last step is to enable trace exporting. For that we'll use [Stackdriver Exporter](/supported-exporters/go/stackdriver)
{{<highlight go>}}
import (
        "log"

        "contrib.go.opencensus.io/exporter/stackdriver"
        "go.opencensus.io/trace"
)

func main() {
        sd, err := stackdriver.NewExporter(stackdriver.Options{
                ProjectID:    projectID,
        })
        if err != nil {
                log.Fatalf("Failed to create the Stackdrsiver exporter: %v", err)
        }
        defer sd.Flush()
        trace.RegisterExporter(sd)
}
{{</highlight>}}


#### End to end code sample

With all the steps combined, we'll finally have this code snippet

{{<highlight go>}}
package main

import (
	"context"
	"log"

	"cloud.google.com/go/datastore"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/trace"
)

type record struct {
	Hash    string `json:"hash"`
	Message string `json:"message"`
	Date    string `json:"date"`
}

// record implements Load so that datastore can deserialize to it
func (r *record) Load(ps []datastore.Property) error {
	return datastore.LoadStruct(r, ps)
}

func main() {
	projectID := "census-demos"

	client, err := datastore.NewClient(context.Background(), projectID)
	if err != nil {
		log.Fatalf("Failed to create datastore client: %v", err)
	}
	defer client.Close()
        // Warm up datastore first to ensure the session is already setup. Usually in 
        // your application, you'd have hit this point by the time you are handling traffic.
	_, _ = client.Count(context.Background(), datastore.NewQuery("Record"))

	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    projectID,
	})
	if err != nil {
		log.Fatalf("Failed to create the Stackdrsiver exporter: %v", err)
	}
	defer sd.Flush()
        // For demo purposes, we'll always sample traces
        trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
        trace.RegisterExporter(sd)

	// Now onto the application code
	ctx, span := trace.StartSpan(context.Background(), "DatastoreOpenCensus-Tutorial")
	defer span.End()

	// Count the number of records
	_, nrSpan := trace.StartSpan(ctx, "Count")
	q := datastore.NewQuery("Record")
	n, err := client.Count(ctx, q)
	nrSpan.End()
	if err != nil {
		log.Fatalf("Failed to count the number of records: %v", err)
	}

	if n == 0 {
		log.Printf("No records available yet unfortunately!")
	} else {
		log.Printf("There are %d records", n)
	}

	// Delete the bad record entities
	badRecords := []*datastore.Key{
		datastore.NameKey("Record", "6746d075-3b42-4a9b-80d6-4b43b91152ed", nil),
		datastore.NameKey("Record", "af1ed566-0e76-4033-b9a4-bbb8dcf5b15b", nil),
	}

	_, dmSpan := trace.StartSpan(ctx, "DeleteBadRecords")
	err = client.DeleteMulti(ctx, badRecords)
	dmSpan.End()
	if err != nil {
		log.Fatalf("Failed to delete the bad record: %v", err)
	}

	// Insert the actual/good records
	goodRecords := []*record{
		{
			Hash:    "34b58f87c92fefa14ed717149a0502b29c090d1f",
			Date:    "Thu Oct 26 22:54:05 2017 -0700",
			Message: "routing: now supporting multiple divergent route/proxies",
		},
		{
			Hash:    "8d2d3f365197aea09c9fb6d996453ca6618d17cd",
			Date:    "Wed Oct 25 21:34:45 2017 -0700",
			Message: "ignore unmarshal errors from ping, avoid nil roundRobinAddress",
		},
	}

	keys := []*datastore.Key{
		datastore.NameKey("Record", "6746d075-3b42-4a9b-80d6-4b43b91152ed", nil),
		datastore.NameKey("Record", "af1ed566-0e76-4033-b9a4-bbb8dcf5b15b", nil),
	}

	_, pmSpan := trace.StartSpan(ctx, "PutGoodRecords")
	_, err = client.PutMulti(ctx, keys, goodRecords)
	pmSpan.End()
	if err != nil {
		log.Fatalf("Failed to put good records: %v", err)
	}

	// Now fetch all the records
	var allRecords []*record
	_, gaSpan := trace.StartSpan(ctx, "FetchAllRecords")
	allKeys, err := client.GetAll(ctx, q, &allRecords)
	gaSpan.End()
	if err != nil {
		log.Fatalf("Failed to get back all records: %v", err)
	}
	for i, key := range allKeys {
		log.Printf("#%d: Key(%T)=%q Record=%+v\n", i, key, key, allRecords[i])
	}

	// Then finally clear them all
	_, dmaSpan := trace.StartSpan(ctx, "DeleteAllRecords")
	err = client.DeleteMulti(ctx, allKeys)
	dmaSpan.End()
	if err != nil {
		log.Fatalf("Failed to delete all records: %v", err)
	}
}
{{</highlight>}}

#### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)

![](/images/cloud_datastore_trace-go.png)
