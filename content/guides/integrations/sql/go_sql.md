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
    - [Source code](#source-code)
    - [Running it](#running-it)
- [Examining the traces](#examining-the-traces)
- [Examining the metrics](#examining-the-metrics)
- [References](#references)

## Introduction
We have a Go "database/sql" package/wrapper that is instrumented with OpenCensus!

## Installing it
To install the ocsql "database/sql" plugin, please run
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

We can use the OpenCensus instrumented SQL driver wrapper in one of these two ways:

### By registration
This mimicks the idiomatic recommendation to use the "database/sql" package in
Go where we pass an implicitly registered driver to `sql.Open` which returns a
[\*sql.DB handle](https://golang.org/pkg/database/sql/#DB)

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
	driverName, err := ocsql.Register(ordinaryDriverName)
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
This option is useful if you'd like to be more explicit and if your database
package exports its driver implementation.

{{<highlight go>}}
package main
import (
	"log"
	"database/sql"

	sqlite3 "github.com/mattn/go-sqlite3"
	"contrib.go.opencensus.io/integrations/ocsql"
}

const driverName = "ocsql"

func main() {
	// wrap ocsql around existing database driver
	driver := ocsql.Wrap(&sqlite3.SQLiteDriver{})

	// register our ocsql wrapped driver with database/sql
	sql.Register(driverName, driver)

	// use our ocsql driver
	db, err := sql.Open(driverName, "my-sqlite.db")
	if err != nil {
		log.Fatalf("Failed to open the SQL database: %v", err)
	}
	defer db.Close()
{{</highlight>}}

#### OCSQL Trace Options

By default ocsql is conservative with what is exactly traced, e.g. by default
the actual SQL queries and named parameter values are not annotated for security
and verbosity reasons. Both `ocsql.Register` as well as `ocsql.Wrap` allow for
setting various functional `TraceOptions`. To enable all tracing options
including recording sql queries, you can use the `WithAllTraceOptions`
functional option.

{{<highlight go>}}
// by registration flow
driverName := ocsql.Register(ordinaryDriverName, ocsql.WithAllTraceOptions())

// by explicit wrapping driver e.g. sqlite3
driver := ocsql.Wrap(&sqlite3.SQLiteDriver{}, ocsql.WithAllTraceOptions())
{{</highlight>}}

#### OCSQL Metrics Options

Since Go 1.11 there is support for getting detailed insight into the DB
connection pool as provided by the `database/sql` package. To enable recording
of DB connection pool metrics at your preferred interval you can use the
`ocsql.RecordStats` function.

{{<highlight go>}}
db, err := sql.Open(driverName, "resource.db")
if err != nil {
	log.Fatalf("Failed to open the SQL database: %v", err)
}

// enable periodic recording of sql.DBStats
dbstatsCloser := ocsql.RecordStats(db, 5*time.Second)

defer func() {
	dbstatsCloser()
	db.Close()
}()
{{</highlight>}}


## Enabling OpenCensus
To examine the metrics and traces, we need to hook up our favorite Go exporters
as per the [Go exporters guides](/guides/exporters/supported-exporters/go/) e.g.

{{<highlight go>}}
func enableOpenCensusObservability(mux *http.ServeMux) (fnStop func(), err error) {
	// enable OpenCensus zPages
	zpages.Handle(mux, "/debug")

	// Enable ocsql metrics with OpenCensus
	ocsql.RegisterAllViews()

	// set up the prometheus exporter
	prometheusExporter, err := prometheus.NewExporter(prometheus.Options{})
	if err == nil {
		// On success, register it as a metrics exporter
		view.RegisterExporter(prometheusExporter)
		view.SetReportingPeriod(5 * time.Second)
		// provide /metrics endpoint for Prometheus to scrape from.
		mux.Handle("/metrics", prometheusExporter)
	}

	// For demo purposes, we'll always trace
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// set up the Zipkin exporter over HTTP transport
	reporter := httpreporter.NewReporter("http://localhost:9411/api/v2/spans")
	localEP, _ := stdzipkin.NewEndpoint(serviceName, listenAddr)
	zipkinExporter := zipkin.NewExporter(reporter, localEP)
	trace.RegisterExporter(zipkinExporter)

	var closeOnce sync.Once
	return func() {
		// flush and shutdown the Zipkin HTTP reporter
		closeOnce.Do(func() {
			reporter.Close()
		})
	}, err
}
{{</highlight>}}

## End to end example
And now to examine the exported stats and traces, let's make a simple random
name service app. For simplicity, we use a sqlite3 database and the following
exporters:

* Zipkin for trace exporting
* Prometheus for stats exporting

{{% notice tip %}}
For assistance setting up any of the exporters, please refer to:

EXPORTER   | URL
-----------|-----
Prometheus | [Prometheus codelab](/codelabs/prometheus)
Zipkin     | [Zipkin codelab](/codelabs/zipkin)

{{% /notice %}}

Please place the code below inside a `go-gettable` directory and a file
`main.go`, so
```shell
mkdir -p ocsql-e2e && touch main.go
```

### Source code

{{<highlight go>}}
package main

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"time"

	"contrib.go.opencensus.io/integrations/ocsql"
	_ "github.com/mattn/go-sqlite3"
	stdzipkin "github.com/openzipkin/zipkin-go"
	httpreporter "github.com/openzipkin/zipkin-go/reporter/http"
	"go.opencensus.io/exporter/prometheus"
	"go.opencensus.io/exporter/zipkin"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
	"go.opencensus.io/zpages"
)

const (
	serviceName = "ocsql-demo"
	listenAddr  = "0.0.0.0:8889"
)

func main() {
	mux := http.NewServeMux()

	ocCloser, err := enableOpenCensusObservability(mux)
	if err != nil {
		log.Fatalf("Failed to enable OpenCensus observability: %v", err)
	}
	defer ocCloser()

	// for this demo enable all ocsql trace options
	driverName, err := ocsql.Register("sqlite3", ocsql.WithAllTraceOptions())
	if err != nil {
		log.Fatalf("Failed to register the ocsql driver: %v", err)
	}

	// allow multiple connections to use same in-memory database
	db, err := sql.Open(driverName, "file::memory:?mode=memory&cache=shared")
	if err != nil {
		log.Fatalf("Failed to open the SQL database: %v", err)
	}
	defer db.Close()

	// record DB connection pool statistics
	dbStatsCloser := ocsql.RecordStats(db, 5*time.Second)
	defer dbStatsCloser()

	// populate our in-memory database
	if err = populateDatabase(context.Background(), db); err != nil {
		log.Printf("Unable to populate database: %v", err)
		return
	}

	// add a HTTP Handler serving a random person lookup
	mux.HandleFunc("/", randomLookup(db))

	// enable ochttp on our HTTP Server
	srv := &http.Server{
		Addr:    listenAddr,
		Handler: &ochttp.Handler{Handler: mux},
	}

	// use interupt signal for graceful shutdown
	go signalHandler(srv)

	// start HTTP server
	if err := srv.ListenAndServe(); err != nil {
		log.Printf("HTTP server ListenAndServe: %v", err)
	}
}

func populateDatabase(ctx context.Context, db *sql.DB) (err error) {
	ctx, span := trace.StartSpan(context.Background(), "PopulateDatabase")
	defer func() {
		if err != nil {
			span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		}
		span.End()
	}()

	if err = createTable(ctx, db); err != nil {
		return err
	}

	if err = insertNames(ctx, db); err != nil {
		return err
	}

	return nil
}

func createTable(ctx context.Context, db *sql.DB) error {
	ctx, span := trace.StartSpan(ctx, "CreateTable")
	defer span.End()

	_, err := db.ExecContext(ctx, `
		CREATE TABLE names(
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			first VARCHAR(256),
			last VARCHAR(256)
		)`,
	)
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		err = errors.New("Unable to create table")
	}
	return nil
}

func insertNames(ctx context.Context, db *sql.DB) error {
	ctx, span := trace.StartSpan(ctx, "InsertNames")
	defer span.End()

	stmt, err := db.PrepareContext(ctx, `INSERT INTO names (first, last) VALUES (?, ?)`)
	if err != nil {
		span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
		return errors.New("Unable to prepare statement")
	}
	defer stmt.Close()

	for _, person := range []struct {
		first string
		last  string
	}{
		{"Herman", "Fleming"}, {"Katrina", "Schwartz"}, {"Manuel", "Wade"},
		{"Rosa", "Rogers"}, {"Regina", "Rodriquez"}, {"Charles", "Kelly"},
		{"Roosevelt", "Palmer"}, {"Isabel", "Ingram"}, {"Francis", "Drake"},
		{"Amy", "Gibson"}, {"Terry", "Moody"}, {"Iris", "Oliver"},
		{"Karl", "Peterson"}, {"Susie", "Gordon"}, {"Glenda", "Craig"},
		{"Leona", "Wright"}, {"Nadine", "Marsh"}, {"Erma", "Burke"},
		{"Jill", "Horton"}, {"Luther", "Roberson"}, {"Rogelio", "Hunt"},
		{"Brett", "Meyer"}, {"Dave", "Rodgers"}, {"Raymond", "Gonzalez"},
		{"Sheryl", "Hernandez"}, {"Myra", "Bass"}, {"Jonathon", "Pierce"},
		{"Stephen", "Mccarthy"}, {"Marshall", "Vaughn"}, {"Gene", "Weber"},
		{"Pamela", "Lloyd"}, {"Dennis", "Romero"}, {"Julius", "Cruz"},
		{"Alice", "Dean"}, {"Mildred", "Bush"}, {"Amos", "Caldwell"},
		{"Amelia", "Lamb"}, {"Sophie", "Guzman"}, {"Anthony", "Leonard"},
		{"Adam", "Parks"}, {"Arlene", "Reynolds"}, {"Sandy", "Jones"},
		{"Sabrina", "Castro"}, {"Horace", "Fuller"}, {"Kelly", "Owens"},
		{"Alberto", "Sparks"}, {"Monica", "Mendez"}, {"Ernesto", "Wilkins"},
		{"Angela", "Johnson"}, {"Kimberly", "Foster"}, {"Molly", "Higgins"},
		{"Jason", "Mcbride"}, {"Gladys", "Edwards"}, {"Sylvester", "Roberts"},
		{"Aubrey", "Day"}, {"Ed", "Zimmerman"}, {"Bruce", "Carter"},
		{"Tonya", "Fisher"}, {"Rodolfo", "Curry"}, {"Lucille", "Valdez"},
		{"Maryann", "Mathis"}, {"Gilberto", "Miller"}, {"Neil", "Evans"},
		{"Essie", "Hill"}, {"Omar", "Cummings"}, {"Jessica", "Diaz"},
		{"Emma", "Vega"}, {"Jordan", "Silva"}, {"Kendra", "Mcdaniel"},
		{"Dale", "Gomez"}, {"Misty", "Harvey"}, {"Francis", "Ortiz"},
		{"Audrey", "Collins"}, {"Salvatore", "Tucker"}, {"Olga", "Flowers"},
		{"Jeff", "Turner"}, {"Darla", "Hoffman"}, {"Wade", "Dennis"},
		{"Spencer", "Parsons"}, {"Jorge", "Holland"}, {"Vickie", "Martin"},
		{"Myron", "Frazier"}, {"Alejandro", "Snyder"}, {"Daisy", "Flores"},
		{"Christy", "Thompson"}, {"Marcus", "Parker"}, {"Amanda", "Carson"},
		{"Bob", "Walters"}, {"Taylor", "Gregory"}, {"Lauren", "Lambert"},
		{"Ruby", "Gonzales"}, {"Stacey", "Park"}, {"Jo", "Baker"},
		{"Gloria", "Luna"}, {"Raul", "Ryan"}, {"Denise", "Kim"},
		{"Paul", "Black"}, {"Lynette", "Barton"}, {"Evan", "Logan"},
		{"Ryan", "Brady"},
	} {
		rs, err := stmt.ExecContext(ctx, person.first, person.last)
		if err != nil {
			span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
			return errors.New("Unable to insert person")
		}

		id, err := rs.LastInsertId()
		if err != nil {
			span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
			return errors.New("Unable to retrieve insert id")
		}

		log.Printf("Successfully inserted #%d\n", id)
	}

	return nil
}

func randomLookup(db *sql.DB) http.HandlerFunc {
	rand.Seed(time.Now().UnixNano())

	type person struct {
		ID    int
		First string
		Last  string
	}

	return func(w http.ResponseWriter, r *http.Request) {
		ctx, span := trace.StartSpan(r.Context(), "Find")
		// we only have 100 records so we'll have some StatusNotFound returns.
		id := rand.Intn(120)
		row := db.QueryRowContext(ctx, `SELECT * from names where id=?`, id)
		span.End()

		var p person
		if err := row.Scan(&p.ID, &p.First, &p.Last); err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Record not found", http.StatusNotFound)
				span.SetStatus(trace.Status{Code: trace.StatusCodeNotFound})
				return
			}
			log.Printf("Failed to fetch row: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			span.SetStatus(trace.Status{Code: trace.StatusCodeUnknown, Message: err.Error()})
			return
		}
		fmt.Fprintf(w, "Randomly picked record: %v", p)
	}
}

func enableOpenCensusObservability(mux *http.ServeMux) (fnStop func(), err error) {
	// enable OpenCensus zPages
	zpages.Handle(mux, "/debug")

	// Enable ocsql metrics with OpenCensus
	ocsql.RegisterAllViews()

	// set up the prometheus exporter
	prometheusExporter, err := prometheus.NewExporter(prometheus.Options{})
	if err == nil {
		// On success, register it as a metrics exporter
		view.RegisterExporter(prometheusExporter)
		view.SetReportingPeriod(5 * time.Second)
		// provide /metrics endpoint for Prometheus to scrape from.
		mux.Handle("/metrics", prometheusExporter)
	}

	// For demo purposes, we'll always trace
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	// set up the Zipkin exporter over HTTP transport
	reporter := httpreporter.NewReporter("http://localhost:9411/api/v2/spans")
	localEP, _ := stdzipkin.NewEndpoint(serviceName, listenAddr)
	zipkinExporter := zipkin.NewExporter(reporter, localEP)
	trace.RegisterExporter(zipkinExporter)

	var closeOnce sync.Once
	return func() {
		// flush and shutdown the Zipkin HTTP reporter
		closeOnce.Do(func() {
			reporter.Close()
		})
	}, err
}

func signalHandler(srv *http.Server) {
	sigint := make(chan os.Signal, 1)
	signal.Notify(sigint, os.Interrupt)
	<-sigint

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("HTTP server Shutdown: %v", err)
	}
}
{{</highlight>}}

For Prometheus to scrape the data from your service you will need to update its
`config.yaml` with something like this:

```yaml
scrape_configs:
  - job_name: 'ocsqlmetricstutorial'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8889']
```

### Running it

Make sure Zipkin is running by either starting the docker container or if
running locally doing something like this:

```shell
# download latest version of Zipkin
curl -sSL https://zipkin.io/quickstart.sh | bash -s
# run the binary release
java -jar zipkin.jar
```

Also make sure Prometheus is running with the scrape_config pointing towards
the service's /metrics endpoint.

```shell
prometheus --config.file=config.yaml
```

Now you can run the above application

```shell
go run main.go
```

The application will first create a database schema and load up 100 names. To
see the names be served up randomly, visit: http://localhost:8889/random

![Random example](/images/ocsql-random.png)

## Examining the traces
On visiting http://localhost:9411 we can see something similar to below:

![Traces list](/images/ocsql-trace-all.png)

and on clicking to get details about the most recent trace

![Detailed trace 1](/images/ocsql-trace-detail-1.png)
![Detailed trace 2](/images/ocsql-trace-detail-2.png)

## Examining the metrics
With Prometheus running, we can navigate to the Prometheus UI at http://localhost:9090/graph
you should be able to see such visuals

* All metrics
![](/images/ocsql-metrics-all.png)

* Latency buckets
![](/images/ocsql-metrics-latency-bucket.png)

* Calls
![](/images/ocsql-metrics-calls.png)

* sql/database connection pool
![](/images/ocsql-metrics-db-conn-pool-1.png)
![](/images/ocsql-metrics-db-conn-pool-2.png)

## References

Resource|URL
---|---
GoDoc|[contrib.go.opencensus.io/integrations/ocsql](https://godoc.org/contrib.go.opencensus.io/integrations/ocsql)
Medium blogpost|[OpenCensus and Go database/sql by Bas van Beek](https://medium.com/@bas.vanbeek/opencensus-and-go-database-sql-322a26be5cc5)
