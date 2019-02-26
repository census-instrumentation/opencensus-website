---
date: 2018-10-25T19:42:20-07:00
title: "Message events"
weight: 20
aliases: [/core-concepts/tracing/span/time_events/message_event]
---

- [Message event](#message-event)
    - [Type](#type)
    - [ID](#id)
    - [Uncompressed size](#uncompressed-size)
    - [Compressed size](#compressed-size)
- [Source code samples](#source-code-samples)
- [Visuals](#visuals)
- [References](#references)

### Message event

A message event describes a message sent or received between spans.

It contains the following fields:

- [Type](#type)
- [ID](#id)
- [Uncompressed size](#uncompressed-size)
- [Compressed size](#compressed-size)

### Type

Type enumerates the various states of a message event. It can be either of these:

Type|Value|Description
---|---|---
SENT|1|Indicates that this message was sent
RECEIVED|2|Indicates that this message was received
UNKNOWN|0|Unknown event type or default value

### ID
The identifier for the message to help correlate between SENT and RECEIVED message events.
For example it can be useful when matching sequence/state numbers between protocol handshakes
or for a streaming RPC. It is recommended to be unique within a span.

### Uncompressed size
The number of uncompressed bytes sent or received.

### Compressed size
The number of compressed bytes sent or received. If this value is zero, it is assumed to be the same as [Uncompressed size](#uncompressed-size)

### Source code samples

{{<tabs Go Java CplusPlus Python NodeJS>}}
{{<highlight go>}}
// On the client
span.AddMessageReceiveEvent(seqNumber, 1024, 512)

// On the server
span.AddMessageSendEvent(seqNumber, 1024, 512)
{{</highlight>}}

{{<highlight java>}}
import io.opencensus.trace.MessageEvent;
import io.opencensus.trace.MessageEvent.Type;

// On the client
MessageEvent clientEvent = MessageEvent.builder(Type.RECEIVED, seqNumber)
                                 .setCompressedMessageSize(512)
                                 .setUncompressedMessageSize(1024)
                                 .build();
clientSpan.addMessageEvent(clientEvent);

// On the server
MessageEvent serverEvent = MessageEvent.builder(Type.SENT, seqNumber)
                                 .setCompressedMessageSize(512)
                                 .setUncompressedMessageSize(1024)
                                 .build();
serverSpan.addMessageEvent(serverEvent);
{{</highlight>}}

{{<highlight cpp>}}
// On the client
span.AddReceivedMessageEvent(seqNumber, 512, 1024);

// On the server
span.AddSentMessageEvent(seqNumber, 512, 1024);
{{</highlight>}}

{{<highlight python>}}
import datetime

clientEvent = time_event.MessageEvent(seqNumber, type=time_event.Type.RECEIVED,
                uncompressed_size_bytes=1024, compressed_size_bytes=512)
span.add_time_event(time_event.TimeEvent(datetime.datetime.utcnow(), clientEvent))

# On the server$
serverEvent = time_event.MessageEvent(seqNumber, type=time_event.Type.SENT,
                uncompressed_size_bytes=1024, compressed_size_bytes=512)
span.add_time_event(time_event.TimeEvent(datetime.datetime.utcnow(), serverEvent))
{{</highlight>}}

{{<highlight js>}}
const { MessageEventType } = require('@opencensus/core');

// On the client
span.addMessageEvent(MessageEventType.RECEIVED, /* id as a hex string */ seqNumber);

// On the server
span.addMessageEvent(MessageEventType.SENT, /* id as a hex string */ seqNumber);

{{</highlight>}}
{{</tabs>}}

### Visuals

* Received
![](/images/span-message-received-sample.png)

* Sent
![](/images/span-message-sent-sample.png)

### References
Resource|URL
---|---
Message event definition|[proto/v1/message_event](https://github.com/census-instrumentation/opencensus-proto/blob/99162e4df59df7e6f54a8a33b80f0020627d8405/src/opencensus/proto/trace/v1/trace.proto#L155-L183)
Go API|[Span.AddMessageReceiveEvent](https://godoc.org/go.opencensus.io/trace#Span.AddMessageReceiveEvent) [Span.AddMessageSendEvent](https://godoc.org/go.opencensus.io/trace#Span.AddMessageSendEvent)
Java API|[MessageEvent JavaDoc](https://static.javadoc.io/io.opencensus/opencensus-api/0.16.1/io/opencensus/trace/MessageEvent.html)
C++ API|[Span.AddMessageReceivedEvent](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/span.h#L127-L129) and [Span.AddMessageSentEvent](https://github.com/census-instrumentation/opencensus-cpp/blob/c5e59c48a3c40a7da737391797423b88e93fd4bb/opencensus/trace/span.h#L130-L133)
Python API|[MessageEvent](https://github.com/census-instrumentation/opencensus-python/blob/d9384fdfafebe678aef0d28a237d098f4e240ad7/opencensus/trace/time_event.py#L58-L107) [Span.add_time_event](https://github.com/census-instrumentation/opencensus-python/blob/d9384fdfafebe678aef0d28a237d098f4e240ad7/opencensus/trace/span.py#L202)
