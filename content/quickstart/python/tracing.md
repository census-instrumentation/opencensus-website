---
title: "Tracing"
date: 2018-07-22T20:29:06-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Run it locally](#run-it-locally)
- [How does it work?](#how-does-it-work?)
- [Configure Exporter](#configure-exporter)
- [Configure Sampler](#configure-sampler)
- [Using the Tracer](#using-the-tracer)
- [Create a span](#create-a-span)
- [Create a child span](#create-a-child-span)
- [References](#references)

#### Run it locally
1. Clone the example repository: `git clone https://github.com/opencensus-otherwork/opencensus-quickstarts`
2. Change to the example directory: `cd opencensus-quickstarts/python/tracing-to-zipkin`
3. Install dependencies: `pip install opencensus opencensus-ext-zipkin`
4. Download Zipkin: `curl -sSL https://zipkin.io/quickstart.sh | bash -s`
5. Start Zipkin: `java -jar zipkin.jar`
6. Run the code: `python tracingtozipkin.py`
7. Navigate to Zipkin Web UI: http://localhost:9411
8. Click Find Traces, and you should see a trace.
9. Click into that, and you should see the details.

![](/images/python-tracing-zipkin.png)

#### How does it work?
{{% tabs Snippet All %}}
```py
# 1a. Setup the exporter
ze = ZipkinExporter(service_name="python-quickstart",
                                host_name='localhost',
                                port=9411,
                                endpoint='/api/v2/spans')
# 1b. Set the tracer to use the exporter
# 2. Configure 100% sample rate, otherwise, few traces will be sampled.
# 3. Get the global singleton Tracer object
tracer = Tracer(exporter=ze, sampler=AlwaysOnSampler())

def main():
    # 4. Create a scoped span. The span will close at the end of the block.
    with tracer.span(name="main") as span:
        for i in range(0, 10):
            doWork()
```

```py
#!/usr/bin/env python

import os
from datetime import datetime
import time
import sys

from opencensus.trace.tracer import Tracer
from opencensus.trace import time_event as time_event_module
from opencensus.ext.zipkin.trace_exporter import ZipkinExporter
from opencensus.trace.samplers import AlwaysOnSampler

# 1a. Setup the exporter
ze = ZipkinExporter(service_name="python-quickstart",
                                host_name='localhost',
                                port=9411,
                                endpoint='/api/v2/spans')
# 1b. Set the tracer to use the exporter
# 2. Configure 100% sample rate, otherwise, few traces will be sampled.
# 3. Get the global singleton Tracer object
tracer = Tracer(exporter=ze, sampler=always_on.AlwaysOnSampler())

def main():
    # 4. Create a scoped span. The span will close at the end of the block.
    with tracer.span(name="main") as span:
        for i in range(0, 10):
            doWork()

def doWork():
    # 5. Start another span. Because this is within the scope of the "main" span,
    # this will automatically be a child span.
    with tracer.span(name="doWork") as span:
        print("doing busy work")
        try:
            time.sleep(0.1)
        except:
            # 6. Set status upon error
            span.status = Status(5, "Error occurred")

        # 7. Annotate our span to capture metadata about our operation
        span.add_annotation("invoking doWork")

if __name__ == "__main__":
    main()
```
{{% /tabs %}}

#### Configure Exporter
OpenCensus can export traces to different distributed tracing stores (such as Zipkin, Jeager, Stackdriver Trace). In (1), we configure OpenCensus to export to Zipkin, which is listening on `localhost` port `9411`, and all of the traces from this program will be associated with a service name `python-quickstart`.
```py
# 1a. Setup the exporter
ze = ZipkinExporter(service_name="python-quickstart",
                                host_name='localhost',
                                port=9411,
                                endpoint='/api/v2/spans')
# 1b. Set the tracer to use the exporter
tracer = Tracer(exporter=ze, sampler=always_on.AlwaysOnSampler())
```
#### Configure Sampler
Configure 100% sample rate, otherwise, few traces will be sampled.
```py
# 2. Configure 100% sample rate, otherwise, few traces will be sampled.
tracer = Tracer(exporter=ze, sampler=always_on.AlwaysOnSampler())
```

#### Using the Tracer
To start a trace, you first need to get a reference to the `Tracer` (3). It can be retrieved as a global singleton.
```py
# 3. Get the global singleton Tracer object
tracer = Tracer(exporter=ze, sampler=always_on.AlwaysOnSampler())
```

#### Create a span
To create a span in a trace, we used the `Tracer` to start a new span (4). A span will automatically close at the end of the block.
```py
# 4. Create a scoped span. The span will close at the end of the block.
with tracer.span(name="main") as span:
```

#### Create a child span
The `main` method calls `doWork` a number of times. Each invocation also generates a child span. Take a look at the `doWork` method.
```py
def doWork():
    # 5. Start another span. Because this is within the scope of the "main" span,
    # this will automatically be a child span.
    with tracer.span(name="doWork") as span:
        print("doing busy work")
        try:
            time.sleep(0.1)
        except:
            # 6. Set status upon error
            span.status = Status(5, "Error occurred")

        # 7. Annotate our span to capture metadata about our operation
        span.add_annotation("invoking doWork")
```

#### Set the Status of the span
We can set the [status](https://opencensus.io/tracing/span/status/) of our span to create more observability of our traced operations.
```py
# 6. Set status upon error
span.status = Status(5, "Error occurred")
```

#### Create an Annotation
An [annotation](https://opencensus.io/tracing/span/time_events/annotation/) tells a descriptive story in text of an event that occurred during a span’s lifetime.
```py
# 7. Annotate our span to capture metadata about our operation
span.add_annotation("invoking doWork")
```

#### References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
Python exporters|[Python exporters](/guides/exporters/supported-exporters/python)
