---
title: "Go kit"
date: 2018-09-06T13:50:34+02:00
draft: false
aliases: [/integrations/go_kit]
logo: /images/gokit-logo.png
---

- [Introduction](#introduction)
- [Example](#example)
    - [Service definition](#1-service-definition)
    - [Kitgen scaffolding](#2-kitgen-scaffolding)
    - [Service implementation](#3-service-implementation)
    - [Application bootstrap](#6-application-bootstrap)
    - [OpenCensus instrumentation](#7-opencensus-instrumentation)
- [Resources](#resources)
    - [Other Examples](#other-examples)

### Introduction
[Go kit] is a toolkit for microservices. It provides guidance and solutions for
most of the common operational and infrastructural concerns. Allowing you to
focus your mental energy on your business logic. It provides the building blocks
for separating transports from business domains; making it easy to switch one
transport for the other. Or even service multiple transports for a service at
once.

[Go kit] provides tracing and metrics middleware for consistent idiomatic views
of your [Go kit] services regardless of chosen transport. It includes native
[OpenCensus tracing middleware] and is very easy to get started with.

### Example

For this step by step example we're using the [kitgen] tool as provided with Go
kit; to build a bare bones HTTP transport driven greeting service. For more
advanced Go kit services you'd probably create your microservice infrastructure
manually. Adding instrumentation for these services will be very similar and
this step by step guide will also provide you with the needed background to get
it done.

##### 1. Service definition
We start by first creating our [Go kit] service definition for kitgen to use and
save it as `service.go`:

```go
package kitoc

import "context"

type Service interface {
	Hello(ctx context.Context, firstName string, lastName string) (greeting string, err error)
}
```

##### 2. Kitgen scaffolding
Now we can create our [Go kit] scaffolding with [kitgen]:
```bash
mkdir hello
cd hello
~/g/s/g/g/hello $ kitgen ../service.go
```

We will now have our basic implementation boilerplate for the service in a tree
structure like this:

```text
.../go-kit-example
├── hello
│   ├── endpoints
│   │   └── endpoints.go
│   ├── http
│   │   └── http.go
│   └── service
│       └── service.go
├── LICENSE
└── service.go
```

##### 3. Service implementation

To make the service work we need to implement the service implementation's Hello
method. By changing `hello/service/service.go`:
```go
func (s Service) Hello(ctx context.Context, firstName string, lastName string) (string, error) {
	panic(errors.New("not implemented"))
}
```

Into something like this:
```go
type serializableError struct{ error }

func (s *serializableError) MarshalJSON() ([]byte, error) {
	return json.Marshal(s.Error())
}

func newSerializableError(text string) error {
	return &serializableError{errors.New(text)}
}

func (s Service) Hello(ctx context.Context, firstName string, lastName string) (string, error) {
	firstName = strings.Trim(firstName, "\t\r\n ")
	lastName = strings.Trim(lastName, "\t\r\n ")

	if len(firstName) == 0 && len(lastName) == 0 {
		return "", newSerializableError("missing required name information")
	}
	if len(firstName) == 0 {
		return fmt.Sprintf(
			"Hello Mr./Ms. %s, nice to meet you. Do you have a first name?",
			lastName,
		), nil
	}
	if len(lastName) == 0 {
		return fmt.Sprintf(
			"Hello %s, nice to meet you. Do you have a last name?",
			firstName,
		), nil
	}
	return fmt.Sprintf(
		"Hello %s %s, nice to meet you.",
		firstName, lastName,
	), nil
}
```

##### 4. Failer implementation

To include business error messages as annotations in OpenCensus spans we need
the [Go kit] Response structs to implement the `endpoint.Failer` interface. An
[issue report](https://github.com/go-kit/kit/issues/762) has been filed so this
next step might become deprecated in the (near) future. To manually add the
interface add the following code to `hello/endpoints/endpoints.go`:
```go
func (r HelloResponse) Failed() error { return r.Err }
```

##### 5. Go kit server options

[Kitgen] omits the ability to inject transport options into Go kit servers.
Let's fix this first so we can attach our OpenCensus handler, server error
logger and other generic server options later. Change the following generated
code in `hello/http/http.go`:
```go
func NewHTTPHandler(endpoints endpoints.Endpoints) http.Handler {
	m := http.NewServeMux()
	m.Handle("/hello", httptransport.NewServer(
        endpoints.Hello, DecodeHelloRequest, EncodeHelloResponse))
	return m
}
```
Into:
```go
func NewHTTPHandler(endpoints endpoints.Endpoints, options ...httptransport.ServerOption) http.Handler {
	m := http.NewServeMux()
	m.Handle("/hello", httptransport.NewServer(
        endpoints.Hello, DecodeHelloRequest, EncodeHelloResponse, options...))
	return m
}
```

##### 6. Application bootstrap

The business logic of the service is done as well as the [Go kit] HTTP transport
handler. Now we need to create our `main.go` to turn our service package into a
runnable application. Let's create under `cmd/hello/main.go`:

```go
package main

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-kit/kit/log"
	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/oklog/run"

	"github.com/opencensus-integrations/go-kit-example/hello/endpoints"
	svchttp "github.com/opencensus-integrations/go-kit-example/hello/http"
	"github.com/opencensus-integrations/go-kit-example/hello/service"
)

const (
	serviceName = "oc-gokit-example"
)

func main() {
	// Set-up our contextual logger.
	var logger log.Logger
	{
		logger = log.NewLogfmtLogger(os.Stdout)
		logger = log.NewSyncLogger(logger)
		logger = log.With(logger, "svc", serviceName)
	}

	// Set-up our service.
	var handler http.Handler
	{
		// Create our hello service implementation.
		svc := service.Service{}

		// Create our Go kit Endpoints.
		endpoints := endpoints.Endpoints{
			Hello: endpoints.MakeHelloEndpoint(svc),
		}

		// Set-up our Go kit HTTP transport options.
		var serverOptions []httptransport.ServerOption
		serverOptions = append(serverOptions, httptransport.ServerErrorLogger(logger))

		// Create our HTTP transport handler.
		handler = svchttp.NewHTTPHandler(endpoints, serverOptions...)
	}

	// run.Group manages our goroutine lifecycles
	// see: https://www.youtube.com/watch?v=LHe1Cb_Ud_M&t=15m45s
	var g run.Group
	{
		// Set-up our HTTP service.
		var (
			listener, _ = net.Listen("tcp", ":0") // dynamic port assignment
			addr        = listener.Addr().String()
		)
		g.Add(func() error {
			logger.Log("msg", "service start", "transport", "http", "address", addr)
			return http.Serve(listener, handler)
		}, func(error) {
			listener.Close()
		})
	}
	{
		// Set-up our signal handler.
		var (
			cancelInterrupt = make(chan struct{})
			c               = make(chan os.Signal, 2)
		)
		defer close(c)

		g.Add(func() error {
			signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
			select {
			case sig := <-c:
				return fmt.Errorf("received signal %s", sig)
			case <-cancelInterrupt:
				return nil
			}
		}, func(error) {
			close(cancelInterrupt)
		})
	}

	// Spawn our Go routines and wait for shutdown.
	logger.Log("exit", g.Run())
}
```

##### 7. OpenCensus instrumentation

We now have a complete runnable Go kit service. To add OpenCensus tracing to
our app we need to add `transport` and `endpoint` middleware. [Go kit] provides
the OpenCensus middleware as part of its core middleware.

Update the `cmd/hello/main.go` code to this:
```go
package main

import (
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-kit/kit/log"
	kitoc "github.com/go-kit/kit/tracing/opencensus"
	httptransport "github.com/go-kit/kit/transport/http"
	"github.com/oklog/run"
	zipkin "github.com/openzipkin/zipkin-go"
	httpreporter "github.com/openzipkin/zipkin-go/reporter/http"
	oczipkin "go.opencensus.io/exporter/zipkin"
	"go.opencensus.io/trace"

	"github.com/opencensus-integrations/go-kit-example/hello/endpoints"
	svchttp "github.com/opencensus-integrations/go-kit-example/hello/http"
	"github.com/opencensus-integrations/go-kit-example/hello/service"
)

const (
	serviceName = "oc-gokit-example"
	zipkinURL   = "http://localhost:9411/api/v2/spans"
)

func main() {
	// Set-up our contextual logger.
	var logger log.Logger
	{
		logger = log.NewLogfmtLogger(os.Stdout)
		logger = log.NewSyncLogger(logger)
		logger = log.With(logger, "svc", serviceName)
	}

	// Set-up our OpenCensus instrumentation with Zipkin backend
	{
		var (
			reporter         = httpreporter.NewReporter(zipkinURL)
			localEndpoint, _ = zipkin.NewEndpoint(serviceName, ":0")
			exporter         = oczipkin.NewExporter(reporter, localEndpoint)
		)
		defer reporter.Close()

		// Always sample our traces for this demo.
		trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

		// Register our trace exporter.
		trace.RegisterExporter(exporter)
	}

	// Set-up our service.
	var handler http.Handler
	{
		// Create our hello service implementation.
		svc := service.Service{}

		// Create our Go kit Endpoints.
		endpoints := endpoints.Endpoints{
			Hello: endpoints.MakeHelloEndpoint(svc),
		}

		// Wrap our service endpoints with OpenCensus tracing middleware.
		endpoints.Hello = kitoc.TraceEndpoint("gokit:endpoint hello")(endpoints.Hello)

		// Set-up our Go kit HTTP transport options.
		var serverOptions []httptransport.ServerOption
		serverOptions = append(serverOptions, httptransport.ServerErrorLogger(logger))
		serverOptions = append(serverOptions, kitoc.HTTPServerTrace())

		// Create our HTTP transport handler.
		handler = svchttp.NewHTTPHandler(endpoints, serverOptions...)
	}

	// run.Group manages our goroutine lifecycles
	// see: https://www.youtube.com/watch?v=LHe1Cb_Ud_M&t=15m45s
	var g run.Group
	{
		// Set-up our HTTP service.
		var (
			listener, _ = net.Listen("tcp", ":0") // dynamic port assignment
			addr        = listener.Addr().String()
		)
		g.Add(func() error {
			logger.Log("msg", "service start", "transport", "http", "address", addr)
			return http.Serve(listener, handler)
		}, func(error) {
			listener.Close()
		})
	}
	{
		// Set-up our signal handler.
		var (
			cancelInterrupt = make(chan struct{})
			c               = make(chan os.Signal, 2)
		)
		defer close(c)

		g.Add(func() error {
			signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
			select {
			case sig := <-c:
				return fmt.Errorf("received signal %s", sig)
			case <-cancelInterrupt:
				return nil
			}
		}, func(error) {
			close(cancelInterrupt)
		})
	}

	// Spawn our Go routines and wait for shutdown.
	logger.Log("exit", g.Run())
}
```

### Resources

* [Go kit]
* [kitgen]
* [Go kit example]

#### Other Examples

A very comprehensive example of Go kit including OpenCensus instrumentation can
be found here: https://github.com/basvanbeek/opencensus-gokit-example. It
contains a couple of backend microservices and an API frontend service,
including the ability to run as an elegant monolith, highlighting many micro
services concepts when stripped from the networking aspect still make sense;
including OpenCensus observability.

[OpenCensus tracing middleware]: https://github.com/go-kit/kit/tree/master/tracing/opencensus
[Go kit]: https://github.com/go-kit/kit
[kitgen]: https://github.com/go-kit/kit/tree/master/cmd/kitgen
[Go kit example]: https://github.com/opencensus-integrations/go-kit-example
