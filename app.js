var express = require('express');
var knox = require('knox');
var url = require('url');
var http = require('http');

var client = knox.createClient({
    key: '<api-key-here>'
  , secret: '<secret-here>'
  , bucket: 'mybucket'
});

var app = express.createServer(express.logger());

app.get('/', function (req, res) {  
  var src = req.query.src;
  console.log('src: ' + src);

  var options = {
    host: url.parse(src).host,
    port: 80,
    path: url.parse(src).pathname
  };

  var filename = url.parse(src).pathname.split('/').pop();
  
  http.get(options, function(response) {
    var request = client.put(filename, {
      'Content-Length': response.headers['content-length'],
      'Content-Type': response.headers['content-type']
    });
  
    response.on('data', function(data) {
      request.write(data);
    }).on('end', function() {
      request.end();      
    });
    
    request.on('response', function(resp) {
      console.log('S3 status:', resp.statusCode, 'url:', request.url);
      res.send(request.url);
    });

    request.on('error', function(err) {
      console.error('Error uploading to s3:', err);
      res.send("Error uploading to s3");
    });
    
  });
    
});

var port = process.env.PORT || 3000;
console.log("Listening on " + port);
app.listen(port);