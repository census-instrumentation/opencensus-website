+++
Description = "ruby"
Tags = ["Development", "OpenCensus"]
Categories = ["Development", "OpenCensus"]
menu = "main"
type = "leftnav"
title = "Ruby"
date = "2018-05-18T13:52:18-05:00"
+++


This example application demonstrates how to use OpenCensus to record traces for a Sinatra-based web application. You can find the source code for the application at https://github.com/census-instrumentation/opencensus-ruby/tree/master/examples/hello-world.


#### API Documentation  
The OpenCensus Ruby API is documented at http://www.rubydoc.info/gems/opencensus.  

---

#### Prerequisites  
Ruby 2.2 or later is required. Make sure you have Bundler installed as well.  
```ruby
gem install bundler
```  

---

#### Installation  
Get the example from the OpenCensus Ruby repository on Github, and cd into the example application directory.

```
git clone https://github.com/census-instrumentation/opencensus-ruby.git
cd opencensus-ruby/examples/hello-world
```   

Install the dependencies using Bundler.  

```
bundle install
```  

#### Running the example
Run the application locally on your workstation with:  

```ruby
bundle exec ruby hello.rb
```  

This will run on port 4567 by default, and display application logs on the terminal. From a separate shell, you can send requests using a tool such as curl:  

```ruby
curl http://localhost:4567/
curl http://localhost:4567/lengthy
```  
The running application will log the captured traces.  
&nbsp;  
#### The example application code
The example application’s Gemfile includes the **opencensus** gem:  

```ruby
source "https://rubygems.org"
gem "faraday", "~> 0.14"
gem "opencensus", "~> 0.3"
gem "sinatra", "~> 2.0"
```  

Following is the **hello.rb** source file from the example:  
```ruby
require "sinatra"

# Install the Rack middleware to trace incoming requests.
require "opencensus/trace/integrations/rack_middleware"
use OpenCensus::Trace::Integrations::RackMiddleware

# Access the Faraday middleware which will be used to trace outgoing
# HTTP requests.
require "opencensus/trace/integrations/faraday_middleware"

# Each request will be traced automatically by the middleware.
get "/" do
  "Hello world!"
end

# Traces for this request will also include sub-spans as indicated
# below.
get "/lengthy" do
  # Configure this Faraday connection with a middleware to trace
  # outgoing requests.
  conn = Faraday.new(url: "http://www.google.com") do |c|
    c.use OpenCensus::Trace::Integrations::FaradayMiddleware
    c.adapter Faraday.default_adapter
  end
  conn.get "/"

  # You may instrument your code to create custom spans for
  # long-running operations.
  OpenCensus::Trace.in_span "long task" do
    sleep rand
  end

  "Done!"
end
```  
