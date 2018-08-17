---
title: "Python"
date: 2018-08-15T14:58:07-07:00
draft: false
weight: 3
---

![](/images/python-grpc-opencensus.png)

{{% notice note %}}
Before beginning, if you haven't already:

* Setup gRPC for Python by visiting this quickstart page [https://grpc.io/docs/quickstart/python.html](https://grpc.io/docs/quickstart/python.html)
* Setup [Stackdriver Tracing and Monitoring](/codelabs/stackdriver/)
{{% / notice %}}

## Table of contents
- [Overview](#overview)
- [Setup](#setup)
    - [Installation](#installation)
    - [Protobuf definition](#protobuf-definition)
    - [Generate the client](#generate-the-client)
    - [Generate the service](#generate-the-service)
    - [Run the Application](#run-the-application)
- [Instrumentation](#instrumentation)
    - [Tracing](#tracing)
    - [Exporting](#exporting)
- [Examining traces](#examining-traces)

## Overview
Our service takes in a payload containing bytes and capitalizes them.

Using OpenCensus, we can collect traces of our system and export them to the backend
of our choice, to give observability to our distributed systems.

## Setup
Make sure to setup your `GOOGLE_APPLICATION_CREDENTIALS` environment variable. Visit [here](https://cloud.google.com/docs/authentication/production) for instructions on how to do so.

##### Installation
This walkthrough will be using [Python 3](https://www.python.org/download/releases/3.0/).

Install the required modules by running this command in your terminal:

`python3 -m pip install grpcio-tools opencensus google-cloud-trace`

Next, let's setup our working directory. Run the following commands in your terminal:

```sh
touch capitalizeServer.py
touch capitalizeClient.py
mkdir proto
touch proto/defs.proto
```

Our working directory will now look like this:

```sh
./capitalizeServer.py
./capitalizeClient.py
./proto/
./proto/defs.proto
```

##### Protobuf Definition
Copy and paste the following code inside of `./proto/defs.proto`:

```proto
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

Now, run the following command in your terminal to create the gRPC stubs.

```sh
python3 -m grpc_tools.protoc \
  -I./proto \
  --python_out=. \
  --grpc_python_out=. ./proto/defs.proto
```

This will create two new files. Your working directory will be:

```sh
./defs_pb.py
./defs_pb2_grpc.py
./capitalizeServer.py
./capitalizeClient.py
./proto/
./proto/defs.proto
```

##### Generate the Client
Copy and paste the following code inside of `./capitalizeClient.py`:

```py
import grpc

import defs_pb2_grpc as proto
import defs_pb2 as pb

def main():
    channel = grpc.insecure_channel('localhost:9778')
    stub = proto.FetchStub(channel)

    while True:
        lineIn = input('> ')
        capitalized = stub.Capitalize(pb.Payload(data=bytes(lineIn, encoding='utf-8')))
        print('< %s\n'%(capitalized.data.decode('utf-8')))

if __name__ == '__main__':
    main()
```

##### Generate the Service
Copy and paste the following code inside of `./capitalizeServer.py`:

```py
import grpc
import time
from concurrent import futures

import defs_pb2_grpc as proto
import defs_pb2 as pb

class CapitalizeServer(proto.FetchServicer):
    def __init__(self, *args, **kwargs):
        super(CapitalizeServer, self).__init__()

    def Capitalize(self, request, context):
        return pb.Payload(data=request.data.upper())

def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()

    try:
        while True:
            time.sleep(60 * 60)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    main()
```

##### Run the Application
Let's now run two of our python files at once. You may need to open a second terminal tab.

In one terminal tab, run `python3 capitalizeServer.py`.

In the second terminal tab, run `python3 capitalizeClient.py`.

Try typing in some text and hitting enter in the tab running `capitalizeClient.py`. You should see something resembling the following:

![](/images/ocgrpc-python-client.png)

## Instrumentation

##### Tracing
Open `./capitalizeServer.py`.

First let's import the required packages:

{{<tabs Snippet All>}}
{{<highlight python>}}
from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.ext.grpc import server_interceptor
{{</highlight>}}

{{<highlight python>}}
import grpc
import time
from concurrent import futures

from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.ext.grpc import server_interceptor

import defs_pb2_grpc as proto
import defs_pb2 as pb

class CapitalizeServer(proto.FetchServicer):
    def __init__(self, *args, **kwargs):
        super(CapitalizeServer, self).__init__()

    def Capitalize(self, request, context):
        return pb.Payload(data=request.data.upper())

def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()

    try:
        while True:
            time.sleep(60 * 60)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    main()
{{</highlight>}}
{{</tabs>}}

Now let's modify our `Capitalize` function to create our span:

{{<tabs Snippet All>}}
{{<highlight python>}}
def Capitalize(self, request, context):
  tracer = Tracer(sampler=always_on.AlwaysSampler())
  with tracer.span(name='Capitalize') as span:
    data = request.data
    span.add_annotation('Data in', len=len(data))
    return pb.Payload(data=data.upper())
{{</highlight>}}

{{<highlight python>}}
import grpc
import time
from concurrent import futures

from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.ext.grpc import server_interceptor

import defs_pb2_grpc as proto
import defs_pb2 as pb

class CapitalizeServer(proto.FetchServicer):
    def __init__(self, *args, **kwargs):
        super(CapitalizeServer, self).__init__()

     def Capitalize(self, request, context):
        tracer = Tracer(sampler=always_on.AlwaysSampler())
        with tracer.span(name='Capitalize') as span:
            data = request.data
            span.add_annotation('Data in', len=len(data))
            return pb.Payload(data=data.upper())

def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()

    try:
        while True:
            time.sleep(60 * 60)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    main()
{{</highlight>}}
{{</tabs>}}

Finally, let's modify our `main` function to setup the interceptor.

{{<tabs Snippet All>}}
{{<highlight python>}}
def main():
    # Setup the gRPC integration/interceptor
    tracer_interceptor = server_interceptor.OpenCensusServerInterceptor(
            always_on.AlwaysOnSampler())

    server = grpc.server(
            futures.ThreadPoolExecutor(max_workers=10),
            interceptors=(tracer_interceptor,))

    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()
{{</highlight>}}

{{<highlight python>}}
import grpc
import time
from concurrent import futures

from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.ext.grpc import server_interceptor

import defs_pb2_grpc as proto
import defs_pb2 as pb

class CapitalizeServer(proto.FetchServicer):
    def __init__(self, *args, **kwargs):
        super(CapitalizeServer, self).__init__()

     def Capitalize(self, request, context):
        tracer = Tracer(sampler=always_on.AlwaysSampler())
        with tracer.span(name='Capitalize') as span:
            data = request.data
            span.add_annotation('Data in', len=len(data))
            return pb.Payload(data=data.upper())

def main():
    # Setup the gRPC integration/interceptor
    tracer_interceptor = server_interceptor.OpenCensusServerInterceptor(
            always_on.AlwaysOnSampler())

    server = grpc.server(
            futures.ThreadPoolExecutor(max_workers=10),
            interceptors=(tracer_interceptor,))

    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()

    try:
        while True:
            time.sleep(60 * 60)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    main()
{{</highlight>}}
{{</tabs>}}

##### Exporting
Import the required packages:

{{<tabs Snippet All>}}
{{<highlight python>}}
import os
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport
from opencensus.trace.exporters import stackdriver_exporter
{{</highlight>}}

{{<highlight python>}}
import grpc
import os
import time
from concurrent import futures

from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.ext.grpc import server_interceptor
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport
from opencensus.trace.exporters import stackdriver_exporter

import defs_pb2_grpc as proto
import defs_pb2 as pb

class CapitalizeServer(proto.FetchServicer):
    def __init__(self, *args, **kwargs):
        super(CapitalizeServer, self).__init__()

     def Capitalize(self, request, context):
        tracer = Tracer(sampler=always_on.AlwaysSampler())
        with tracer.span(name='Capitalize') as span:
            data = request.data
            span.add_annotation('Data in', len=len(data))
            return pb.Payload(data=data.upper())

def main():
    # Setup the gRPC integration/interceptor
    tracer_interceptor = server_interceptor.OpenCensusServerInterceptor(
            always_on.AlwaysOnSampler())

    server = grpc.server(
            futures.ThreadPoolExecutor(max_workers=10),
            interceptors=(tracer_interceptor,))

    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()

    try:
        while True:
            time.sleep(60 * 60)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    main()
{{</highlight>}}
{{</tabs>}}

Setup the exporter:

{{<tabs Snippet All>}}
{{<highlight python>}}
# NOTE: Replace 'YOUR_GOOGLE_PROJECT_ID_HERE' with your actual Google Project ID!
exporter = stackdriver_exporter.StackdriverExporter(
    project_id=os.environ.get('YOUR_GOOGLE_PROJECT_ID_HERE'),
    transport=BackgroundThreadTransport)
{{</highlight>}}

{{<highlight python>}}
import grpc
import os
import time
from concurrent import futures

from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.ext.grpc import server_interceptor
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport
from opencensus.trace.exporters import stackdriver_exporter

import defs_pb2_grpc as proto
import defs_pb2 as pb

# NOTE: Replace 'YOUR_GOOGLE_PROJECT_ID_HERE' with your actual Google Project ID!
exporter = stackdriver_exporter.StackdriverExporter(
    project_id=os.environ.get('YOUR_GOOGLE_PROJECT_ID_HERE'),
    transport=BackgroundThreadTransport)

class CapitalizeServer(proto.FetchServicer):
    def __init__(self, *args, **kwargs):
        super(CapitalizeServer, self).__init__()

     def Capitalize(self, request, context):
        tracer = Tracer(sampler=always_on.AlwaysSampler())
        with tracer.span(name='Capitalize') as span:
            data = request.data
            span.add_annotation('Data in', len=len(data))
            return pb.Payload(data=data.upper())

def main():
    # Setup the gRPC integration/interceptor
    tracer_interceptor = server_interceptor.OpenCensusServerInterceptor(
            always_on.AlwaysOnSampler())

    server = grpc.server(
            futures.ThreadPoolExecutor(max_workers=10),
            interceptors=(tracer_interceptor,))

    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()

    try:
        while True:
            time.sleep(60 * 60)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    main()
{{</highlight>}}
{{</tabs>}}

Implement the exporter:

{{<tabs Snippet All>}}
{{<highlight python>}}
def Capitalize(self, request, context):
  tracer = Tracer(sampler=always_on.AlwaysSampler(), exporter=exporter)

def main():
  tracer_interceptor = server_interceptor.OpenCensusServerInterceptor(
    always_on.AlwaysOnSampler())
{{</highlight>}}

{{<highlight python>}}
import grpc
import os
import time
from concurrent import futures

from opencensus.trace.samplers import always_on
from opencensus.trace.tracer import Tracer
from opencensus.trace.ext.grpc import server_interceptor
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport
from opencensus.trace.exporters import stackdriver_exporter

import defs_pb2_grpc as proto
import defs_pb2 as pb

# NOTE: Replace 'YOUR_GOOGLE_PROJECT_ID_HERE' with your actual Google Project ID!
exporter = stackdriver_exporter.StackdriverExporter(
    project_id=os.environ.get('YOUR_GOOGLE_PROJECT_ID_HERE'),
    transport=BackgroundThreadTransport)

class CapitalizeServer(proto.FetchServicer):
    def __init__(self, *args, **kwargs):
        super(CapitalizeServer, self).__init__()

     def Capitalize(self, request, context):
        tracer = Tracer(sampler=always_on.AlwaysSampler(), exporter=exporter)
        with tracer.span(name='Capitalize') as span:
            data = request.data
            span.add_annotation('Data in', len=len(data))
            return pb.Payload(data=data.upper())

def main():
    # Setup the gRPC integration/interceptor
    tracer_interceptor = server_interceptor.OpenCensusServerInterceptor(
            always_on.AlwaysOnSampler(), exporter)

    server = grpc.server(
            futures.ThreadPoolExecutor(max_workers=10),
            interceptors=(tracer_interceptor,))

    proto.add_FetchServicer_to_server(CapitalizeServer(), server)
    server.add_insecure_port('[::]:9778')
    server.start()

    try:
        while True:
            time.sleep(60 * 60)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    main()
{{</highlight>}}
{{</tabs>}}

## Examining Traces

Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)

which will give visuals such as:

![Trace list](/images/ocgrpc-tutorial-python-traces-1.png)

![Single trace details](/images/ocgrpc-tutorial-python-traces-1.png)
