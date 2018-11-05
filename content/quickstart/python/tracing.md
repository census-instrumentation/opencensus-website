---
title: "Tracing"
date: 2018-07-22T20:29:06-07:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#import-tracing-packages)
    - [Instrumentation](#instrument-tracing)
- [Exporting Traces to Zipkin](#exporting-traces-to-zipkin)
    - [Import Packages](#import-exporting-packages)
    - [Create Annotations](#create-annotations)
- [Running the code](#running-the-code)
- [Viewing your Traces](#viewing-your-traces)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

## Requirements
- Python
- Zipkin as our choice of tracing backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.

You can swap out any other exporter from the [list of Python exporters](/guides/exporters/supported-exporters/python)
{{% /notice %}}

## Installation

OpenCensus: `pip install opencensus`

## Getting Started

{{% notice note %}}
Unsure how to write and execute Python code? [Click here](https://docs.python.org/).
{{% /notice %}}

It would be nice if we could trace the following code, thus giving us observability in to how the code functions.

First, create a file called `repl.py`.
```bash
touch repl.py
```

Next, put the following code inside of `repl.py`:

{{<highlight python>}}
#!/usr/bin/env python

import sys

def main():
    # In a REPL:
    #1. Read input
    #2. process input
    while True:
        line = sys.stdin.readline()
        print(line.upper())
{{</highlight>}}

You can run the code via `python repl.py`.

## Enable Tracing

<a name="import-tracing-packages"></a>
### Import Packages

To enable tracing, we’ll import the `trace.tracer` package from `opencensus`
{{<tabs Snippet All>}}
{{<highlight python>}}
from opencensus.trace.tracer import Tracer
{{</highlight>}}

{{<highlight python>}}
#!/usr/bin/env python

import sys

from opencensus.trace.tracer import Tracer

def main():
    # In a REPL:
    #1. Read input
    #2. process input
    while True:
        line = sys.stdin.readline()
        print(line.upper())

{{</highlight>}}
{{</tabs>}}

<a name="instrument-tracing"></a>
### Instrumentation

We will be tracing the execution as it starts in `readEvaluateProcessLine`, goes to `readLine`, and finally travels through `processLine`.

To accomplish this, we must do two things:

**1. Create a span in each of the three functions**

You can create a span by inserting the following two lines in each of the three functions:
```python
with tracer.span(name=name):
    # Code here
    pass
```

{{<tabs Snippet All>}}
{{<highlight python>}}
from opencensus.trace.tracer import Tracer

tracer = Tracer()
with tracer.span(name="repl") as span:
    print(line.upper())
{{</highlight>}}

{{<highlight python>}}
#!/usr/bin/env python

import sys

from opencensus.trace.tracer import Tracer

def main():
    # In a REPL:
    # 1. Read input
    # 2. process input
    while True:
        readEvaluateProcessLine()

def readEvaluateProcessLine():
    tracer = Tracer()
    with tracer.span(name="repl") as span:
        line = sys.stdin.readline()
        print(line.upper())
{{</highlight>}}
{{</tabs>}}

When creating a new span with `tracer.span("spanName")`, the package first checks if a parent Span already exists in the current thread local storage/context. If it exists, a child span is created. Otherwise, a newly created span is inserted in to the thread local storage/context to become the parent Span.

## Exporting traces to Zipkin

<a name="import-exporting-packages"></a>
### Import Packages
To turn on Zipkin tracing, we’ll need to import the Zipkin exporter from `opencensus.trace.exporters`

{{<tabs Snippet All>}}
{{<highlight python>}}
from opencensus.trace.exporters.zipkin_exporter import ZipkinExporter
from opencensus.trace.samplers import always_on
{{</highlight>}}

{{<highlight python>}}
#!/usr/bin/env python

import os
import sys

from opencensus.trace.tracer import Tracer
from opencensus.trace.exporters.zipkin_exporter import ZipkinExporter
from opencensus.trace.samplers import always_on

# Firstly create the exporter
ze = ZipkinExporter(service_name="ocpythonquick",
                                host_name='localhost',
                                port=9411,
                                endpoint='/api/v2/spans')

def main():
    # Firstly enable the exporter

    # In a REPL:
    # 1. Read input
    # 2. process input
    while True:
        readEvaluateProcessLine()

def readEvaluateProcessLine():
    # For demo purposes, we are always sampling
    tracer = Tracer(sampler=always_on.AlwaysOnSampler(), exporter=ze)
    with tracer.span(name="repl") as span:
        line = sys.stdin.readline()
        out = processInput(tracer, line)
        print("< %s"%(out))

def processInput(tracer, data):
    with tracer.span(name='processInput') as span:
        return data.upper()
{{</highlight>}}
{{</tabs>}}

### Create Annotations
We can add metadata to our traces to increase our post-mortem insight.

Let's record the length of each requested string so that it is available to view when we are looking at our traces. We can do this by annotating our `readEvaluateProcessLine` function.

{{<tabs Snippet All>}}
{{<highlight python>}}
span.add_annotation("Invoking processLine", len=len(line), use="repl")
{{</highlight>}}

{{<highlight python>}}
#!/usr/bin/env python

import os
import sys

from opencensus.trace.tracer import Tracer
from opencensus.trace.exporters.zipkin_exporter import ZipkinExporter
from opencensus.trace.samplers import always_on

# Firstly create the exporter
ze = ZipkinExporter(service_name="ocpythonquick",
                                host_name='localhost',
                                port=9411,
                                endpoint='/api/v2/spans')


def main():
    # Firstly enable the exporter

    # In a REPL:
    # 1. Read input
    # 2. process input
    while True:
        readEvaluateProcessLine()

def readEvaluateProcessLine():
    # For demo purposes, we are always sampling
    tracer = Tracer(sampler=always_on.AlwaysOnSampler(), exporter=ze)
    with tracer.span(name="repl") as span:
        line = sys.stdin.readline()
        span.add_annotation("Invoking processLine", len_=len(line), use="repl")
        out = processInput(tracer, line)
        print("< %s"%(out))
        span.finish()

def processInput(tracer, data):
    with tracer.span(name='processInput'):
        return data.upper()

if __name__ == "__main__":
    main()
{{</highlight>}}
{{</tabs>}}

## Running the code

Having already successfully started Zipkin as in [Zipkin Codelab](/codelabs/zipkin), we can now run our code by

```shell
python repl.py
```

## Viewing your Traces
With the above you should now be able to navigate to the Zipkin UI at http://localhost:9411, which will produce such a screenshot:
![](/images/trace-python-zipkin-all-traces.png)

On clicking on one of the traces, we should be able to see the following:
![](/images/trace-python-zipkin-single-trace.png)

And on clicking on `More info` we should see
![](/images/trace-python-zipkin-all-details.png)

## References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
Python exporters|[Python exporters](/guides/exporters/supported-exporters/python)
