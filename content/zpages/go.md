---
title: "Go"
weight: 1
aliases: [/core-concepts/zpages/go]
---

- [Package to import](#package-to-import)
- [Source code sample](#source-code-sample)
- [Rpcz](#rpcz)
- [Tracez](#tracez)
- [References](#references)

### Package to import

zPages in Go can be enabled by importing package:
```go
    "go.opencensus.io/zpages"
```

and then passing an [http.ServerMux](https://golang.org/net/http#ServerMux) to [zpages.Handle](https://godoc.org/go.opencensus.io/zpages#Handle)
and then finally servicing HTTP traffic using the mux.

### Source code sample
You can enable zPages in your application by following the pattern below:
```go
package main

import (
	"log"
	"net/http"

	"go.opencensus.io/zpages"
)

func main() {
	mux := http.NewServeMux()
	zpages.Handle(mux, "/debug")

	// Change the address as needed
	addr := ":8888"
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Failed to serve zPages")
	}
}
```

### Rpcz
On visiting http://localhost:8888/debug/rpcz

![](/images/zpages-rpcz-go.png)

### Tracez
On visiting http://localhost:8888/debug/tracez
![](/images/zpages-tracez-go.png)

* With errors shown
![](/images/zpages-tracez-go-errors.png)

### References

Resource|URL
---|---
zPages Godoc|https://godoc.org/go.opencensus.io/zpages
