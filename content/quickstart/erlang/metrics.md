---
title: "Metrics"
date: 2018-11-17T08:00:00-00:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Brief Overview](#brief-overview)
- [Getting started](#getting-started)
- [Enable Metrics](#enable-metrics)
    - [Include OpenCensus Application](#include-opencensus-application)
    - [Create Metrics](#create-metrics)
    - [Inserting Tags](#inserting-tags)
    - [Recording Metrics](#recording-metrics)
- [Enable Views](#enable-views)
    - [Create Views](#create-views)
    - [Register Views](#register-views)
- [Exporting stats](#exporting-stats)
    - [Include Exporting Application](#include-exporting-application)
    - [Create the exporter](#create-the-exporter)
    - [Register the exporter](#register-the-exporter)
- [End to end code](#end-to-end-code)
    - [Running the tutorial](#running-the-tutorial)
    - [Prometheus configuration file](#prometheus-configuration-file)
    - [Running Prometheus](#running-prometheus)
- [Viewing your metrics](#viewing-your-metrics)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Collect metrics using [OpenCensus Metrics](/core-concepts/metrics) and [Tags](/core-concepts/tags)
2. Register and enable an exporter for any [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View the metrics on the backend of our choice

## Requirements
- Erlang 20.0 or above
- [Rebar3](https://www.rebar3.org/)
- Prometheus as our choice of metrics backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Prometheus, [Click here](/codelabs/prometheus) for a guided codelab.

You can swap out any other exporter from the [list of Erlang exporters](/guides/exporters/supported-exporters)
{{% /notice %}}

## Installation

For OpenCensus metrics functionality and Prometheus exporting just add the `opencensus` and `opencensus_erlang_prometheus` hex dependencies to your project's `rebar.config`:

```erlang
{deps, [opencensus, opencensus_erlang_prometheus]}.
```

## Brief Overview
By the end of this tutorial, we will do these four things to obtain metrics using OpenCensus:

1. Create quantifiable metrics (numerical) that we will record
2. Create [tags](/core-concepts/tags) that we will associate with our metrics
3. Organize our metrics, similar to writing a report, in to a `View`
4. Export our views to a backend (Prometheus in this case)


## Getting Started

{{% notice note %}}
Unsure how to write and execute Erlang code? [Click here](http://howistart.org/posts/erlang/1/index.html).
{{% /notice %}}

We will be a simple "read-evaluate-print-loop" (REPL) app. In there we'll collect some metrics to observe the work that is going on within this code, such as:

- Latency per processing loop
- Number of lines read
- Number of errors
- Line lengths

First, create a project named `repl`.

```bash
rebar3 new lib repl
```

Next, put the following code inside of `src/repl.erl`:

{{<highlight erlang>}}
-module(repl).

-export([run/0]).

run() ->
    read_eval_process().

read_eval_process() ->
    Line = io:get_line("> "),
    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),
    read_eval_process().

process_line(Line) ->
    string:uppercase(Line).
{{</highlight>}}

You can run the code via `rebar3 shell` followed by `repl:run().`.

## Enable Metrics

<a name="include-opencensus-application"></a>
### Include OpenCensus Application

To enable metrics, we'll include `opencensus` application in our project's `.app.src` file so it is started as a dependency of our application. Your `src/repl.app.src` will looks like:

```erlang
{application, repl,
 [{description, "OpenCensus REPL example"},
  {vsn, "0.1.0"},
  {registered, []},
  {applications,
   [kernel,
    stdlib,
    opencensus,
    opencensus_erlang_prometheus
   ]},
  {env,[]},
  {modules, []},
]}.
```

To start the applications when running the rebar3 shell for development you'll add the following to `rebar.config`:

```erlang
{shell, [{apps, [repl]},
         {config, "config/sys.config"}]}.
```

<a name="create-metrics"></a>
### Create Metrics

First, we will create the measures needed to later record our metrics.

{{<tabs Snippet All>}}
{{<highlight erlang>}}
measures() ->
    oc_stat_measure:new('repl/latency', "The latency in milliseconds per REPL loop", millisecond),
    oc_stat_measure:new('repl/errors', "The number of errors encountered", none),
    oc_stat_measure:new('repl/line_lengths', "The distribution of line lengths", bytes).
{{</highlight>}}

{{<highlight erlang>}}
-module(repl).

-export([run/0]).

run() ->
    measures(),
    read_eval_process().

read_eval_process() ->
    Line = read_line(),
    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),
    read_eval_process().

read_line() ->
    io:get_line("> ").

process_line(Line) ->
    string:uppercase(Line).

measures() ->
    oc_stat_measure:new('repl/latency', "The latency in milliseconds per REPL loop", millisecond),
    oc_stat_measure:new('repl/errors', "The number of errors encountered", none),
    oc_stat_measure:new('repl/line_lengths', "The distribution of line lengths", bytes).
{{</highlight>}}
{{</tabs>}}

### Inserting Tags

Now we will insert a specific tag called "repl" into the process dictionary.

{{<tabs Snippet All>}}
{{<highlight erlang>}}
ocp:with_tags(#{method => "repl"})
{{</highlight>}}

{{<highlight erlang>}}
-module(repl).

-export([run/0]).

run() ->
    measures(),
    read_eval_process().

read_eval_process() ->
    ocp:with_tags(#{method => "repl"}),

    Line = read_line(),
    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),
    read_eval_process().

read_line() ->
    io:get_line("> ").

process_line(Line) ->
    string:uppercase(Line).

measures() ->
    oc_stat_measure:new('repl/latency', "The latency in milliseconds per REPL loop", millisecond),
    oc_stat_measure:new('repl/errors', "The number of errors encountered", none),
    oc_stat_measure:new('repl/line_lengths', "The distribution of line lengths", bytes).
{{</highlight>}}
{{</tabs>}}

### Recording Metrics

Now we will record the desired metrics tagged with the tags we set above. To do so, we will use `ocp:record/2`.

{{<tabs Snippet All>}}
{{<highlight erlang>}}
process_line(Line) ->
    Start = erlang:monotonic_time(),
    Upper = string:uppercase(Line),
    ocp:record('repl/latency', erlang:convert_time_unit(erlang:monotonic_time() - Start,
                                                        native, millisecond)),
    ocp:record('repl/line_length', erlang:iolist_size(Line)),
    Upper.
{{</highlight>}}

{{<highlight erlang>}}
-module(repl).

-export([run/0]).

run() ->
    measures(),
    read_eval_process().

read_eval_process() ->
    ocp:with_tags(#{method => "repl"}),

    Line = read_line(),
    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),
    read_eval_process().

read_line() ->
    io:get_line("> ").

process_line(Line) ->
    Start = erlang:monotonic_time(),
    Upper = string:uppercase(Line),
    ocp:record('repl/latency', erlang:convert_time_unit(erlang:monotonic_time() - Start,
                                                        native, millisecond)),
    ocp:record('repl/line_length', erlang:iolist_size(Line)),
    Upper.

measures() ->
    oc_stat_measure:new('repl/latency', "The latency in milliseconds per REPL loop", milliseconds),
    oc_stat_measure:new('repl/errors', "The number of errors encountered", none),
    oc_stat_measure:new('repl/line_lengths', "The distribution of line lengths", bytes).
{{</highlight>}}
{{</tabs>}}

## Enable Views

### Create and Register Views
We now determine how our metrics will be organized by creating `Views`.

{{<tabs Snippet All>}}
{{<highlight erlang>}}
views() ->
    Views = [#{name => "demo/latency",
               description => "The distribution of the latencies",
               tags => [method],
               measure => 'repl/latency',
               aggregation => latency_distribution()},
             #{name => "demo/lines_in",
               description => "The number of lines from standard input",
               tags => [method],
               measure => 'repl/line_length',
               aggregation => oc_stat_aggregation_count},
             #{name => "demo/errors",
               description => "The number of errors encountered",
               tags => [],
               measure => 'repl/errors',
               aggregation => oc_stat_aggregation_count},
             #{name => "demo/line_length",
               description => "Groups the lengths of keys in buckets",
               tags => [method],
               measure => 'repl/line_length',
               aggregation => size_distribution()}],

    [oc_stat_view:subscribe(V) || V <- Views].
{{</highlight>}}

{{<highlight erlang>}}
-module(repl).

-export([run/0]).

run() ->
    measures(),
    views(),
    read_eval_process().

read_eval_process() ->
    ocp:with_tags(#{method => "repl"}),

    Line = read_line(),
    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),
    read_eval_process().

read_line() ->
    io:get_line("> ").

process_line(Line) ->
    Start = erlang:monotonic_time(),
    Upper = string:uppercase(Line),
    ocp:record('repl/latency', erlang:convert_time_unit(erlang:monotonic_time() - Start,
                                                        native, millisecond)),
    ocp:record('repl/line_length', erlang:iolist_size(Line)),
    Upper.

measures() ->
    oc_stat_measure:new('repl/latency', "The latency in milliseconds per REPL loop", milliseconds),
    oc_stat_measure:new('repl/errors', "The number of errors encountered", none),
    oc_stat_measure:new('repl/line_lengths', "The distribution of line lengths", bytes).

views() ->
    Views = [#{name => "demo/latency",
               description => "The distribution of the latencies",
               tags => [method],
               measure => 'repl/latency',
               aggregation => latency_distribution()},
             #{name => "demo/lines_in",
               description => "The number of lines from standard input",
               tags => [method],
               measure => 'repl/line_length',
               aggregation => oc_stat_aggregation_count},
             #{name => "demo/errors",
               description => "The number of errors encountered",
               tags => [],
               measure => 'repl/errors',
               aggregation => oc_stat_aggregation_count},
             #{name => "demo/line_length",
               description => "Groups the lengths of keys in buckets",
               tags => [method],
               measure => 'repl/line_length',
               aggregation => size_distribution()}],

    [oc_stat_view:subscribe(V) || V <- Views].


latency_distribution() ->
    {oc_stat_aggregation_distribution, [{buckets, [0, 25, 50, 75, 100, 200, 400,
                                                   600, 800, 1000, 2000, 4000, 6000]}]}.

size_distribution() ->
    {oc_stat_aggregation_distribution, [{buckets, [0, 5, 10, 15, 20, 40, 60, 80,
                                                   100, 200, 400, 600, 800, 1000]}]}.
{{</highlight>}}
{{</tabs>}}

## Exporting stats

<a name="include-exporting-application"></a>
### Include Exporting Application

We will be adding the Prometheus Erlang exporter hex package to `rebar.config` and application to `repl.app.src`:

```erlang
{erl_opts, [debug_info]}.
{deps, [opencensus, opencensus_erlang_prometheus]}.

{shell, [{apps, [repl]},
         {config, "config/sys.config"}]}.
```

```erlang
{application, repl,
 [{description, "OpenCensus REPL example"},
  {vsn, "0.1.0"},
  {registered, []},
  {applications,
   [kernel,
    stdlib,
    opencensus,
    opencensus_erlang_prometheus
   ]},
  {env,[]},
  {modules, []}]}.
```

### Create the exporter

In order for our metrics to be exported to Prometheus, our application needs to be exposed as a scrape endpoint. The simplest method to achieve this is to use Erlang's included HTTP server through `prometheus_httpd`. Add the hex package to `rebar.config` and the applications to `repl.app.src`:

```erlang
{erl_opts, [debug_info]}.
{deps, [opencensus, opencensus_erlang_prometheus, prometheus, prometheus_httpd]}.

{shell, [{apps, [repl]},
         {config, "config/sys.config"}]}.
```

```erlang
{application, repl,
 [{description, "OpenCensus REPL example"},
  {vsn, "0.1.0"},
  {registered, []},
  {applications,
   [kernel,
    stdlib,
    opencensus,
    opencensus_erlang_prometheus,
    prometheus_httpd,
    inets
   ]},
  {env,[]},
  {modules, []}]}.
```

Then in `run/0` start the server:

```erlang
run() ->
    prometheus_httpd:start(),
    measures(),
    views(),
    read_eval_process().
```

For production you might want to instead use [Elli](https://github.com/elli-lib/elli) which can easily be setup to export Prometheus metrics and has an existing [middleware](https://github.com/opencensus-beam/opencensus_elli) for OpenCensus tracing and metrics.

### Register the exporter

```erlang
prometheus_registry:register_collector(oc_stat_exporter_prometheus)
```


## End to end code
Collectively the code will be

{{<highlight erlang>}}
-module(repl).

-export([run/0]).

run() ->
    prometheus_registry:register_collector(oc_stat_exporter_prometheus),
    prometheus_httpd:start(),
    measures(),
    views(),
    read_eval_process().

read_eval_process() ->
    ocp:with_tags(#{method => "repl"}),

    Line = read_line(),
    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),
    read_eval_process().

read_line() ->
    io:get_line("> ").

process_line(Line) ->
    Start = erlang:monotonic_time(),
    Upper = string:uppercase(Line),
    ocp:record('repl/latency', erlang:convert_time_unit(erlang:monotonic_time() - Start,
                                                        native, millisecond)),
    ocp:record('repl/line_length', erlang:iolist_size(Line)),
    Upper.

measures() ->
    oc_stat_measure:new('repl/latency', "The latency in milliseconds per REPL loop", milliseconds),
    oc_stat_measure:new('repl/errors', "The number of errors encountered", none),
    oc_stat_measure:new('repl/line_length', "The distribution of line lengths", bytes).

views() ->
    Views = [#{name => "demo/latency",
               description => "The distribution of the latencies",
               tags => [method],
               measure => 'repl/latency',
               aggregation => latency_distribution()},
             #{name => "demo/lines_in",
               description => "The number of lines from standard input",
               tags => [method],
               measure => 'repl/line_length',
               aggregation => oc_stat_aggregation_count},
             #{name => "demo/errors",
               description => "The number of errors encountered",
               tags => [],
               measure => 'repl/errors',
               aggregation => oc_stat_aggregation_count},
             #{name => "demo/line_lengths",
               description => "Groups the lengths of keys in buckets",
               tags => [method],
               measure => 'repl/line_length',
               aggregation => size_distribution()}],

    [oc_stat_view:subscribe(V) || V <- Views].


latency_distribution() ->
    {oc_stat_aggregation_distribution, [{buckets, [0, 25, 50, 75, 100, 200, 400,
                                                   600, 800, 1000, 2000, 4000, 6000]}]}.

size_distribution() ->
    {oc_stat_aggregation_distribution, [{buckets, [0, 5, 10, 15, 20, 40, 60, 80,
                                                   100, 200, 400, 600, 800, 1000]}]}.
{{</highlight>}}


### Running the tutorial

This step involves running the tutorial application in one terminal and then Prometheus itself in another terminal.

```shell
rebar3 shell --sname repl@localhost

(repl@localhost)1> repl:run().
```

### Prometheus configuration file

To enable Prometheus to scrape from your application, we have to point it towards the tutorial application whose
server is running on "localhost:8081".

To do this, we firstly need to create a YAML file with the configuration e.g. `promconfig.yaml`
whose contents are:
```yaml
scrape_configs:
  - job_name: 'ocmetricstutorial'

    scrape_interval: 10s

    static_configs:
      - targets: ['localhost:8081']
```

### Running Prometheus

With that file saved as `promconfig.yaml` we should now be able to run Prometheus like this

```shell
prometheus --config.file=promconfig.yaml
```

and then return to the terminal that's running the Erlang metrics tutorial and generate some work by typing inside it.

## Viewing your metrics
With the above you should now be able to navigate to the Prometheus UI at http://localhost:9090

which should show:

* Lines-in counts
![](/images/metrics-erlang-prometheus-lines_in.png)

* Latency distributions
![](/images/metrics-erlang-prometheus-latency-distribution.png)

* Line lengths distributions
![](/images/metrics-erlang-prometheus-line_lengths-distribution.png)


Resource|URL
---|---
Prometheus project|https://prometheus.io/
Prometheus Erlang exporter|https://github.com/opencensus-beam/prometheus
OpenCensus Erlang package|https://github.com/census-instrumentation/opencensus-erlang
