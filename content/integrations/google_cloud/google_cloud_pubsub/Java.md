---
title: "Java"
date: 2019-04-15T15:14:00-07:00
draft: false
weight: 3
class: "resized-logo"
aliases: [/integrations/google_cloud_pubsub/java, /guides/integrations/google_cloud_pubsub/java]
logo: /images/java.png
---
- [Introduction](#introduction)
- [Problem](#problem)
- [What You Get](#what-you-get)
- [Solution](#solution)
    - [Alternative Solution](#alternative-solution)
- [Example](#example)
    - [Publisher Changes](#publisher-changes)
    - [Subscriber Changes](#subscriber-changes)
- [Running the Example](#running-the-example)
    - [Publisher Trace](#publisher-trace)
    - [Subscriber Trace (message-0)](#subscriber-trace-message-0)
- [Appendix](#appendix)

# OpenCensus Tracing and Google Cloud Pub/Sub 

## Introduction
This article gives an overview of using [OpenCensus Tracing](/tracing) with
[Google Cloud Pub/Sub](https://cloud.google.com/pubsub/docs/) illustrating that
OpenCensus can be used for long-lived and asynchronous jobs.

## Problem
Google’s Cloud Pub/Sub infrastructure provides a platform that allows publishers
to send messages that are received by any number of interested subscribers. Many
organizations use the Pub/Sub framework to implement loosely-coupled distributed
systems such as batch processing systems. In such systems, when there are
bottlenecks, it can be difficult to detect and pinpoint the source of these
problems without observability. 

OpenCensus tracing provides a framework for tracking down these kinds of
problems for RPC systems (e.g. [gRPC](https://grpc.io/)) that we have applied to
work similarly with Cloud Pub/Sub. 

The main differences main between RPC systems and Cloud Pub/Sub are that:

1. Publishers don't expect a reply from Subscribers
2. Publishers can have thousands (or tens of thousands) of Subscribers, so a
different approach is necessary to support this framework.

## What you get
Following an approach similar to asynchronous RPCs, once OpenCensus is enabled
in a Pub/Sub system:

1. Publishers will have a trace span associated with their execution and this
span will be implicitly propagated to Subscribers and 
2. Subscribers will process each message received as a parent link to the
Publisher's propagated span - these links will allow applications to see the
end-to-end trace for the Pub/Sub system and enable them to debug performance
anomalies.

## Solution
Our approach for Cloud Pub/Sub is, on the Publisher side, we enable the implicit
propagation of the current OpenCensus trace span when publishing a message. The
trace span is passed as metadata with the message (via attributes) to the
Subscriber, which ensures that it stays with the message even if the Pub/Sub
system batches messages.

On the Subscriber side, each received message is executed in `MessageReceiver`,
an interface used to define handling of messages received from publishers. In
our solution, we provide the `OpenCensusMessageReceiver`, which will wrap any
`MessageReceiver` so that, when a message containing a propagated span is
received, it will:

1. create a new root span for processing the message
1. add the propagated span as a parent link to the new root span
1. set the new root span as the current span and
1. execute the original `MessageReceiver` in that context.

In short, the original `MessageReceiver` will execute with a new root span that
has the publisher’s span as a parent link. 

### Alternative Solution
An alternative would be to create a child span in the Subscriber of the
Publisher’s span. We don’t do this because 1. the lifetime of the publishing of
the message and the receiving and processing of the message are not related
(analogous to making an asynchronous rpc where the initial call will likely end
before the rpc returns) and 2. publishers can potentially have tens of thousands
of subscribers so having a trace with so many child spans would be unwieldy.

## Example
{{% notice tip %}}
Our example is based on the [Pub/Sub Example Code]
(https://github.com/GoogleCloudPlatform/java-docs-samples/tree/master/pubsub/cloud-client)
in the Google Cloud Platform samples repository. We have modified the example by
trace instrumenting it with OpenCensus —the complete example with our modified
code is available here: [Complete Modified Pub/Sub Example Code]
(https://github.com/census-ecosystem/opencensus-experiments/tree/master/java/pubsub).
{{% / notice %}}

### Publisher Changes
The relevant publisher code modifications are shown here and summarized below:

```java
public static void main(String… args) throws Exception {
 // topic id, eg. "my-topic"
 String topicId = args[0];
 int messageCount = Integer.parseInt(args[1]);
 ProjectTopicName topicName = ProjectTopicName.of(
   PROJECT_ID, topicId);
 Publisher publisher = null;
 List<ApiFuture<String>> futures = new ArrayList<>();
 try (Scope scope = OpenCensusTraceUtil.createScopedSampledSpan("Publisher")) {
   OpenCensusTraceUtil.addAnnotation("Publisher:Begin");
   // Create a publisher instance with default settings bound
   // to the topic.
   publisher = Publisher
     .newBuilder(topicName)
     .setTransform(OpenCensusUtil.OPEN_CENSUS_MESSAGE_TRANSFORM)
     .build();
   for (int i = 0; i < messageCount; i++) {
     try (Scope traceScope =
            OpenCensusTraceUtil.createScopedSampledSpan(
               "PublisherRoot-" + i)) {
       OpenCensusTraceUtil.addAnnotation(
         OpenCensusTraceUtil.getCurrentSpanIdAsString());
       String message = "message-" + i;
       // convert message to bytes
       ByteString data = ByteString.copyFromUtf8(message);
       PubsubMessage pubsubMessage = PubsubMessage.newBuilder()
         .setData(data)
         .build();
       // Schedule a message to be published. Messages are
       // automatically batched.
       ApiFuture<String> future = publisher.publish(pubsubMessage);
       futures.add(future);
     }
   }
 } finally {
    // Wait on any pending requests
   List<String> messageIds = ApiFutures.allAsList(futures).get();
   for (String messageId : messageIds) {
     System.out.println(messageId);
   }
   if (publisher != null) {
     // When finished with the publisher, shutdown to free
     // up resources.
     publisher.shutdown();
   }
   OpenCensusTraceUtil.addAnnotation("Publisher:End");
   Thread.sleep(5000);
 }
}
```

The most important change in the code is augmenting the Publisher's builder with:

```java
.setTransform(OpenCensusUtil.OPENCENSUS_MESSAGE_TRANSFORM)
```

which enables the implicit propagation of the current OpenCensus trace span when
publishing a message. Strictly speaking, this code change is the only required
change in the Publisher code. The other changes add OpenCensus instrumentation
to the application to give more insight about what’s going on during execution.

The first code change is in the outer try-with-resources block:

```java
try (Scope scope =
      OpenCensusTraceUtil.createScopedSampledSpan("Publisher")) ...
```

which creates a top-level parent span named ‘Publisher’ that is live for the
execution of the application (`OpenCensusTraceUtil` is a simple utility class
added to the example  —  details can be seen in the
[Appendix](#appendix)). Because only sampled spans are propagated, for demo
purposes, we created a sampled parent span. However in standard applications,
please use the default sampling rate.

The next code change:

```java
OpenCensusTraceUtil.addAnnotation("Publisher:Begin");
```

adds an annotation to the parent span at the beginning of execution, before
sending any messages (we’ll see this exported later).

The third code change: 

```java
try (Scope traceScope = OpenCensusTraceUtil.createScopedSampledSpan(
      "PublisherRoot-" + i)) {
```      

adds a child span to our parent span for each message published — the child span
is named PublisherRoot-i to make it easy to identify in the trace.

The next change is to add an annotation with the child span's span id, which
allows us to connect publisher spans and subscribers spans in the next section.

```java
OpenCensusTraceUtil.addAnnotation(
         OpenCensusTraceUtil.getCurrentSpanIdAsString());
```

The final code change:

```java
OpenCensusTraceUtil.addAnnotation("Publisher:End");
```

adds an annotation to the parent span at the end of message processing.

### Subscriber Changes
The relevant changes to the subscriber are shown here and summarized below:

```java
static class MessageReceiverExample implements MessageReceiver {
  @Override
  public void receiveMessage(
    PubsubMessage message, AckReplyConsumer consumer) {
    OpenCensusTraceUtil.addAnnotation("Receiver:Message");
    System.out.println("Message Id: " + message.getMessageId());
    String data = message.getData().toStringUtf8();
    System.out.println("Data: " + data);
    OpenCensusTraceUtil.addAnnotation("Receiver:Ack: " + data);
    consumer.ack();
    OpenCensusTraceUtil.addAnnotation("Receiver:Done: " + data);
 }
}

/** Receive messages over a subscription. */
public static void main(String... args) throws Exception {
  // set subscriber id, eg. my-sub
  String subscriptionId = args[0];
  ProjectSubscriptionName subscriptionName =
    ProjectSubscriptionName.of(PROJECT_ID, subscriptionId);
  Subscriber subscriber = null;
  try {
    // create a subscriber bound to the asynchronous
    // OpenCensus message receiver
    MessageReceiver receiver =
      new OpenCensusUtil.OpenCensusMessageReceiver(
        new MessageReceiverExample());
    subscriber =
      Subscriber.newBuilder(subscriptionName, receiver).build();
    subscriber.startAsync().awaitRunning();
    // Continue to listen to messages
    while (true) {
      Thread.sleep(Long.MAX_VALUE);
    }
  } finally {
    if (subscriber != null) {
        subscriber.stopAsync();
    }
  }
}
```

Once again, only one change is really necessary to the Subscriber code, the
addition of:

```java
new OpenCensusUtil.OpenCensusMessageReceiver(...)
```

As previously described, the `OpenCensusMessageReceiver` will wrap the given
`MessageReceiverExample` so that it is executed in a new root span with the
propated publisher span set as a parent link.

In our example code, the user-defined `MessageReceiverExample` has been modified
in three places to add annotations to give insight into what's going in the
code. Firstly, at the beginning:

```java
OpenCensusTraceUtil.addAnnotation("Receiver:Message");
```

Secondly, after processing the message and just before acknowledging it:

```java
OpenCensusTraceUtil.addAnnotation("Receiver:Ack: " + data);
```

and, finally, at the very end:

```java
OpenCensusTraceUtil.addAnnotation("Receiver:Done: " + data);
```

Note that, for this example, the data sent from the publisher is simple the
string “message-i” where ‘i’ denotes the i-th message sent and corresponds to
the publisher’s “PublisherRoot-i” span.

## Running the Example
The example code provides a Publisher and a Subscriber. Following the original
example code, we can execute the Publisher specifying how many messages to
publish. In the following instance, we have the publisher publish 4 messages.

### Publisher Trace
For the Publisher, we can see the parent span `Publisher` with `Publisher:Begin`
annotation and 4 child spans (`PublisherRoot-0` ... `PublisherRoot-3`). Each
child span has their span id added as an annotation. For `PublisherRoot-0`,
which sends `message-0`, the span id is `98d1b951adaeb95a`:

![publisher-trace](/images/cloud-pubsub-publisher-trace.png)

### Subscriber Trace (message-0)
For the Subscriber, if we look at the span for `message-0`:

![subscriber-trace](/images/cloud-pubsub-subscriber-trace.png)

we can see that the associated parent span link is also `98d1b951adaeb95a`:

![subscriber-trace-link](/images/cloud-pubsub-subscriber-trace-link.png)

which matches the span id where `message-0` was published, demonstrating that
the span context was propagated with the message and set as the parent link for
the span executing in the Subscriber.

Note that this matching based on span id is informal - for full validation we
would also need to look at the trace id but we've simplified the matching here
for demonstration purposes.

## Caveats 
We have shown how to use the `OpenCensusUtil` class in the Cloud Pub/Sub Java
library in order to generate traces connecting Publishers and Subscribers.

+ Caveat 1. OpenCensus Java is split into API and implementation. The Cloud
Pub/Sub Java library only has a dependency on the API so, for Publishers and
Subscribers to actually generate traces, a dependency on the OpenCensus
implementation must be added — see `pom.xml` in the [Appendix](#appendix).

+ Caveat 2. In order to export trace data to Stackdriver, the OpenCensus
Stackdriver Exporter must also be linked into the application and
initialized. See `OpenCensusTraceUtil.java` and `pom.xml` in the
[Appendix](#appendix) for details.

## Appendix
+ `OpenCensusTraceUtil.java` — utility class added to the Pub/Sub example. Note
particularly the static initializer on line 28, which initializes the OpenCensus
Stackdriver trace exporter.

```java
class OpenCensusTraceUtil {
  private static final Logger logger = 
     Logger.getLogger(OpenCensusTraceUtil.class.getName());
  private static final String PROJECT_ID = ServiceOptions.getDefaultProjectId();
  private static final Tracer tracer =  io.opencensus.trace.Tracing.getTracer();

  static void addAnnotationAndLog(String annotation) {
    tracer.getCurrentSpan().addAnnotation(annotation);
    logger.log(Level.INFO, annotation);
  }

  @MustBeClosed
  static Scope createScopedSampledSpan(String name) {
    return tracer
      .spanBuilderWithExplicitParent(name, tracer.getCurrentSpan())
      .setRecordEvents(true)
      .setSampler(Samplers.alwaysSample())
      .startScopedSpan();
  }

  static String getCurrentSpanIdAsString() {
    return tracer.getCurrentSpan().getContext().getSpanId().toString();
  }

  static void logCurrentSpan() {
    SpanContext ctxt = tracer.getCurrentSpan().getContext();
    logger.log(Level.INFO, "OpenCensusTraceUtil: logCurrentSpan(): "
      + "traceid=" + ctxt.getTraceId().toLowerBase16()
      + "&spanid=" + ctxt.getSpanId().toLowerBase16()
      + "&traceopt=" + (ctxt.getTraceOptions().isSampled() ? "t&" : "f&"));
  }

  static {
    if (!PROJECT_ID.isEmpty()) {
      try {
        // Initialize trace exporter.
        StackdriverTraceExporter.createAndRegister(StackdriverTraceConfiguration
          .builder().setProjectId(PROJECT_ID).build());
      } catch (IOException exn) {
        logger.log(
          Level.INFO, "Initializing OpenCensusTraceUtil: Exception: " + exn);
      }
    }
  }
}
```

+ `pom.xml` — maven build file for the example. The necessary OpenCensus
dependencies are delineated in the comments.

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example.pubsub</groupId>
  <artifactId>pubsub-google-cloud-samples</artifactId>
  <packaging>jar</packaging>

  <properties>
    <maven.compiler.target>1.8</maven.compiler.target>
    <maven.compiler.source>1.8</maven.compiler.source>
    <opencensus.version>0.18.0</opencensus.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>com.google.cloud</groupId>
      <artifactId>google-cloud-pubsub</artifactId>
      <version>1.62.1-SNAPSHOT</version>
    </dependency>

    <!-- [START opencensus_java_dependencies] -->
    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-api</artifactId>
      <version>${opencensus.version}</version>
    </dependency>

    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-impl</artifactId>
      <version>${opencensus.version}</version>
      <scope>runtime</scope>
    </dependency>
        
    <dependency>
      <groupId>io.opencensus</groupId>
      <artifactId>opencensus-exporter-trace-stackdriver</artifactId>
      <version>${opencensus.version}</version>
    </dependency>
    <!-- [END opencensus_java_dependencies] -->
  </dependencies>
</project>
```
