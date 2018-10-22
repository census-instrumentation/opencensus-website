---
title: "Go"
date: 2018-08-22T03:11:37-07:00
draft: false
aliases: [/integrations/sql/go]
logo: /img/sql-gopher.png
---

- [Introduction](#Introduction)
- [Installing it](#installing-it)
- [Using it](#using-it)
  - [By registration](#by-registration)
  - [By wrapping](#by-explicitly-wrapping-your-driver)
- [Enabling OpenCensus](#enabling-opencensus)
- [End to end example](#end-to-end-example)
- [Examining the traces](#examining-the-traces)
- [References](#references)

## Introduction
We have a Go "database/sql" package/wrapper that is trace instrumented with OpenCensus!

## Installing it
To install the "database/sql" plugin, please run
```shell
go get -u -v contrib.go.opencensus.io/integrations/ocsql
```

## Using it
Given this simple initialization of a database/sql instance in Go:

{{<highlight go>}}
package main

import (
	"database/sql"
	"log"
)

func main() {
	var ordinaryDriverName string // For example "mysql", "sqlite3" etc.
	db, err := sql.Open(ordinaryDriverName, "resource.db")
	if err != nil {
		log.Fatalf("Failed to open the SQL database: %v", err)
	}
	defer db.Close()
}
{{</highlight>}}

We can use the OpenCensus trace-instrumented SQL driver wrapper in one of these two ways:

### By registration
This mimicks the idiomatic recommendation to use the "database/sql" package in Go where
we pass an implicitly registered driver to `sql.Open` which returns a [\*sql.DB handle](https://golang.org/pkg/database/sql/#DB)

{{<highlight go>}}
package main

import (
	"database/sql"
	"log"

	"contrib.go.opencensus.io/integrations/ocsql"
)

func main() {
	var ordinaryDriverName string // For example "mysql", "sqlite3" etc.
	// First step is to register the driver and
	// then reuse that driver name while invoking sql.Open
	driverName, err := ocsql.Register(ordinaryDriverName, ocsql.WithAllTraceOptions())
	if err != nil {
		log.Fatalf("Failed to register the ocsql driver: %v", err)
	}
	db, err := sql.Open(driverName, "resource.db")
	if err != nil {
		log.Fatalf("Failed to open the SQL database: %v", err)
	}
	defer db.Close()
}
{{</highlight>}}

### By explicitly wrapping your driver
This option is useful if you'd like to be more explicit and if your database package exports
its driver implementation.

{{<highlight go>}}
package main

import "contrib.go.opencensus.io/integrations/ocsql"

func main() {
	db := ocsql.Wrap(&theDBObjectInstance{}, ocsql.WithAllTraceOptions())
	_ = db
}
{{</highlight>}}

## Enabling OpenCensus
To examine the traces, we need to hook up our favorite Go exporter as per the [Go exporters guides](/guides/exporters/supported-exporters/go/)

## End to end example
And now to examine the exported traces, let's make a simple name registry app.
For simplicitly, we use a sqlite3 database. To examine our traces, we'll use Jaeger.
{{% notice tip %}}
For assistance setting up Jaeger, [Click here](/codelabs/jaeger) for a guided codelab.
{{% /notice %}}

Please place the code below inside a `go-gettable` directory and a file `main.go`, so
```shell
mkdir -p ocsql-e2e && touch main.go
```

{{<highlight go>}}
package main

import (
	"context"
	"database/sql"
	"log"
	"time"

	"contrib.go.opencensus.io/integrations/ocsql"
	"go.opencensus.io/exporter/jaeger"
	"go.opencensus.io/trace"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	if err := enableOpenCensusTracingAndExporting(); err != nil {
		log.Fatalf("Failed to enable OpenCensus tracing and exporting: %v", err)
	}

	driverName, err := ocsql.Register("sqlite3", ocsql.WithAllTraceOptions())
	if err != nil {
		log.Fatalf("Failed to register the ocsql driver: %v", err)
	}
	db, err := sql.Open(driverName, "resource.db")
	if err != nil {
		log.Fatalf("Failed to open the SQL database: %v", err)
	}
	defer func() {
		db.Close()
		// Wait to 4 seconds so that the traces can be exported
		waitTime := 4 * time.Second
		log.Printf("Waiting for %s seconds to ensure all traces are exported before exiting", waitTime)
		<-time.After(waitTime)
	}()

	ctx, span := trace.StartSpan(context.Background(), "NamesRegistryApp")
	defer span.End()

	cCtx, cSpan := trace.StartSpan(ctx, "CreateTable")
	_, err = db.ExecContext(cCtx, `CREATE TABLE names(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first VARCHAR(256),
            last VARCHAR(256)
        )`)
	cSpan.End()

	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		log.Fatalf("Failed to create table: %v", err)
	}

	defer func() {
		// And for the cleanup
		_, err = db.ExecContext(ctx, `DROP TABLE names`)
		if err != nil {
			log.Fatalf("Failed to delete the row: %v", err)
		}
	}()

	iCtx, iSpan := trace.StartSpan(ctx, "InsertNames")
	rs, err := db.ExecContext(iCtx, `INSERT INTO names(first, last) VALUES (?, ?)`, "JANE", "SMITH")
	iSpan.End()
	if err != nil {
		log.Fatalf("Failed to insert values into tables: %v", err)
	}

	id, err := rs.LastInsertId()
	if err != nil {
		log.Fatalf("Failed to retrieve lastInserted ID: %v", err)
	}

	fCtx, fSpan := trace.StartSpan(ctx, "Find")
	row := db.QueryRowContext(fCtx, `SELECT * from names where id=?`, id)
	fSpan.End()
	type name struct {
		Id          int
		First, Last string
	}
	n1 := new(name)
	if err := row.Scan(&n1.Id, &n1.First, &n1.Last); err != nil {
		log.Fatalf("Failed to fetch row: %v", err)
	}
	log.Printf("Got back: %+v\n", n1)
}

func enableOpenCensusTracingAndExporting() error {
	// For demo purposes, we'll always trace
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	je, err := jaeger.NewExporter(jaeger.Options{
		AgentEndpoint: "localhost:6831",
		Endpoint:      "http://localhost:14268",
		ServiceName:   "ocsql-demo",
	})
	if err == nil {
		// On success, register it as a trace exporter
		trace.RegisterExporter(je)
	}

	return err
}
{{</highlight>}}

## Examine the traces
On visiting http://localhost:16686/ we can see something similar to below:

![Traces list](/img/ocsql-all-traces.png)

and on clicking to get details about the most recent trace

![Detailed trace](/img/ocsql-detailed-trace.png)

## References
Reference|URL
---|---
GoDoc|[contrib.go.opencensus.io/integrations/ocsql](https://godoc.org/contrib.go.opencensus.io/integrations/ocsql)
Medium blogpost|[OpenCensus and Go database/sql by Bas van Beek](https://medium.com/@bas.vanbeek/opencensus-and-go-database-sql-322a26be5cc5)
