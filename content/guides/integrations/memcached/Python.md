---
title: "PyMemache"
date: 2018-08-24T01:00:08-07:00
draft: false
aliases: [/integrations/memcached/python]
logo: /img/memcached-python.png
---

- [Introduction](#introduction)
- [Features](#features)
- [Using it](#using-it)
    - [Pip install it](#pip-install-it)
    - [In codeit](#in-code)
- [Problem statement](#problem-statement)
- [Enabling OpenCensus](#enabling-opencensus)
    - [Enabling tracing](#enabling-tracing)
    - [Enabling metrics](#enabling-metrics)
- [End to end example](#end-to-end-example)
- [Examining your traces](#enabling-your-traces)
- [References](#references)

## Introduction
[Memcached](https://memcached.org) is one of the most used server caching and scaling technologies.

It was created by [Brad Fitzpatrick](https://en.wikipedia.org/wiki/Brad_Fitzpatrick) in 2003 as a
solution to scale his social media product [Live Journal](https://www.livejournal.com/)

Pinterest's Python [PyMemcache](https://github.com/pinterest/pymemcache) client has been wrapped and instrumented with OpenCensus for tracing and metrics

## Features
* Trace instrumentation of all the methods
* Metrics such as "latency", "calls" which are both tagged by keys "method", "status", "error"

## Using it

### Pip install it
The package is available on pip at https://pypi.org/project/ocpymemcache/
and is installable by
```shell
pip install ocpymemcache
```

### In code

And then like you normally would create a pymemcache client, just replace the import
```python
from pymemcache.client.base import Client
```
with
```python
from ocpymemcache.client import OCPyMemcacheClient
```

and then finally replace `Client` with `OCPyMemcacheClient`
to give
```python
client = OCPyMemcacheClient(('localhost', 11211,))
```

instead of
```python
client = Client(('localhost', 11211,))
```

The same applies for hashclient, please replace
```python
from pymemcache.client.hash import HashClient
```

with
```python
from ocpymemcache.client import OCPyMemcacheHashClient
```

and finally
```python
client = HashClient([
    ('127.0.0.1', 11211),
    ('127.0.0.1', 11212),
])
```
with
```python
client = OCPyMemcacheHashClient([
    ('127.0.0.1', 11211),
    ('127.0.0.1', 11212),
])
```

Use it normally like you would have used the original package!

For a guided example,  please continue reading below.

## Problem statement

Our sample is an application excerpt from a distributed prime factorization engine that needs to calculate fibonacci numbers but would
like to reuse expensively calculated results since fibonacci numbers since the computations of such numbers are CPU intensive.

To share/memoize results amongst our distributed applications, we’ll use Memcache.
However, to examine our changes in a distributed systems deployment with numerous microservices, it is useful to have tracing and metrics to verify our optimizations
and inspect the state of the system.

This is what the code original looks like

{{% notice tip %}}
For assistance installing Memcached, please visit the [Memcached Installation wiki](https://github.com/memcached/memcached/wiki/Install)
{{% /notice %}}

Please run your Memcached server, for this example we'll run it locally on port 11211.

{{<highlight python>}}
#!/usr/bin/env python

import os
import time

from ocpymemcache.client import OCPyMemcacheClient
from ocpymemcache.observability import enable_metrics_views

def numAsStr(num): return '%d'%(num)

def main():
    # Create the Memcache client
    mc = OCPyMemcacheClient(("localhost", 11211,))

    doWork(mc)

    time.sleep(5)

def doWork(mc):
    values = [
        30, 33,
    ]

    for value in values:
        for i in range(0, 2):
            nf = nthFibonacci(mc, value)
            print("Fibonacci %d ==> %d"%(value, nf))

        # Afterwards, clean up to ensure repeatability of the test
        mc.delete(numAsStr(value))

def fib(n):
    if n <= 0:
        return 1

    return fib(n-2) + fib(n-1)

def nthFibonacci(mc, n):
    # Firstly check if we've cached it
    numStr = numAsStr(n)

    res = mc.get(numStr)
    if res is not None:
        try: # Try parsing it as a float
            return int(res)
        except ValueError as e:
            # Failed to parse it
            _ = 0

    # Otherwise this was a cache miss, so go on
    value = fib(n)

    asStr = numAsStr(value)

    # Now cache it for a cache hit later on
    mc.set(numStr, asStr)
    return value

if __name__ == '__main__':
    main()
{{</highlight>}}

## Enabling OpenCensus
To provide observability, we'll enable tracing by importing OpenCensus Python's tracing package

{{<highlight python>}}
from opencensus.trace.tracer import Tracer

# For demo purposes, we'll always sample
from opencensus.trace.samplers import always_on

tracer = Tracer(sampler=always_on.AlwaysSampler())
{{</highlight>}}

### Enabling tracing
Enabling any of the [Python OpenCensus trace exporters](/guides/exporters/supported-exporters/python/)

For this example, we'll use Stackdriver Tracing and then create a Tracer.

With Memcached now installed and running, we'll use Stackdriver Tracing

{{% notice tip %}}
For assistance setting up Stackdriver, please visit this [Stackdriver setup guided codelab](/codelabs/stackdriver)
{{% /notice %}}

{{<highlight python>}}
import os

from opencensus.trace.exporters import stackdriver_exporter
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport

def main():
    gcp_project_id = os.environ.get('PROJECT_ID', 'census-demos')

    # Enable tracing
    texp = stackdriver_trace.StackdriverExporter(
            project_id=gcp_project_id,
            transport=BackgroundThreadTransport)
    tracer = Tracer(sampler=always_on.AlwaysOnSampler(), exporter=texp)
{{</highlight>}}

### Enabling metrics
Enabling any of the [Python OpenCensus stats exporters](/guides/exporters/supported-exporters/python/)

For this example, we'll use Stackdriver Monitoring.

{{% notice tip %}}
For assistance setting up Stackdriver, please visit this [Stackdriver setup guided codelab](/codelabs/stackdriver)
{{% /notice %}}

{{<highlight python>}}
import os

from ocpymemcache.observability import enable_metrics_views

from opencensus.stats import stats as stats_module
from opencensus.stats.exporters import stackdriver_exporter as stackdriver_stats

def main():
    gcp_project_id = os.environ.get('PROJECT_ID', 'census-demos')

    # Enable metrics
    mexp = stackdriver_stats.new_stats_exporter(
            stackdriver_stats.Options(project_id=gcp_project_id))
    stats = stats_module.Stats()
    view_manager = stats.view_manager
    view_manager.register_exporter(mexp)
    enable_metrics_views()
{{</highlight>}}

## End to end example

{{<highlight python>}}
#!/usr/bin/env python

import os
import time

from ocpymemcache.client import OCPyMemcacheClient
from ocpymemcache.observability import enable_metrics_views

# Observability from OpenCensus
from opencensus.stats import stats as stats_module
from opencensus.stats.exporters import stackdriver_exporter as stackdriver_stats
from opencensus.trace import execution_context
from opencensus.trace.exporters import stackdriver_exporter as stackdriver_trace
from opencensus.trace.exporters.transports.background_thread import BackgroundThreadTransport
from opencensus.trace.samplers import always_on
from opencensus.trace.status import Status
from opencensus.trace.tracer import Tracer

def numAsStr(num): return '%d'%(num)

def main():
    gcp_project_id = os.environ.get('PROJECT_ID', 'census-demos')

    # Enable tracing
    texp = stackdriver_trace.StackdriverExporter(
            project_id=gcp_project_id,
            transport=BackgroundThreadTransport)
    tracer = Tracer(sampler=always_on.AlwaysOnSampler(), exporter=texp)

    # Enable metrics
    mexp = stackdriver_stats.new_stats_exporter(
            stackdriver_stats.Options(project_id=gcp_project_id))
    stats = stats_module.Stats()
    view_manager = stats.view_manager
    view_manager.register_exporter(mexp)
    enable_metrics_views()

    # Create the Memcache client
    mc = OCPyMemcacheClient(("localhost", 11211,))

    with tracer.span(name='MemcachePythonUsage') as span:
        doWork(mc)

    time.sleep(5)

def doWork(mc):
    values = [
        30, 33,
    ]

    tracer = execution_context.get_opencensus_tracer()
    for value in values:
        with tracer.span(name='CalculateFibonacci-%d'%(value)) as cspan:
            for i in range(0, 2):
                with tracer.span(name='Round-%d'%(i+1)) as span:
                    nf = nthFibonacci(tracer, mc, value)
                    print("Fibonacci %d ==> %d"%(value, nf))

            # Afterwards, clean up to ensure repeatability of the test
            mc.delete(numAsStr(value))
            cspan.finish()

def fib(n):
    if n <= 0:
        return 1

    return fib(n-2) + fib(n-1)

def nthFibonacci(tracer, mc, n):
    with tracer.span('nthFibonacci') as span:
        return doNthFibonacci(tracer, span, mc, n)

def doNthFibonacci(tracer, parent_span, mc, n):
    # Firstly check if we've cached it
    with tracer.span('serialize-num'):
        numStr = numAsStr(n)

    res = mc.get(numStr)
    if res is not None:
        with tracer.span('try-deserialize') as span:
            try: # Try parsing it as a float
                span.add_annotation('Cache hit', key=numStr, value=res)
                return int(res)
            except ValueError as e:
                # Failed to parse it
                span.status = Status.from_exception(e)

    parent_span.add_annotation('Cache miss', key=numStr)
    with tracer.span('Fib'):
        # Otherwise this was a cache miss, so go on
        value = fib(n)
        # time.sleep(0.7) # Artificial delay

    with tracer.span('serialize-num'):
        asStr = numAsStr(value)

    # Now cache it for a cache hit later on
    mc.set(numStr, asStr)
    return value

if __name__ == '__main__':
    main()
{{</highlight>}}

We'll then run the code by `python main.py` which will produce output such as
```shell
Background thread started.
Fibonacci 30 ==> 2178309
Fibonacci 30 ==> 2178309
Fibonacci 33 ==> 9227465
Fibonacci 33 ==> 9227465
Sending all pending spans before terminated.
Background thread exited.
Sent all pending spans.
```

## Examining your traces

Please visit https://console.cloud.google.com/traces

Opening our console will produce something like

![All traces](/img/memcache-tracing-python-all_traces.png)

and for the details of a single trace
![Single trace detail](/img/memcache-tracing-python-trace_detail.png)

## References

Resource|URL
---|---
OCPyMemcache on Github|https://github.com/opencensus-integrations/ocpymemcache
OCPyMemcache on PyPi|https://pypi.org/project/ocpymemcache
Memcached|https://memcached.org/
OpenCensus Python on Github|https://github.com/census-instrumentation/opencensus-python
