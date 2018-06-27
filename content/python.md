+++
Description = "python"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
type = "leftnav"
title = "Python"
date = "2018-05-18T13:08:20-05:00"
+++

The example demonstrates how to record traces for a simple Flask web application.  

---

#### API Documentation

The OpenCensus libraries artifacts are released to [PyPI](https://pypi.python.org/pypi/opencensus). The API documentation is available [here](https://census-instrumentation.github.io/opencensus-python/trace/api/index.html).  

---

#### The Quickstart Example Code

1. Clone the OpenCensus Python GitHub repo:
```
git clone https://github.com/census-instrumentation/opencensus-python.git
```  

2. Code is in directory:  
```
examples/trace/helloworld/flask
```  

---

#### To Run The Example

1. Install dependencies via pip:  
``` python
$ pip install opencensus
```

2. The OpenCensus Python Quickstart example can be run as below:
``` python
$ python simple.py
```  

3. Make a HTTP request to hit the application:
``` python
$ curl http://localhost:8080/
```  

---

#### The Example Code
``` python
import flask
from opencensus.trace.exporters import stackdriver_exporter
from opencensus.trace.ext.flask.flask_middleware import FlaskMiddleware


app = flask.Flask(__name__)

# Enable tracing the requests
middleware = FlaskMiddleware(app)


@app.route('/')
def hello():
   return 'Hello world!'
   
   
if __name__ == '__main__':
   app.run(host='localhost', port=8080)
```  

---

#### The Example Output (Raw)
```
[
  SpanData(
    name='[GET]http://localhost:8080/',
    context=,
    span_id='0eadaaabacea4ca7',
    parent_span_id=None,
    attributes={
      '/http/method': 'GET',
      '/http/url': 'http://localhost:8080/',
      '/http/status_code': '200
    },
    start_time='2018-04-09T23:04:41.784921Z',
    end_time='2018-04-09T23:04:41.785165Z',
    child_span_count=0,
    stack_trace=None,
    time_events=[],
   links=[],
   status=None,
   same_process_as_parent_span=None,
   span_kind=0
  )
]
```
