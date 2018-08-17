---
title: "Go"
date: 2018-08-05T14:52:17-07:00
draft: false
weight: 1
---

![](/images/go-grpc-opencensus.png)

{{% notice note %}}
Before beginning, if you haven't already:

* Setup gRPC for Go by visiting this quickstart page [https://grpc.io/docs/quickstart/go.html](https://grpc.io/docs/quickstart/go.html)
* Setup [Stackdriver Tracing and Monitoring](/codelabs/stackdriver/)
{{% / notice %}}

#### Table of contents
- [Overview](#overview)
    - [Protobuf definition](#protobuf-definition)
    - [Generate the service](#generate-the-service)
- [Requirements](#requirements)
    - [Go version](#go-version)
    - [Installing gRPC for Go](#installing-grpc-for-go)
    - [Installing Protocol Buffers v3](#installing-protocol-buffers-v3)
    - [Installing the protoc plugin for Go](#installing-the-protoc-plugin-for-go)
- [Instrumentation](#instrumentation)
    - [Packages to import](#packages-to-import)
    - [Instrumenting the server](#instrumenting-the-server)
    - [Instrumenting the client](#instrumenting-the-client)
- [Examining traces](#examining-traces)
- [Examining metrics](#examining-metrics)

#### Overview

Our service takes in a payload containing bytes and capitalizes them.

Using OpenCensus, we can collect traces and metrics of our system and export them to the backend
of our choice, to give observability to our distributed systems.

The `grpc-go` implementation has already been instrumented with OpenCensus for tracing and metrics.
To enable tracing and monitoring, we'll import and use the OpenCensus gRPC plugin

To enable tracing, we'll use the following:

Package|Import path
---|---
ocgrpc|[go.opencensus.io/plugin/ocgrpc](https://godoc.org/go.opencensus.io/plugin/ocgrpc)
trace|[go.opencensus.io/trace](https://godoc.org/go.opencensus.io/trace)

and then to enable metrics, we'll use the following:

Handler|Godoc
---|---
Server handler|[go.opencensus.io/plugin/ocgrpc.ServerHandler](https://godoc.org/go.opencensus.io/plugin/ocgrpc#ServerHandler)
Client handler|[go.opencensus.io/plugin/ocgrpc.ClientHandler](https://godoc.org/go.opencensus.io/plugin/ocgrpc#ServerHandler)
Server gRPC metrics/views|[https://godoc.org/go.opencensus.io/plugin/ocgrpc#DefaultServerViews](https://godoc.org/go.opencensus.io/plugin/ocgrpc#DefaultServerViews)
Client gRPC metrics/views|[https://godoc.org/go.opencensus.io/plugin/ocgrpc#DefaultClientViews](https://godoc.org/go.opencensus.io/plugin/ocgrpc#DefaultClientViews)

#### Requirements

To be able to use gRPC with Go we'll need to have

##### Go version

Go for use with gRPC and OpenCensus is best with any version >= 1.8.

Just in case you haven't installed Go, please visit [Installing Go](https://golang.org/doc/install/)

##### Installing gRPC for Go

Please run this command
```shell
go get -u google.golang.org/grpc
```

##### Installing Protocol Buffers v3

You'll need to install the protoc compiler to generate gRPC service code.

As per [gRPC docs for Go](https://grpc.io/docs/quickstart/go.html#install-protocol-buffers-v3)

Please visit https://github.com/google/protobuf/releases for protoc binaries and select the version for your operating system.

##### Installing the protoc plugin for Go

Please run this command
```shell
go get -u github.com/golang/protobuf/protoc-gen-go
```

##### Code

Let's implement the project, let's create a directory under our `$GOPATH`

```shell
cd $GOPATH/src && mkdir -p oc.tutorials/ocgrpc && cd oc.tutorials/ocgrpc
```

and for quick reference the working directory that you'll be using is `$GOPATH/src/oc.tutorials.ocgrpc`

##### Protobuf definition

Make a directory called `rpc`
```shell
mkdir -p rpc
```

and inside it paste this protobuf definition

{{<highlight proto>}}
syntax = "proto3";

package rpc;

message Payload {
    int32 id    = 1;
    bytes data  = 2;
}

service Fetch {
    rpc Capitalize(Payload) returns (Payload) {}
}
{{</highlight>}}

##### Generate the service

```shell
protoc -I rpc rpc/defs.proto --go_out=plugins=grpc:rpc
```

which should now generate the following directory structure

```shell
ls -R
rpc

./rpc:
defs.pb.go	defs.proto
```

##### Service implementation

In order to use the gRPC service, we need to implement the server.

Create a file called `server.go` containing this code

{{<highlight go>}}
package main

import (
	"bytes"
	"context"
	"log"
	"net"

	"google.golang.org/grpc"

	"oc.tutorials/ocgrpc/rpc"
)

type fetchIt int

// Compile time assertion that fetchIt implements FetchServer.
var _ rpc.FetchServer = (*fetchIt)(nil)

func (fi *fetchIt) Capitalize(ctx context.Context, in *rpc.Payload) (*rpc.Payload, error) {
	out := &rpc.Payload{
		Data: bytes.ToUpper(in.Data),
	}
	return out, nil
}

func main() {
	addr := ":9988"
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("gRPC server: failed to listen: %v", err)
	}
	srv := grpc.NewServer()
	rpc.RegisterFetchServer(srv, new(fetchIt))
	log.Printf("fetchIt gRPC server serving at %q", addr)
	if err := srv.Serve(ln); err != nil {
		log.Fatalf("gRPC server: error serving: %v", err)
	}
}
{{</highlight>}}

which you can run by

```shell
go run server.go
```

##### Client

The client talks to the server via a gRPC channel, sending in bytes and getting back the output capitalized.

The contents of `client.go` are as below:

{{<highlight go>}}
package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"

	"google.golang.org/grpc"

	"oc.tutorials/ocgrpc/rpc"
)

func main() {
	serverAddr := ":9988"
	cc, err := grpc.Dial(serverAddr, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("fetchIt gRPC client failed to dial to server: %v", err)
	}
	fc := rpc.NewFetchClient(cc)

	fIn := bufio.NewReader(os.Stdin)
	for {
		fmt.Print("> ")
		line, _, err := fIn.ReadLine()
		if err != nil {
			log.Printf("Failed to read a line in: %v", err)
			return
		}

		ctx := context.Background()
		out, err := fc.Capitalize(ctx, &rpc.Payload{Data: line})
		if err != nil {
			log.Printf("fetchIt gRPC client got error from server: %v", err)
			continue
		}
		fmt.Printf("< %s\n\n", out.Data)
	}
}
{{</highlight>}}

and in another terminal, please run

```shell
go run client.go
```
and from typing you should be able to get back a response such as

![](/images/ocgrpc-client.png)

#### Instrumentation

To gain insights to our service, we'll add trace and metrics instrumentation as follows

##### Instrumenting the server

We'll instrument the server by tracing as well as extracting gRPC metrics using the `ServerHandler`
which will be registered as a grpc StatsHandler.

{{<tabs Traces Metrics Combined>}}
{{<highlight go>}}
import "go.opencensus.io/trace"

func (fi *fetchIt) Capitalize(ctx context.Context, in *rpc.Payload) (*rpc.Payload, error) {
	ctx, span := trace.StartSpan(ctx, "oc.tutorials.grpc.Capitalize")
	defer span.End()
	
	out := &rpc.Payload{
		Data: bytes.ToUpper(in.Data),
	}
	return out, nil
}
{{</highlight>}}

{{<highlight go>}}
import (
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
)

func main() {
	if err := view.Register(ocgrpc.DefaultServerViews...); err != nil {
		log.Fatalf("Failed to register ocgrpc server views: %v", err)
	}
	srv := grpc.NewServer(grpc.StatsHandler(&ocgrpc.ServerHandler{}))
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"bytes"
	"context"
	"log"
	"net"

	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
	"google.golang.org/grpc"

	"oc.tutorials/ocgrpc/rpc"

	// The exporter to extract our metrics and traces
	"contrib.go.opencensus.io/exporter/stackdriver"
)

type fetchIt int

// Compile time assertion that fetchIt implements FetchServer.
var _ rpc.FetchServer = (*fetchIt)(nil)

func (fi *fetchIt) Capitalize(ctx context.Context, in *rpc.Payload) (*rpc.Payload, error) {
	ctx, span := trace.StartSpan(ctx, "oc.tutorials.grpc.Capitalize")
	defer span.End()

	out := &rpc.Payload{
		Data: bytes.ToUpper(in.Data),
	}
	return out, nil
}

func main() {
	if err := view.Register(ocgrpc.DefaultServerViews...); err != nil {
		log.Fatalf("Failed to register ocgrpc server views: %v", err)
	}

	// Create and register the exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    "census-demos", // Insert your projectID here
		MetricPrefix: "ocgrpctutorial",
	})
	if err != nil {
		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
	}
	defer sd.Flush()
	trace.RegisterExporter(sd)
	view.RegisterExporter(sd)
	// For demo purposes let's always sample
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	addr := ":9988"
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("gRPC server: failed to listen: %v", err)
	}
	srv := grpc.NewServer(grpc.StatsHandler(&ocgrpc.ServerHandler{}))
	rpc.RegisterFetchServer(srv, new(fetchIt))
	log.Printf("fetchIt gRPC server serving at %q", addr)
	if err := srv.Serve(ln); err != nil {
		log.Fatalf("gRPC server: error serving: %v", err)
	}
}
{{</highlight>}}
{{</tabs>}}

##### Instrumenting the client

We'll instrument the client by tracing as well as extracting gRPC metrics using the `ClientHandler`
which will be registered as a grpc StatsHandler.

{{<tabs Traces Metrics Combined>}}
{{<highlight go>}}
import "go.opencensus.io/trace"

func main() {
		ctx, span := trace.StartSpan(context.Background(), "oc.tutorials.grpc.ClientCapitalize")
		out, err := fc.Capitalize(ctx, &rpc.Payload{Data: line})
		if err != nil {
			span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
			log.Printf("fetchIt gRPC client got error from server: %v", err)
		} else {
			fmt.Printf("< %s\n\n", out.Data)
		}
		span.End()
}
{{</highlight>}}

{{<highlight go>}}
import (
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
)

func main() {
	if err := view.Register(ocgrpc.DefaultClientViews...); err != nil {
		log.Fatalf("Failed to register ocgrpc client views: %v", err)
	}
	cc, err := grpc.Dial(serverAddr, grpc.WithInsecure(), grpc.WithStatsHandler(new(ocgrpc.ClientHandler)))
}
{{</highlight>}}

{{<highlight go>}}
package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"

	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"
	"google.golang.org/grpc"

	"oc.tutorials/ocgrpc/rpc"

	// The exporter to extract our metrics and traces
	"contrib.go.opencensus.io/exporter/stackdriver"
)

func main() {
	if err := view.Register(ocgrpc.DefaultClientViews...); err != nil {
		log.Fatalf("Failed to register ocgrpc client views: %v", err)
	}

	// Create and register the exporter
	sd, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID:    "census-demos", // Insert your projectID here
		MetricPrefix: "ocgrpctutorial",
	})
	if err != nil {
		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
	}
	defer sd.Flush()
	trace.RegisterExporter(sd)
	view.RegisterExporter(sd)
	// For demo purposes let's always sample
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	serverAddr := ":9988"
	cc, err := grpc.Dial(serverAddr, grpc.WithInsecure(), grpc.WithStatsHandler(new(ocgrpc.ClientHandler)))
	if err != nil {
		log.Fatalf("fetchIt gRPC client failed to dial to server: %v", err)
	}
	fc := rpc.NewFetchClient(cc)

	fIn := bufio.NewReader(os.Stdin)
	for {
		fmt.Print("> ")
		line, _, err := fIn.ReadLine()
		if err != nil {
			log.Printf("Failed to read a line in: %v", err)
			return
		}

		ctx, span := trace.StartSpan(context.Background(), "oc.tutorials.grpc.ClientCapitalize")
		out, err := fc.Capitalize(ctx, &rpc.Payload{Data: line})
		if err != nil {
			span.SetStatus(trace.Status{Code: trace.StatusCodeInternal, Message: err.Error()})
			log.Printf("fetchIt gRPC client got error from server: %v", err)
		} else {
			fmt.Printf("< %s\n\n", out.Data)
		}
		span.End()
	}
}
{{</highlight>}}
{{</tabs>}}

#### Examining traces
Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)

which will give visuals such as:

![Trace list](/images/ocgrpc-tutorial-overall-traces.png)

![Single trace details](/images/ocgrpc-tutorial-trace-details.png)

#### Examining metrics
Please visit [https://console.cloud.google.com/monitoring](https://console.cloud.google.com/monitoring)

which will give visuals such as:

* Available metrics
![](/images/ocgrpc-tutorial-available-metrics.png)

* Client latency
![](/images/ocgrpc-tutorial-client-latency.png)

* Server completed RPCs
![](/images/ocgrpc-tutorial-server-completed-rpcs.png)
