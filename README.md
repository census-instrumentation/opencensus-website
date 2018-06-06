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
$ hugo

$ firebase serve

=== Serving from '/Users/me/opencensus-website'...

i  hosting: Serving hosting files from: public/

✔  hosting: Local server: http://localhost:5000

Press Ctrl+C to stop
```
4. Go to http://localhost:5000 to display the rendered website locally.
5. If it all looks good, create a pull request with the changes.
6. Once your PR is approved and merged, the website will be automatically regenerated and published.


[website]: http://opencensus.io
[install-hugo]: https://gohugo.io/getting-started/installing/
