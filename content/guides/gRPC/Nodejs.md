---
title: "Node.js"
date: 2018-08-15T14:58:07-07:00
draft: false
weight: 3
logo: /images/node-grpc-opencensus.png
---

- [Overview](#overview)
- [Setup](#setup)
    - [Installation](#installation)
    - [Protobuf definition](#protobuf-definition)
    - [Generate the client](#generate-the-client)
    - [Generate the service](#generate-the-service)
    - [Run the Application](#run-the-application)
- [Tracing Instrumentation](#tracing-instrumentation)
- [Examining traces](#examining-traces)

## Overview
Our service takes in a payload containing bytes and capitalizes them.

Using OpenCensus, we can collect traces of our system and export them to the backend
of our choice, to give observability to our distributed systems.

{{% notice tip %}}
For assistance setting up Stackdriver, [Click here](/codelabs/stackdriver) for a guided codelab.
{{% /notice %}}

## Setup
Make sure to setup your `GOOGLE_APPLICATION_CREDENTIALS` environment variable. Visit [here](https://cloud.google.com/docs/authentication/production) for instructions on how to do so.

### Installation
First we will create our project directory, retrieve our dependencies, and generate our files.

Open up your terminal and paste the following code snippet:

```bash
mkdir grpc-oc
cd grpc-oc

npm init -y

npm install --save grpc \
  @grpc/proto-loader \
  @opencensus/nodejs \
  @opencensus/exporter-stackdriver

touch server.js client.js defs.proto
```

Our working directory will now look like this:

```sh
./server.js
./client.js
./defs.proto
```

### Protobuf Definition
Copy and paste the following code inside of `./defs.proto`:

```proto
syntax = "proto3";

package capitalize;

service Capitalize {
    rpc capitalize(CapitalizeRequest) returns (CapitalizeReply) {}
}

message CapitalizeRequest {
    string text = 1;
}

message CapitalizeReply {
    string capitalizedText = 1;
}
```

Node will automatically generate the proto during runtime.

### Generate the Client
Copy and paste the following code inside of `./client.js`:

```js
const PROTO_PATH = __dirname + '/defs.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const protoDefinition = protoLoader.loadSync(PROTO_PATH);
const capitalize_proto = grpc.loadPackageDefinition(protoDefinition).capitalize;

function main() {
  const client = new capitalize_proto.Capitalize('localhost:50051',
                                       grpc.credentials.createInsecure());
  let text;
  if (process.argv.length >= 3) {
    text = process.argv[2];
  } else {
    text = 'hello world';
  }

  client.capitalize({text}, function(err, response) {
    console.log('Result:', response.capitalizedText);
  });
}

main();
```

### Generate the Service
Copy and paste the following code inside of `./server.js`:

```js
const PROTO_PATH = __dirname + '/defs.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const protoDefinition = protoLoader.loadSync(PROTO_PATH);
const capitalize_proto = grpc.loadPackageDefinition(protoDefinition).capitalize;

/**
 * Implements the Capitalize RPC method.
 */
function capitalize(call, callback) {
  callback(null, {capitalizedText: call.request.text.toUpperCase()});
}

/**
 * Starts an RPC server that receives requests for the
 * Capitalize service at the sample server port
 */
function main() {
  const server = new grpc.Server();

  server.addService(capitalize_proto.Capitalize.service, {capitalize});

  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
```

### Run the Application
Let's now run `server.js` and `client.js` at the same time. You may need to open a second terminal tab.

In one terminal tab, run `node server.js`.

In the second terminal tab, run `node client.js`.

By default, this will submit and capitalize the text `hello world`.

To capitalize text of your choosing, try running `node client.js custom-text`.

![](/images/ocgrpc-node-client.png)

## Tracing Instrumentation
Great news: `@opencensus-node/instrumentation-grpc` will automatically trace our gRPC calls!

Open `./server.js`.

First let's import the required packages:

{{% tabs Snippet All %}}
```js
const tracing = require('@opencensus/nodejs');
const stackdriver = require('@opencensus/exporter-stackdriver');
```

```js
const PROTO_PATH = __dirname + '/defs.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const tracing = require('@opencensus/nodejs');
const stackdriver = require('@opencensus/exporter-stackdriver');

const protoDefinition = protoLoader.loadSync(PROTO_PATH);
const capitalize_proto = grpc.loadPackageDefinition(protoDefinition).capitalize;

/**
 * Implements the Capitalize RPC method.
 */
function capitalize(call, callback) {
  callback(null, {capitalizedText: call.request.text.toUpperCase()});
}

/**
 * Starts an RPC server that receives requests for the
 * Capitalize service at the sample server port
 */
function main() {
  const server = new grpc.Server();

  server.addService(capitalize_proto.Capitalize.service, {capitalize});

  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

main();
```
{{% /tabs %}}

Now, let's make a helper function to retrieve our Google Cloud Project ID:

{{% tabs Snippet All %}}
```js
/**
 * Retrieve your Google Cloud Project ID
 */
function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
}
```

```js
const PROTO_PATH = __dirname + '/defs.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const tracing = require('@opencensus/nodejs');
const stackdriver = require('@opencensus/exporter-stackdriver');

const protoDefinition = protoLoader.loadSync(PROTO_PATH);
const capitalize_proto = grpc.loadPackageDefinition(protoDefinition).capitalize;

/**
 * Implements the Capitalize RPC method.
 */
function capitalize(call, callback) {
  callback(null, {capitalizedText: call.request.text.toUpperCase()});
}

/**
 * Starts an RPC server that receives requests for the
 * Capitalize service at the sample server port
 */
function main() {
  const server = new grpc.Server();

  server.addService(capitalize_proto.Capitalize.service, {capitalize});

  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

/**
 * Retrieve your Google Cloud Project ID
 */
function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
}

main();
```
{{% /tabs %}}

Finally, let's start the tracer and register our Stackdriver exporter:

{{% tabs Snippet All %}}
```js
const exporter = new stackdriver.StackdriverTraceExporter({projectId: getProjectId()});
const tracer = tracing.start().tracer;
tracer.registerSpanEventListener(exporter);
```

```js
const PROTO_PATH = __dirname + '/defs.proto';

const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const tracing = require('@opencensus/nodejs');
const stackdriver = require('@opencensus/exporter-stackdriver');

const exporter = new stackdriver.StackdriverTraceExporter({projectId: getProjectId()});
const tracer = tracing.start().tracer;
tracer.registerSpanEventListener(exporter);

const protoDefinition = protoLoader.loadSync(PROTO_PATH);
const capitalize_proto = grpc.loadPackageDefinition(protoDefinition).capitalize;

/**
 * Implements the Capitalize RPC method.
 */
function capitalize(call, callback) {
  callback(null, {capitalizedText: call.request.text.toUpperCase()});
}

/**
 * Starts an RPC server that receives requests for the
 * Capitalize service at the sample server port
 */
function main() {
  const server = new grpc.Server();

  server.addService(capitalize_proto.Capitalize.service, {capitalize});

  server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  server.start();
}

/**
 * Retrieve your Google Cloud Project ID
 */
function getProjectId() {
  return require(process.env.GOOGLE_APPLICATION_CREDENTIALS).project_id;
}

main();
```
{{% /tabs %}}

Now you can run your application again and the traces will be sent to Stackdriver!

## Examining Traces

Please visit [https://console.cloud.google.com/traces/traces](https://console.cloud.google.com/traces/traces)

which will give visuals such as:

![Trace list](/images/ocgrpc-tutorial-python-traces-1.png)

![Single trace details](/images/ocgrpc-tutorial-python-traces-1.png)
