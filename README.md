# opencensus.io

This repo contains the source for the [opencensus.io][website] website.


## Contributing

Contributions are highly appreciated! Please follow the steps below to contribute:

1. Install [Hugo][install-hugo].
2. Check out the website source:
```
$ git clone git@github.com:census-instrumentation/opencensus-website.git
$ cd opencensus-website
```
3. Make a change and run the website locally to see if it all looks good.

```
$ hugo serve
Watching for changes in /Users/jbd/census-instrumentation.github.io/{content,static,themes}
Serving pages from memory
Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)
Press Ctrl+C to stop
```
4. Go to http://localhost:1313/ to display the rendered website locally.
5. If it all looks good, create a pull request with the changes.
6. Once your PR is approved and merged, the website will be automatically regenerated and published.


[website]: http://opencensus.io
[install-hugo]: https://gohugo.io/getting-started/installing/
