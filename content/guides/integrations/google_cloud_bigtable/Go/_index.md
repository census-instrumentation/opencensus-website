---
title: "Go"
date: 2018-07-30T18:44:00-07:00
draft: false
weight: 3
class: "resized-logo"
---

![](/images/gopher.png)

For more information, you can read about it here and get started [Bigtable docs](https://cloud.google.com/bigtable/docs).

{{% notice note %}}
This guide makes use of a couple of APIs

API|Reference
---|---
Bigtable how-to-guides|[Google Cloud Platform Bigtable how-to-guides](https://cloud.google.com/bigtable/docs/how-to/)
Stackdriver|[Stackdriver codelab](/codelabs/stackdriver/)
{{% /notice %}}

Cloud Bigtable (cbt) is a petabyte-scale, fully managed NoSQL database service for large analytical and operational workloads.
For more information you can read about it here and get started [Bigtable docs](https://godoc.org/cloud.google.com/go/bigtable/)

Cloud Bigtable's Go package was already instrumented for:

* Tracing with OpenCensus

## Table of contents
- [Packages to import](#packages-to-import)
- [Technical detour](#technical-detour)
- [Enable tracing](#enable-tracing)
- [End to end code sample](#end-to-end-code-sample)
- [Viewing your traces](#viewing-your-traces)

#### Packages to import

For tracing and metrics on Bigtable, we'll import a couple of packages

Package Name|Package link
---|---
The Cloud Bigtable Go package|[cloud.google.com/bigtable](https://godoc.org/cloud.google.com/go/bigtable)
The OpenCensus trace package|[go.opencensus.io/trace](https://godoc.org/go.opencensus.io/trace)

And when imported in code
{{<highlight go>}}
import (
    "cloud.google.com/bigtable"
    "go.opencensus.io/trace" 
)
{{</highlight>}}

#### Technical detour

Because GCS uses HTTP to connect to Google's backend, we'll need to enable metrics and tracing using a custom client
for Bigtable operations. The custom client will have an `ochttp` enabled transport and then the rest is simple

#### Enable metric reporting

To enable metric reporting/exporting, we need to enable a metrics exporter, but before that we'll need
to register and enable the views that match the HTTP metrics to collect. For a complete list of the available views
available please visit [https://godoc.org/go.opencensus.io/plugin/ochttp](https://godoc.org/go.opencensus.io/plugin/ochttp)

However, for now we'll split them into client and server views

##### Register client metric views
{{<highlight go>}}
if err := view.Register(ochttp.DefaultClientViews...); err != nil {
    log.Fatalf("Failed to register HTTP client views: %v", err)
}
{{</highlight>}}

##### Register server metric views
{{<highlight go>}}
if err := view.Register(ochttp.DefaultServerViews...); err != nil {
    log.Fatalf("Failed to register HTTP server views: %v", err)
}
{{</highlight>}}

##### Exporting traces and metrics
The last step is to enable trace and metric exporting. For that we'll use say [Stackdriver Exporter](/supported-exporters/go/stackdriver) or
any of the  [Go exporters](/supported-exporters/go/)

##### End to end code sample

With all the steps combined, we'll finally have this code snippet, adapted from [Bigtable Go helloworld](https://cloud.google.com/bigtable/docs/samples-go-hello/)

```go
package main

import (
	"context"
	"fmt"
	"log"

	"cloud.google.com/go/bigtable"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

func main() {
	projectID := "census-demos"
	instance := "census-demos"
	columnFamilyName := "cf1"
	columnName := "greeting"
	// Create the Cloud Bigtable client
	cbtClient, err := bigtable.NewAdminClient(context.Background(), projectID, instance)
	if err != nil {
		log.Fatalf("Failed to create the Cloud Bigtable client: %v", err)
	}
	defer cbtClient.Close()

	// Start: enable observability with OpenCensus tracing and metrics
	// Create the exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		MetricPrefix: "cbt",
		ProjectID:    projectID,
	})
	if err != nil {
		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
	}
	defer sd.Flush()

	// Register the exporter as a trace exporter
	trace.RegisterExporter(sd)

	// Register the exporter as a metrics exporter
	view.RegisterExporter(sd)

	// For demo purposes, always sample
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
	// End: enable observability with OpenCensus tracing and metrics

	// Now for the application code
	ctx, span := trace.StartSpan(context.Background(), "opencensus.Bigtable.Tutorial")
	defer span.End()

	adminClient, err := bigtable.NewAdminClient(ctx, projectID, instance)
	if err != nil {
		log.Fatalf("Could not create admin client: %v", err)
	}

	_, lSpan := trace.StartSpan(ctx, "ListTables")
	tables, err := adminClient.Tables(ctx)
	lSpan.End()
	if err != nil {
		log.Fatalf("Could not fetch table list: %v", err)
	}

	tableName := "names"
	if !sliceContains(tables, tableName) {
		_, ntSpan := trace.StartSpan(ctx, "CreateTable")
		log.Printf("Creating table %s", tableName)
		if err := adminClient.CreateTable(ctx, tableName); err != nil {
			ntSpan.End()
			ntSpan.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
			log.Fatalf("Could not create table %s: %v", tableName, err)
		}
		ntSpan.End()
	}

	_, tiSpan := trace.StartSpan(ctx, "TableInfo")
	tblInfo, err := adminClient.TableInfo(ctx, tableName)
	tiSpan.End()
	if err != nil {
		log.Fatalf("Could not read info for table %s: %v", tableName, err)
	}

	if !sliceContains(tblInfo.Families, columnFamilyName) {
		_, ncfSpan := trace.StartSpan(ctx, "CreateColumnFamily")
		if err := adminClient.CreateColumnFamily(ctx, tableName, columnFamilyName); err != nil {
			ncfSpan.End()
			log.Fatalf("Could not create column family %s: %v", columnFamilyName, err)
		}
		ncfSpan.End()
	}

	client, err := bigtable.NewClient(ctx, projectID, instance)
	if err != nil {
		log.Fatalf("Could not create data operations client: %v", err)
	}

	tbl := client.Open(tableName)
	muts := make([]*bigtable.Mutation, len(greetings))
	rowKeys := make([]string, len(greetings))

	log.Printf("Writing greeting rows to table")
	for i, greeting := range greetings {
		muts[i] = bigtable.NewMutation()
		muts[i].Set(columnFamilyName, columnName, bigtable.Now(), []byte(greeting))

		rowKeys[i] = fmt.Sprintf("%s%d", columnName, i)
	}

	_, wSpan := trace.StartSpan(ctx, "WriteRows")
	rowErrs, err := tbl.ApplyBulk(ctx, rowKeys, muts)
	wSpan.End()
	if err != nil {
		log.Fatalf("Could not apply bulk row mutation: %v", err)
	}
	if rowErrs != nil {
		for _, rowErr := range rowErrs {
			log.Printf("Error writing row: %v", rowErr)
		}
		log.Fatalf("Could not write some rows")
	}

	_, rSpan := trace.StartSpan(ctx, "ReadRows")
	log.Printf("Reading all greeting rows:")
	err = tbl.ReadRows(ctx, bigtable.PrefixRange(columnName), func(row bigtable.Row) bool {
		item := row[columnFamilyName][0]
		log.Printf("\t%s = %s\n", item.Row, string(item.Value))
		return true
	}, bigtable.RowFilter(bigtable.ColumnFilter(columnName)))
	rSpan.End()

	if err = client.Close(); err != nil {
		log.Fatalf("Could not close data operations client: %v", err)
	}

	_, dSpan := trace.StartSpan(ctx, "DeletingTable")
	log.Printf("Deleting the table")
	err = adminClient.DeleteTable(ctx, tableName)
	dSpan.End()
	if err != nil {
		log.Fatalf("Could not delete table %s: %v", tableName, err)
	}

	if err = adminClient.Close(); err != nil {
		log.Fatalf("Could not close admin client: %v", err)
	}
}

var greetings = []string{"Hello World!", "Hello Cloud Bigtable!", "Hello golang!"}

func sliceContains(list []string, target string) bool {
	for _, s := range list {
		if s == target {
			return true
		}
	}
	return false
}
```

#### Viewing your metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

#### Viewing your traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)
![](/images/cloud_bigtable_trace.png)
