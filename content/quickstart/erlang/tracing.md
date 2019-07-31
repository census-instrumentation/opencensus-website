---
title: "Tracing"
date: 2018-11-17T08:00:00-00:00
draft: false
class: "shadowed-image lightbox"
---

- [Requirements](#requirements)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Enable Tracing](#enable-tracing)
    - [Import Packages](#include-opencensus-application)
    - [Instrumentation](#instrument-tracing)
- [Exporting traces](#exporting-to-zipkin)
    - [Create Annotations](#create-annotations)
- [End to end code](#end-to-end-code)
- [Viewing your traces](#viewing-your-traces)
- [References](#references)

In this quickstart, we’ll glean insights from code segments and learn how to:

1. Trace the code using [OpenCensus Tracing](/core-concepts/tracing)
2. Register and enable an exporter for a [backend](/core-concepts/exporters/#supported-backends) of our choice
3. View traces on the backend of our choice

## Requirements

- Erlang 20.0+ and rebar3 or Elixir 1.5+
- Zipkin as our choice of tracing backend: we are picking it because it is free, open source and easy to setup

{{% notice tip %}}
For assistance setting up Zipkin, [Click here](/codelabs/zipkin) for a guided codelab.

You can swap out any other exporter from the [list of Erlang/Elixir exporters](/guides/exporters/supported-exporters/erlang)
{{% /notice %}}

## Installation

OpenCensus Erlang comes with the Zipkin reporter so simply add the `opencensus` hex dependency to your project's `rebar.config` or `mix.exs`:

{{<tabs Erlang Elixir>}}
{{<highlight erlang>}}
{deps, [opencensus, opencensus_zipkin]}.
{{</highlight>}}

{{<highlight elixir>}}
defp deps() do
 [
  {:opencensus_elixir, "~> 0.2.0"},
  {:opencensus_zipkin, "~> 0.1.0"}
 ]
end
{{</highlight>}}
{{</tabs>}}

## Getting Started

{{% notice note %}}
Unsure how to write and execute Erlang or Elixir code? [Click here for an Erlang tutorial](http://howistart.org/posts/erlang/1/index.html) and [here for an Elixir tutorial](http://howistart.org/posts/elixir/1/index.html)..
{{% /notice %}}

It would be nice if we could trace the following code, thus giving us observability in to how the code functions.

First, create a project named `repl`.

{{<tabs Erlang Elixir>}}
{{<highlight erlang>}}
rebar3 new lib repl
{{</highlight>}}

{{<highlight elixir>}}
mix new repl
{{</highlight>}}
{{</tabs>}}

Next, put the following code inside of `src/repl.erl`:

{{<tabs Erlang Elixir>}}
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

{{<highlight elixir>}}
defmodule Repl do
  def run() do
    read_eval_process()
  end

  defp read_eval_process() do
    line = IO.gets("> ")
    out = process_line(line)
    IO.puts("< " <> out)
    read_eval_process()
  end

  defp process_line(line) do
    String.upcase(line)
  end
end
{{</highlight>}}
{{</tabs>}}

You can run the code via `rebar3 shell` followed by `repl:run().` or `iex -S mix` followed by `Repl.run()`.

## Enable Tracing

<a name="include-opencensus-application"></a>
### Include OpenCensus Application

Skip this section if you are using Elixir. In a mix project the dependencies are used as runtime dependencies unless specified to not be.

To enable tracing, we'll include `opencensus` application in our project's `.app.src` file so it is started as a dependency of our application. Your `src/repl.app.src` will looks like:

{{<tabs Erlang>}}
{{<highlight erlang>}}
{application, repl,
 [{description, "OpenCensus REPL example"},
  {vsn, "0.1.0"},
  {registered, []},
  {applications,
   [kernel,
    stdlib,
    opencensus
   ]},
  {env,[]},
  {modules, []},
]}.
{{</highlight>}}
{{</tabs>}}

To start the applications when running the rebar3 shell for development you'll add the following to `rebar.config`:

{{<tabs Erlang>}}
{{<highlight erlang>}}
{shell, [{apps, [repl]},
         {config, "config/sys.config"}]}.
{{</highlight>}}
{{</tabs>}}


<a name="instrument-tracing"></a>
### Instrumentation

We will be tracing the execution as it starts in `read_eval_process/0`, goes to `read_line/0`, and finally travels through `process_line/1`.

To accomplish this, we must create a span in each of the functions.

You can create a span with the `ocp` module's function `with_child_span/1` and finish with `finish_span/0`, with `opencensus_elixir` a macro `with_child_span` is provided as well:

{{<tabs Erlang Elixir>}}
{{<highlight erlang>}}
ocp:with_child_span(SpanName),
...
ocp:finish_span().
{{</highlight>}}

{{<highlight elixir>}}
with_child_span do
  ...
end
{{</highlight>}}
{{</tabs>}}


When creating a new span with this way OpenCensus first checks if a parent Span already exists in the process dictionary. If it exists, a child span is created. Otherwise, a newly created span is inserted in to the process dictionary to become the parent Span.

## Exporting traces

<a name="exporting-to-zipkin"></a>
### Import packages
To enable exporting of traces to Zipkin, we'll need to set it as the reporter in `sys.config`:

{{<tabs Erlang Elixir>}}
{{<highlight erlang>}}
[{opencensus, [{sampler, {oc_sampler_always, []}},
               {reporters, [{oc_reporter_zipkin, []}]}]}
].
{{</highlight>}}

{{<highlight elixir>}}
use Mix.Config

config :opencensus,
  sampler: {:oc_sampler_always, []},
  reporters: [{:oc_reporter_zipkin, []}]
{{</highlight>}}
{{</tabs>}}

<a name="create-annotations"></a>
### Create Annotations

When looking at our traces on a backend (such as Stackdriver), we can add metadata to our traces to increase our post-mortem insight.

We'll record the length of each requested string so that it is available to view when examining our traces. To accomplish this, we'll `annotate` the function `read_eval_process/0`.

{{<tabs Erlang Elixir>}}
{{<highlight erlang>}}
read_eval_process() ->
    ocp:with_child_span("repl"),

    Line = read_line(),

    Annotation = oc_span:annotation( <<"Invoking process_line/1">>,
                                     #{<<"len">> => length(Line),
                                       <<"use">> => <<"repl">>}),
    ocp:add_time_event(Annotation),

    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),

    ocp:finish_span(),

    read_eval_process().
{{</highlight>}}

{{<highlight elixir>}}
  import Opencensus.Trace

  defp read_eval_process() do
    with_child_span "repl" do
      line = read_line()

      annotation =
        :oc_span.annotation("Invoking process_line/1", %{
          "len" => String.length(line),
          "use" => "repl"
        })
        
      :ocp.add_time_event(annotation)

      out = process_line(line)
      IO.puts("< " <> out)
      read_eval_process()
    end
  end
{{</highlight>}}
{{</tabs>}}

## End to end code
Collectively our code will look this:

{{<tabs Erlang Elixir>}}
{{<highlight erlang>}}
-module(repl).

-export([run/0]).

run() ->
    read_eval_process().

read_eval_process() ->
    ocp:with_child_span("repl"),

    Line = read_line(),

    Annotation = oc_span:annotation( <<"Invoking process_line/1">>,
                                     #{<<"len">> => length(Line),
                                       <<"use">> => <<"repl">>}),
    ocp:add_time_event(Annotation),

    Out = process_line(Line),
    io:format("< ~s~n~n", [Out]),

    ocp:finish_span(),

    read_eval_process().

read_line() ->
    ocp:with_child_span("read_line"),
    try io:get_line("> ")
    after
        ocp:finish_span()
    end.

process_line(Line) ->
    ocp:with_child_span("process_line"),
    try string:uppercase(Line)
    after
        ocp:finish_span()
    end.
{{</highlight>}}

{{<highlight elixir>}}
defmodule Repl do
  import Opencensus.Trace

  def run() do
    read_eval_process()
  end

  defp read_eval_process() do
    with_child_span "repl" do
      line = read_line()

      annotation =
        :oc_span.annotation("Invoking process_line/1", %{
          "len" => String.length(line),
          "use" => "repl"
        })
      
      :ocp.add_time_event(annotation)

      out = process_line(line)
      IO.puts("< " <> out)
      read_eval_process()
    end
  end

  defp read_line() do
    with_child_span "read_line" do
      IO.gets("> ")
    end
  end

  defp process_line(line) do
    with_child_span "process_line" do
      String.upcase(line)
    end
  end
end
{{</highlight>}}
{{</tabs>}}

### Running the code

Having already successfully started Zipkin as in [Zipkin Codelab](/codelabs/zipkin), we can now run our code by

{{<tabs Erlang Elixir>}}
{{<highlight erlang>}}
rebar3 shell --sname repl@localhost

(repl@localhost)1> repl:run().
{{</highlight>}}

{{<highlight elixir>}}
iex --sname repl@localhost -S mix

iex(repl@localhost)1> Repl.run()
{{</highlight>}}
{{</tabs>}}


## Viewing your traces
With the above you should now be able to navigate to the Zipkin UI at http://localhost:9411 which will produce such a screenshot:

![](/images/trace-erlang-zipkin-all-traces.png)

And on clicking on one of the traces, we should be able to see the annotation whose description `Invoking process_line/1`

![](/images/trace-erlang-zipkin-single-trace.png)

whose annotation looks like

![](/images/trace-erlang-zipkin-annotation.png)

And on clicking on `More info` we should see

![](/images/trace-erlang-zipkin-all-details.png)

## References

Resource|URL
---|---
Zipkin project|https://zipkin.io/
Erlang/Elixir exporters|[Erlang/Elixir exporters](/guides/exporters/supported-exporters)
OpenCensus Erlang package|https://hexdocs.pm/opencensus/
OpenCensus Elixir package|https://hexdocs.pm/opencensus_elixir/
Setting up Zipkin|[Zipkin Codelab](/codelabs/zipkin)
