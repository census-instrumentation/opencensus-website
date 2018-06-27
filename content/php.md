+++
Description = "php"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
type = "leftnav"
title = "PHP"
date = "2018-05-18T12:37:28-05:00"
+++

The example demonstrates how to record traces for a simple website that calculate Fibonacci numbers recursively.  

---

#### API Documentation
The OpenCensus libraries artifacts are released to Packagist ([packagist.org](https://packagist.org/)) [opencensus/opencensus](https://packagist.org/packages/opencensus/opencensus). The API documentation is available [here](https://census-instrumentation.github.io/opencensus-php/api/).  

---
#### Example
1. Clone the OpenCensus PHP github repository:  

``` php
git clone https://github.com/census-instrumentation/opencensus-php.git  
```  

2.Code is in directory: 
``` php
examples/silex/
```  

---

#### To Build/Run The Example
1. Install dependencies via composer:  

``` php
$ composer install
```  

2. The OpenCensus PHP Quickstart example can be run using the build-in PHP webserver:  

``` php
$ php -S localhost:8000 -t web
```  

3. Make a HTTP request to hit the application:  
``` php
$ curl http://localhost:8000/fib/3
```  

---

#### The Example Code

``` php
<?php

require_once __DIR__ . '/../vendor/autoload.php';

// Configure and start the OpenCensus Tracer
use OpenCensus\Trace\Tracer;
$exporter = new OpenCensus\Trace\Exporter\EchoExporter();
Tracer::start($exporter);

function fib($n)
{
  return Tracer::inSpan([
    'name' => 'fib',
    'attributes' => [
      'n' => $n
    ]
  ], function () use ($n) {
    if ($n < 3) {
      return $n;
    }
    return fib($n - 1) + fib($n - 2);
  });
}

$app = new Silex\Application();

$app->get('/', function () {
  return 'Hello World!';
});

$app->get('/fib/{n}', function ($n) use ($app) {
  $n = (int) $n;
  $fib = fib($n);
  return sprintf('The %dth Fibonacci number is %d', $n, $fib);
});

$app->run();
```  

---

#### The Example Output (Raw)
```
The 3th Fibonacci number is 3.Array
(
  [0] => OpenCensus\Trace\Span Object
    (
      [traceId:OpenCensus\Trace\Span:private] =>
      [spanId:OpenCensus\Trace\Span:private] => 526d3545
      [parentSpanId:OpenCensus\Trace\Span:private] =>
      [name:OpenCensus\Trace\Span:private] => /fib/3
      [startTime:OpenCensus\Trace\Span:private] =>
       DateTime Object
       (
        [date] => 2018-03-22 19:47:00.739414
        [timezone_type] => 3
        [timezone] => UTC
       )

      [endTime:OpenCensus\Trace\Span:private] =>
       DateTime Object
       (
        [date] => 2018-03-22 19:47:00.794824
        [timezone_type] => 3
        [timezone] => UTC
       )

      [stackTrace:OpenCensus\Trace\Span:private] => Array
       (
       )

      [timeEvents:OpenCensus\Trace\Span:private] => Array
       (
       )

      [links:OpenCensus\Trace\Span:private] => Array
       (
       )

      [status:OpenCensus\Trace\Span:private] =>
       OpenCensus\Trace\Status Object
       (
        [code:OpenCensus\Trace\Status:private] => 200
        [message:OpenCensus\Trace\Status:private] =>
         HTTP status code: 200
       )

      [sameProcessAsParentSpan:OpenCensus\Trace\Span:private]
       =>
      [attributes:OpenCensus\Trace\Span:private] => Array
       (
       )

    )

  [1] => OpenCensus\Trace\Span Object
    (
      [traceId:OpenCensus\Trace\Span:private] =>
      [spanId:OpenCensus\Trace\Span:private] => 60c9a7b2
      [parentSpanId:OpenCensus\Trace\Span:private] => 526d3545
      [name:OpenCensus\Trace\Span:private] => fib
      [startTime:OpenCensus\Trace\Span:private] => DateTime Object
       (
        [date] => 2018-03-22 19:47:00.788716
        [timezone_type] => 3
        [timezone] => UTC
       )

      [endTime:OpenCensus\Trace\Span:private] => DateTime Object
       (
        [date] => 2018-03-22 19:47:00.789070
        [timezone_type] => 3
        [timezone] => UTC
       )

      [stackTrace:OpenCensus\Trace\Span:private] => Array
       (
        [0] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/web/index.php
          [line] => 33
          [function] => fib
         )

        [1] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/symfony/http-
            kernel/HttpKernel.php
          [line] => 151
          [function] => {closure}
         )

        [2] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/symfony/http-
            kernel/HttpKernel.php
          [line] => 68
          [function] => handleRaw
          [class] => Symfony\Component\HttpKernel\HttpKernel
          [type] => ->
         )

        [3] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/silex/silex/src/
            Silex/Application.php
          [line] => 496
          [function] => handle
          [class] => Symfony\Component\HttpKernel\HttpKernel
          [type] => ->
         )

        [4] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/silex/silex/src/
            Silex/Application.php
          [line] => 477
          [function] => handle
          [class] => Silex\Application
          [type] => ->
         )

        [5] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/web/index.php
          [line] => 37
          [function] => run
          [class] => Silex\Application
          [type] => ->
         )

       )

      [timeEvents:OpenCensus\Trace\Span:private] => Array
       (
       )

      [links:OpenCensus\Trace\Span:private] => Array
       (
       )

      [status:OpenCensus\Trace\Span:private] =>
      [sameProcessAsParentSpan:OpenCensus\Trace\Span:private]
       =>
      [attributes:OpenCensus\Trace\Span:private] => Array
       (
        [n] => 3
       )

    )

  [2] => OpenCensus\Trace\Span Object
    (
      [traceId:OpenCensus\Trace\Span:private] =>
      [spanId:OpenCensus\Trace\Span:private] => 2c9be766
      [parentSpanId:OpenCensus\Trace\Span:private] => 60c9a7b2
      [name:OpenCensus\Trace\Span:private] => fib
      [startTime:OpenCensus\Trace\Span:private] => 
       DateTime Object
       (
        [date] => 2018-03-22 19:47:00.788845
        [timezone_type] => 3
        [timezone] => UTC
       )

      [endTime:OpenCensus\Trace\Span:private] =>
       DateTime Object
       (
        [date] => 2018-03-22 19:47:00.788921
        [timezone_type] => 3
        [timezone] => UTC
       )

       [stackTrace:OpenCensus\Trace\Span:private] => Array
       (
        [0] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/web/index.php
          [line] => 21
          [function] => fib
         )

        [1] => Array
         (
          [function] => {closure}
         )

        [2] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/opencensus/
            opencensus/src/Trace/Tracer/ContextTracer.php
          [line] => 66
          [function] => call_user_func_array
         )

        [3] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/web/index.php
          [line] => 33
          [function] => fib
         )

        [4] => Array
                  (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/symfony/http-
            kernel/HttpKernel.php
          [line] => 151
          [function] => {closure}
         )

        [5] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/symfony/http-
            kernel/HttpKernel.php
          [line] => 68
          [function] => handleRaw
          [class] => Symfony\Component\HttpKernel\HttpKernel
          [type] => ->
         )

        [6] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/silex/silex/src/
            Silex/Application.php
          [line] => 496
          [function] => handle
          [class] => Symfony\Component\HttpKernel\HttpKernel
          [type] => ->
         )

        [7] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/silex/silex/src/
            Silex/Application.php
          [line] => 477
          [function] => handle
          [class] => Silex\Application
          [type] => ->
         )

        [8] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/web/index.php
          [line] => 37
          [function] => run
          [class] => Silex\Application
          [type] => ->
         )

       )

      [timeEvents:OpenCensus\Trace\Span:private] => Array
       (
       )

      [links:OpenCensus\Trace\Span:private] => Array
       (
       )

      [status:OpenCensus\Trace\Span:private] =>
      [sameProcessAsParentSpan:OpenCensus\Trace\Span:private] =>
      [attributes:OpenCensus\Trace\Span:private] => Array
       (
        [n] => 2
       )

    )

  [3] => OpenCensus\Trace\Span Object
    (
      [traceId:OpenCensus\Trace\Span:private] =>
      [spanId:OpenCensus\Trace\Span:private] => 4241b61
      [parentSpanId:OpenCensus\Trace\Span:private] => 60c9a7b2
      [name:OpenCensus\Trace\Span:private] => fib
      [startTime:OpenCensus\Trace\Span:private] => DateTime 
       Object
       (
        [date] => 2018-03-22 19:47:00.788978
        [timezone_type] => 3
        [timezone] => UTC
       )

      [endTime:OpenCensus\Trace\Span:private] => DateTime 
       Object
       (
        [date] => 2018-03-22 19:47:00.789041
        [timezone_type] => 3
        [timezone] => UTC
       )

      [stackTrace:OpenCensus\Trace\Span:private] => Array
       (
        [0] => Array
         (
          [file] => /Users/chingor/php/opencensus-
           php/examples/silex/web/index.php
          [line] => 21
          [function] => fib
         )

        [1] => Array
         (
          [function] => {closure}
         )

        [2] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/opencensus/
            opencensus/src/Trace/Tracer/ContextTracer.php
          [line] => 66
          [function] => call_user_func_array
         )

        [3] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/web/index.php
          [line] => 33
          [function] => fib
         )

        [4] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/symfony/http-
            kernel/HttpKernel.php
          [line] => 151
          [function] => {closure}
         )

        [5] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/symfony/http-
            kernel/HttpKernel.php
          [line] => 68
          [function] => handleRaw
          [class] => Symfony\Component\HttpKernel\HttpKernel
          [type] => ->
         )

        [6] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/silex/silex/src/
            Silex/Application.php
          [line] => 496
          [function] => handle
          [class] => Symfony\Component\HttpKernel\HttpKernel
          [type] => ->
         )

        [7] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/vendor/silex/silex/src/
            Silex/Application.php
          [line] => 477
          [function] => handle
          [class] => Silex\Application
          [type] => ->
         )

        [8] => Array
         (
          [file] => /Users/chingor/php/opencensus-
            php/examples/silex/web/index.php
          [line] => 37
          [function] => run
          [class] => Silex\Application
          [type] => ->
         )

       )

      [timeEvents:OpenCensus\Trace\Span:private] => Array
       (
       )

      [links:OpenCensus\Trace\Span:private] => Array
       (
       )

      [status:OpenCensus\Trace\Span:private] =>
      [sameProcessAsParentSpan:OpenCensus\Trace\Span:private] 
      =>
      [attributes:OpenCensus\Trace\Span:private] => Array
       (
        [n] => 1
       )

    )

)
```
