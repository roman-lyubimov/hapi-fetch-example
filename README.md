# Hapi queue processing

### How to
The first you need is to clone this repository and run
`npm install`.

This application exposes two endpoints.
The first endpoint is `/download?uri=http://example.com/some/path/file.xml`
This endpoints allows you to initiate downloading and processing the xml file from the remote server.
The second endpint is `/resources/{id}` allows you to get representation of created resources.

Resource status can be:
* downloading - Set immediately after resource creation
* processing - Set when processing (parsing) is in progress
* ready - Set when processing is complete

Downloading start immediately after resource creation but not blocks the NodeJS process.

### Example
```
curl -v -X POST http://localhost:3000/download?uri=http://namopi.stg5.cmstuning.net/sites/namopi/files/products.xml
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 3000 (#0)
> POST /download?uri=http://namopi.stg5.cmstuning.net/sites/namopi/files/products.xml HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.54.0
> Accept: */*
> 
< HTTP/1.1 201 Created
< location: /resources/1
< cache-control: no-cache
< content-length: 0
< Date: Wed, 25 Jul 2018 10:02:50 GMT
< Connection: keep-alive
< 
* Connection #0 to host localhost left intact
```

As you can see, the POST request returns the location of created resource, to access it you must send a GET request to that endpoint

```
curl -v http://localhost:3000/resources/1
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to localhost (127.0.0.1) port 3000 (#0)
> GET /resources/1 HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.54.0
> Accept: */*
> 
< HTTP/1.1 200 OK
< content-type: application/json; charset=utf-8
< cache-control: no-cache
< content-length: 95135
< vary: accept-encoding
< accept-ranges: bytes
< Date: Wed, 25 Jul 2018 10:11:58 GMT
< Connection: keep-alive
< 
{"id":1,"status":"ready","fileName":"/Users/roman/Documents/Projects/hapi-fetch-example/var/products.xml","data":{...}}

```