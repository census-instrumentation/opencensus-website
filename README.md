> **Warning**
>
> OpenCensus and OpenTracing have merged to form [OpenTelemetry](https://opentelemetry.io), which serves as the next major version of OpenCensus and OpenTracing.
>
> OpenTelemetry has now reached feature parity with OpenCensus, with tracing and metrics SDKs available in .NET, Golang, Java, NodeJS, and Python. **All OpenCensus Github repositories, except [census-instrumentation/opencensus-python](https://github.com/census-instrumentation/opencensus-python), will be archived on July 31st, 2023**. We encourage users to migrate to OpenTelemetry by this date.
>
> To help you gradually migrate your instrumentation to OpenTelemetry, bridges are available in Java, Go, Python, and JS. [**Read the full blog post to learn more**](https://opentelemetry.io/blog/2023/sunsetting-opencensus/).

# opencensus.io

This repo contains all about the source for the [opencensus.io][website] website.


## Contributing

Contributions are highly appreciated! Please follow the steps below to contribute:
Important to Note: This site is currently built on Hugo v0.31.1 found [Here][version-control].
Use v0.31.1 to run your edits locally.

1. Install [Hugo][install-hugo].
2. Check out the website source:
```
$ git clone git@github.com:census-instrumentation/opencensus-website.git
$ cd opencensus-website
```
3. Make a necessary change and run the website locally to see if it all looks good.

```
$ hugo

$ hugo serve

Started building sites ...

Built site for language en:
...
...
total in ms

Watching for changes in /Users/you/Desktop/opencensus-website/{content,layouts,static,themes}

Serving pages are from memory

Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender

Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)

Press Ctrl+C to stop
```
4. Go to http://localhost:1313/ to display the rendered website locally.
5. If it all looks good, create a pull request with the changes.
6. Once your PR is approved and merged, the website will be automatically regenerated and published.


[website]: http://opencensus.io
[install-hugo]: https://gohugo.io/getting-started/installing/
[version-control]: https://github.com/gohugoio/hugo/releases/tag/v0.31.1
