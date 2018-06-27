+++
Description = "go grpc"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
title = "OpenCensus for Go gRPC"
date = "2018-05-31T11:12:41-05:00"
+++

In this tutorial, we’ll examine how to use OpenCensus in your gRPC projects in the Go programming language for observability both into your server and then client! We’ll then examine how we can integrate with OpenCensus exporters from AWS X-Ray, Prometheus, Zipkin and Google Stackdriver Tracing and Monitoring.  

---

gRPC is a modern high performance framework for remote procedure calls, powered by Protocol Buffer encoding. It is polyglot in nature, accessible and useable on a variety of environments ranging from mobile mobile devices, general purpose computers to data centres for distributed computing, and it is implemented in a variety of languages: Go, Java, Python, C/C++, Node.js, Ruby, PHP. See [gRPC homepage](https://grpc.io/).  

OpenCensus is a modern observability framework for distributed tracing and monitoring across microservices and monoliths alike. It is polyglot in nature, accessible and useable too on a variety of environments from mobile devices, general purpose computers and data centres for distributed computing and it is implemented in a plethora of languages: Go, Java, Python, C++, Node.js, Ruby, PHP, C# (coming soon).

Go is a modern programming language that powers the cloud as well as modern systems programming, making it easy to build simple, reliable and efficient software. It is a cross platform, fast, statically typed and a simple language. See [golang.org](https://golang.org).  

With the above three introductory paragraphs, perhaps you already noticed the common themes: high performance, distributed computing, modern nature, cross platform, simplicity, reliability — those points make the three a match #compatibility, hence the motivation for this tutorial/article.  

---

For this tutorial, we have a company’s service that’s in charge of capitalizing letters sent in from various clients and internal microservices using gRPC.  

To use gRPC, we firstly need to create Protocol Buffer definitions and from those, use the Protocol Buffer compiler with the gRPC plugin to generate code stubs. If you need to take a look at the pre-requisites or a primer into gRPC, please check out the docs at [grpc.io/docs/](https://grpc.io/docs/).

Our service takes in a payload with bytes, and then capitalizes them on the server.  
							
```
syntax = "proto3";

package rpc;

message Payload {
   int32 id    = 1;
   bytes data  = 2;
}

service Fetch {
   rpc Capitalize(Payload) returns (Payload) {}
}
```

{{< sc_center >}}Payload Message and Fetch service{{< /sc_center >}}  

To generate code, we’ll firstly put our definition in a file called “defs.proto” and move it into our “rpc” directory and then run this command to generate gRPC code stubs in Go, using this Makefile below: 

```
protoc:
protoc -I rpc rpc/defs.proto --go_out=plugins=grpc:rpc
```

{{< sc_center >}}Makefile{{< /sc_center >}}  

`make` should then generate code that’ll make the directory structure look like this  

```
|-rpc/
   |-defs.proto
   |-defs.pb.go
```
After the code generation, we now need to add the business logic into the server  

---

### Plain Server  

Our server’s sole purpose is to capitalize content sent in and send it back to the client. With gRPC, as previously mentioned, the protoc plugin generated code for a server interface. This allows you create your own custom logic of operation, as we shall do below with a custom object that implements the `Capitalize`method.  

```							
package main

import (
	"bytes"
	"context"
	"log"
	"net"

	"google.golang.org/grpc"

	"./rpc"
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
```

{{< sc_center >}}server.go{{< /sc_center >}}  

With that, we can now monetize access to generate money $$$. In order to accomplish that though, we need to create clients that speak gRPC and for that please see below:  

---

### Plain Client  

Our client makes a request to the gRPC server above, sending content that then gets capitalized and printed to our screen. It is interactive and can be run simply by `go run client.go`.
							
```
package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os"

	"google.golang.org/grpc"

	"./rpc"
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
			log.Fatalf("Failed to read a line in: %v", err)
		}

		ctx := context.Background()
		out, err := fc.Capitalize(ctx, &amp;rpc.Payload{Data: line})
		if err != nil {
			log.Printf("fetchIt gRPC client got error from server: %v", err)
			continue
		}
		fmt.Printf("&lt; %s\n\n", out.Data)
	}
}
```

which when run interactively, will look like this  

![image - interactive response from the client](https://cdn-images-1.medium.com/max/800/1*rvkG7rff2y5Diy-64j74DQ.png "interactive response from the client")
{{< sc_center >}}interactive response from the client{{< /sc_center >}}  

And now that we have a client, we are open for business!!  

---

### Aftermath  

It’s been 1 hour since launch. Tech blogs and other programmers are sharing news of our service all over their internet and social media; our service just got so popular and is being talked about all around the business world too, high fives are shared and congrats shared — after this celebration, we all go back home and call it a night. It’s the latest and greatest API in the world, it is off the charts, customers from all over the world come in, what could go wrong?  

It hits 3AM and our servers start getting over loaded. Response time degrades overall for everyone. This however is only noticed after one of the engineers tried to give a demo to their family that they restlessly awoke at 2:00AM due to excitement, but the service is taking 15ms to give back a response. In normal usage, we saw about at most 1ms response time. What is causing the sluggishness of the system? When did our service start getting slow? What is the solution? Throw more servers at it? How many servers should we throw at it? How do we know what is going wrong? When? How can the engineering and business teams figure out what to optimize or budget for? How can we tell we’ve successfully optimized the system and removed bottlenecks?  

In comes in OpenCensus: OpenCensus is a single distribution of libraries for distributed tracing and monitoring for modern and distributed systems. OpenCensus can help answer mostly all of those questions that we asked. By “mostly”, I mean that it can answer the observability related questions such as: When did the latency increase? Why? How did it increase? By how much? What part of the system is the slowest? How can we optimize and assert successful changes?  

OpenCensus is simple to integrate and use, it adds very low latency to your applications and it is already integrated into both gRPC and HTTP transports.  

OpenCensus allows you to trace and measure once and then export to a variety of backends like Prometheus, AWS X-Ray, Stackdriver Tracing and Monitoring, Jaeger, Zipkin etc. With that mentioned, let’s get started.  

### Part 1: observability by instrumenting the server  

To collect statistics from gRPC servers, OpenCensus is already integrated with gRPC out of the box, and one just has to import `go.opencensus.io/plugin/ocgrpc`. And then also subscribe to the gRPC server views. This amounts to a 7 line change  
							
```
10a11,13
> 	"go.opencensus.io/plugin/ocgrpc"
> 	"go.opencensus.io/stats/view"
> 
32c35,38
< 	srv := grpc.NewServer()
---
> 	if err := view.Register(ocgrpc.DefaultServerViews...); err != nil {
> 		log.Fatalf("Failed to register gRPC server views: %v", err)
> 	}
> 	srv := grpc.NewServer(grpc.StatsHandler(new(ocgrpc.ServerHandler)))
```

and then to trace the application, we’ll start a span on entering the function, then end it on exiting. This amounts to a 7 line change too  
							
```
12a13
> 	"go.opencensus.io/trace"
22a24,29
> 	_, span := trace.StartSpan(ctx, "(*fetchIt).Capitalize")
> 	defer span.End()
> 
> 	span.Annotate([]trace.Attribute{
> 		trace.Int64Attribute("len", int64(len(in.Data))),
> 	}, "Data in")
```
							
In the tracing, notice the `trace.StartSpan(ctx, "(*fetchIt).Capitalize")`? We take a `context.Context`as the first argument, to use context propagation which carries over RPC specific information about a request to uniquely identify it.  

### How do we examine that “observability”?  
&nbsp;  

Now that we’ve got tracing and monitoring in, let’s export that data out. Earlier on, I made claims that with OpenCensus you collect and trace once, then export to a variety of backends, simulatenously. Well, it is time for me to walk that talk!  

To do that, we’ll need to use the exporter integrations in our app to send data to our favorite backends: AWS X-Ray, Prometheus, Stackdriver Tracing and Monitoring  

```
7a8
> 	"net/http"
10a12,14
> 	xray "github.com/census-instrumentation/opencensus-go-exporter-aws"
> 	"go.opencensus.io/exporter/prometheus"
> 	"go.opencensus.io/exporter/stackdriver"
12a17
> 	"go.opencensus.io/trace"
22a28,33
> 	_, span := trace.StartSpan(ctx, "(*fetchIt).Capitalize")
> 	defer span.End()
> 
> 	span.Annotate([]trace.Attribute{
> 		trace.Int64Attribute("len", int64(len(in.Data))),
> 	}, "Data in")
40a52,56
> 
> 	// OpenCensus exporters
> 	createAndRegisterExporters()
> 
> 	// Finally serve
44a61,97
> 
> func createAndRegisterExporters() {
> 	// For demo purposes, set this to always sample.
> 	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
> 	// 1. Prometheus
> 	prefix := "fetchit"
> 	pe, err := prometheus.NewExporter(prometheus.Options{
> 		Namespace: prefix,
> 	})
> 	if err != nil {
> 		log.Fatalf("Failed to create Prometheus exporter: %v", err)
> 	}
> 	view.RegisterExporter(pe)
> 	// We need to expose the Prometheus collector via an endpoint /metrics
> 	go func() {
> 		mux := http.NewServeMux()
> 		mux.Handle("/metrics", pe)
> 		log.Fatal(http.ListenAndServe(":9888", mux))
> 	}()
> 
> 	// 2. AWS X-Ray
> 	xe, err := xray.NewExporter(xray.WithVersion("latest"))
> 	if err != nil {
> 		log.Fatalf("Failed to create AWS X-Ray exporter: %v", err)
> 	}
> 	trace.RegisterExporter(xe)
> 
> 	// 3. Stackdriver Tracing and Monitoring
> 	se, err := stackdriver.NewExporter(stackdriver.Options{
> 		MetricPrefix: prefix,
> 	})
> 	if err != nil {
> 		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
> 	}
> 	view.RegisterExporter(se)
> 	trace.RegisterExporter(se)
> }
```

to finally give this code  
							
```
package main

import (
	"bytes"
	"context"
	"log"
	"net"
	"net/http"

	"google.golang.org/grpc"

	xray "github.com/census-instrumentation/opencensus-go-exporter-aws"
	"go.opencensus.io/exporter/prometheus"
	"go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"

	"./rpc"
)

type fetchIt int

// Compile time assertion that fetchIt implements FetchServer.
var _ rpc.FetchServer = (*fetchIt)(nil)

func (fi *fetchIt) Capitalize(ctx context.Context, in *rpc.Payload) (*rpc.Payload, error) {
	_, span := trace.StartSpan(ctx, "(*fetchIt).Capitalize")
	defer span.End()

	span.Annotate([]trace.Attribute{
		trace.Int64Attribute("len", int64(len(in.Data))),
	}, "Data in")
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
	if err := view.Register(ocgrpc.DefaultServerViews...); err != nil {
		log.Fatalf("Failed to register gRPC server views: %v", err)
	}
	srv := grpc.NewServer(grpc.StatsHandler(new(ocgrpc.ServerHandler)))
	rpc.RegisterFetchServer(srv, new(fetchIt))
	log.Printf("fetchIt gRPC server serving at %q", addr)

	// OpenCensus exporters
	createAndRegisterExporters()

	// Finally serve
	if err := srv.Serve(ln); err != nil {
		log.Fatalf("gRPC server: error serving: %v", err)
	}
}

func createAndRegisterExporters() {
	// For demo purposes, set this to always sample.
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
	// 1. Prometheus
	prefix := "fetchit"
	pe, err := prometheus.NewExporter(prometheus.Options{
		Namespace: prefix,
	})
	if err != nil {
		log.Fatalf("Failed to create Prometheus exporter: %v", err)
	}
	view.RegisterExporter(pe)
	// We need to expose the Prometheus collector via an endpoint /metrics
	go func() {
		mux := http.NewServeMux()
		mux.Handle("/metrics", pe)
		log.Fatal(http.ListenAndServe(":9888", mux))
	}()

	// 2. AWS X-Ray
	xe, err := xray.NewExporter(xray.WithVersion("latest"))
	if err != nil {
		log.Fatalf("Failed to create AWS X-Ray exporter: %v", err)
	}
	trace.RegisterExporter(xe)

	// 3. Stackdriver Tracing and Monitoring
	se, err := stackdriver.NewExporter(stackdriver.Options{
		MetricPrefix: prefix,
	})
	if err != nil {
		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
	}
	view.RegisterExporter(se)
	trace.RegisterExporter(se)
}
```

{{< sc_center >}}OpenCensus instrumented server.go{{< /sc_center >}}


and with the following variables set in our environment  

`AWS_REGION=region` 

`AWS_ACCESS_KEY_ID=keyID` 

`AWS_SECRET_ACCESS_KEY=key` 

`GOOGLE_APPLICATION_CREDENTIALS=credentials.json` 

as well as our prometheus.yml file  
							
```
global:
  scrape_interval: 10s

  external_labels:
    monitor: 'media_search' 

scrape_configs:
  - job_name: 'media_search'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:9888', 'localhost:9988', 'localhost:9989']
```
							
`prometheus --config.file=prometheus.yml` 

`go run server.go` 

`2018/05/12 11:40:17 fetchIt gRPC server serving at ":9988"` 

### Monitoring results

![image - Prometheus latency bucket examinations](https://cdn-images-1.medium.com/max/800/1*29bVdvaQxMH9_c34gkUJcw.png "Prometheus latency bucket examinations")
{{< sc_center >}}Prometheus latency bucket examinations{{< /sc_center >}}

![image - Prometheus completed_rpcs examination](https://cdn-images-1.medium.com/max/800/1*iV9rSPvDjUaWeMJQ756oYQ.png "Prometheus completed_rpcs examination")
{{< sc_center >}}Prometheus completed_rpcs examination{{< /sc_center >}}

![image - Prometheus sent_bytes_per_rpc_bucket examination](https://cdn-images-1.medium.com/max/800/1*R-_OpHEDyHe2VL7r3-vcIw.png "Prometheus sent_bytes_per_rpc_bucket examination")
{{< sc_center >}}Prometheus sent_bytes_per_rpc_bucket examination{{< /sc_center >}}

![image - Stackdriver Monitoring completed_rpcs examination](https://cdn-images-1.medium.com/max/800/1*pEwlM76GW5gJbZbWTUD5Cw.png "Stackdriver Monitoring completed_rpcs examination")
{{< sc_center >}}Stackdriver Monitoring completed_rpcs examination{{< /sc_center >}}

![image - Stackdriver Monitoring server_latency examination](https://cdn-images-1.medium.com/max/800/1*bON1bvwFXxpDNEVABQ-UZQ.png "Stackdriver Monitoring server_latency examination")
{{< sc_center >}}Stackdriver Monitoring server_latency examination{{< /sc_center >}}

### Tracing results

![image - Common case: low latency on the server](https://cdn-images-1.medium.com/max/800/1*5gACz0J1DifcjZdQBoFXQQ.png "Common case: low latency on the server")
{{< sc_center >}}Common case: low latency on the server{{< /sc_center >}}

![image - Postulation: pathological case of inbound network congestion](https://cdn-images-1.medium.com/max/800/1*BqjljxH73vuQYoLY6mQ5yg.png "Postulation: pathological case of inbound network congestion")
{{< sc_center >}}Postulation: pathological case of inbound network congestion{{< /sc_center >}}

![image - Postulation: pathological case of outbound network congestion](https://cdn-images-1.medium.com/max/800/1*CJUF7vKUFN8-vk1EzYGf7w.png "Postulation: pathological case of outbound network congestion")
{{< sc_center >}}Postulation: pathological case of outbound network congestion{{< /sc_center >}}

![image - Stackdriver Trace — common case, fast response, low latency](https://cdn-images-1.medium.com/max/800/1*FRS-wp8mgrV08-iQCfomyg.png "Stackdriver Trace — common case, fast response, low latency")
{{< sc_center >}}Stackdriver Trace — common case, fast response, low latency{{< /sc_center >}}

![image - Postulation: system overload on server hence long time for bytes.ToUpper to return](https://cdn-images-1.medium.com/max/800/1*ghEB4UJ2_qIjZt2esz2anw.png "Postulation: system overload on server hence long time for bytes.ToUpper to return")
{{< sc_center >}}Postulation: system overload on server hence long time for bytes.ToUpper to return{{< /sc_center >}}

![image - Postulation: outbound network congestion](https://cdn-images-1.medium.com/max/800/1*-JN7dtnP83fpw8oQ7WtVkA.png "Postulation: outbound network congestion")
{{< sc_center >}}Postulation: outbound network congestion{{< /sc_center >}}

![image - Postulation: inbound network congestion](https://cdn-images-1.medium.com/max/800/1*Q0JmvVQ_yu2nsfhzBnWPiQ.png "Postulation: inbound network congestion")
{{< sc_center >}}Postulation: inbound network congestion{{< /sc_center >}}

---

### Part 2: observability by instrumenting the client  
&nbsp;  

And then for client monitoring, we’ll just do the same thing for gRPC stats handler except using the ClientHandler and then also start and stop a trace and that’s it, collectively giving this diff below  
							
```
7a8
> 	"net/http"
11a13,19
> 	xray "github.com/census-instrumentation/opencensus-go-exporter-aws"
> 	"go.opencensus.io/exporter/prometheus"
> 	"go.opencensus.io/exporter/stackdriver"
> 	"go.opencensus.io/plugin/ocgrpc"
> 	"go.opencensus.io/stats/view"
> 	"go.opencensus.io/trace"
> 
17c25
< 	cc, err := grpc.Dial(serverAddr, grpc.WithInsecure())
---
> 	cc, err := grpc.Dial(serverAddr, grpc.WithInsecure(), grpc.WithStatsHandler(new(ocgrpc.ClientHandler)))
22a31,38
> 	// OpenCensus exporters for the client since disjoint
> 	// and your customers will usually want to have their
> 	// own statistics too.
> 	createAndRegisterExporters()
> 	if err := view.Register(ocgrpc.DefaultClientViews...); err != nil {
> 		log.Fatalf("Failed to register gRPC client views: %v", err)
> 	}
> 
31c47
< 		ctx := context.Background()
---
> 		ctx, span := trace.StartSpan(context.Background(), "Client.Capitalize")
32a49
> 		span.End()
39c56,93
< }
\ No newline at end of file
---
> }
> 
> func createAndRegisterExporters() {
> 	// For demo purposes, set this to always sample.
> 	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
> 	// 1. Prometheus
> 	prefix := "fetchit"
> 	pe, err := prometheus.NewExporter(prometheus.Options{
> 		Namespace: prefix,
> 	})
> 	if err != nil {
> 		log.Fatalf("Failed to create Prometheus exporter: %v", err)
> 	}
> 	view.RegisterExporter(pe)
> 	// We need to expose the Prometheus collector via an endpoint /metrics
> 	go func() {
> 		mux := http.NewServeMux()
> 		mux.Handle("/metrics", pe)
> 		log.Fatal(http.ListenAndServe(":9889", mux))
> 	}()
> 
> 	// 2. AWS X-Ray
> 	xe, err := xray.NewExporter(xray.WithVersion("latest"))
> 	if err != nil {
> 		log.Fatalf("Failed to create AWS X-Ray exporter: %v", err)
> 	}
> 	trace.RegisterExporter(xe)
> 
> 	// 3. Stackdriver Tracing and Monitoring
> 	se, err := stackdriver.NewExporter(stackdriver.Options{
> 		MetricPrefix: prefix,
> 	})
> 	if err != nil {
> 		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
> 	}
> 	view.RegisterExporter(se)
> 	trace.RegisterExporter(se)
> }
```

or this which now becomes this code  

```
package main

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"google.golang.org/grpc"

	xray "github.com/census-instrumentation/opencensus-go-exporter-aws"
	"go.opencensus.io/exporter/prometheus"
	"go.opencensus.io/exporter/stackdriver"
	"go.opencensus.io/plugin/ocgrpc"
	"go.opencensus.io/stats/view"
	"go.opencensus.io/trace"

	"./rpc"
)

func main() {
	serverAddr := ":9988"
	cc, err := grpc.Dial(serverAddr, grpc.WithInsecure(), grpc.WithStatsHandler(new(ocgrpc.ClientHandler)))
	if err != nil {
		log.Fatalf("fetchIt gRPC client failed to dial to server: %v", err)
	}
	fc := rpc.NewFetchClient(cc)

	// OpenCensus exporters for the client since disjoint
	// and your customers will usually want to have their
	// own statistics too.
	createAndRegisterExporters()
	if err := view.Register(ocgrpc.DefaultClientViews...); err != nil {
		log.Fatalf("Failed to register gRPC client views: %v", err)
	}

	fIn := bufio.NewReader(os.Stdin)
	for {
		fmt.Print("> ")
		line, _, err := fIn.ReadLine()
		if err != nil {
			log.Fatalf("Failed to read a line in: %v", err)
		}

		ctx, span := trace.StartSpan(context.Background(), "Client.Capitalize")
		out, err := fc.Capitalize(ctx, &amp;rpc.Payload{Data: line})
		span.End()
		if err != nil {
			log.Printf("fetchIt gRPC client got error from server: %v", err)
			continue
		}
		fmt.Printf("&lt; %s\n\n", out.Data)
	}
}

func createAndRegisterExporters() {
	// For demo purposes, set this to always sample.
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})
	// 1. Prometheus
	prefix := "fetchit"
	pe, err := prometheus.NewExporter(prometheus.Options{
		Namespace: prefix,
	})
	if err != nil {
		log.Fatalf("Failed to create Prometheus exporter: %v", err)
	}
	view.RegisterExporter(pe)
	// We need to expose the Prometheus collector via an endpoint /metrics
	go func() {
		mux := http.NewServeMux()
		mux.Handle("/metrics", pe)
		log.Fatal(http.ListenAndServe(":9889", mux))
	}()

	// 2. AWS X-Ray
	xe, err := xray.NewExporter(xray.WithVersion("latest"))
	if err != nil {
		log.Fatalf("Failed to create AWS X-Ray exporter: %v", err)
	}
	trace.RegisterExporter(xe)

	// 3. Stackdriver Tracing and Monitoring
	se, err := stackdriver.NewExporter(stackdriver.Options{
		MetricPrefix: prefix,
	})
	if err != nil {
		log.Fatalf("Failed to create Stackdriver exporter: %v", err)
	}
	view.RegisterExporter(se)
	trace.RegisterExporter(se)
}
```

which gives this visualization  

![image - observability by instrumenting the client](https://cdn-images-1.medium.com/max/800/1*WisjA_lozi69PnHz7tMhdw.png "observability by instrumenting the client")  

![image - observability by instrumenting the client](https://cdn-images-1.medium.com/max/800/1*96_zFVZol6XkWODkkl8zyA.png "observability by instrumenting the client")  

![image - observability by instrumenting the client](https://cdn-images-1.medium.com/max/800/1*epDwWf-pNu0_VHi4md9ipw.png "observability by instrumenting the client")  

![image - observability by instrumenting the client](https://cdn-images-1.medium.com/max/800/1*znQiaxLKUd5Iv0xPetnG8g.png "observability by instrumenting the client")  

![image - observability by instrumenting the client](https://cdn-images-1.medium.com/max/800/1*4Qx_NM7t-Vfnv7BGqDUIoA.png "observability by instrumenting the client")  

Engineers can add alerts with Prometheus [https://prometheus.io/docs/alerting/overview/](https://prometheus.io/docs/alerting/overview/) or Stackdriver Monitoring [https://cloud.google.com/monitoring/alerts/](https://cloud.google.com/monitoring/alerts/) but also the various teams can examine system behaviour simultaneously, be it traces or metrics on a variety of backends. A question one might have is: “how about observability for streaming?” — for streaming you can use the same logic, but since in order to export a trace, the span needs to have been ended. However, with streaming, you have a single persistent connection that’s perhaps infinitely open. What you can do is register unique identifying information from a streaming request and then per stream response, start and end a span!  
&nbsp;  

With that we are off to the races!  

Thank you for reading this far and hope this tutorial was useful, you can find all the code in this tutorial at [https://github.com/orijtech/opencensus-for-grpc-go-developers](https://github.com/orijtech/opencensus-for-grpc-go-developers).  

Please feel free to check out the OpenCensus community https://opencensus.io send us feedback, instrument your backends and share with your friends and teams!  

This tutorial is part of a bunch more coming where we’ll use different languages, different transports and provide more samples etc.  

Emmanuel T Odeke  
