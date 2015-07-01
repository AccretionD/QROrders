/*******************************************************************************
 * Copyright (c) 2013-2014 Matteo Collina
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v1.0 which accompany this distribution.
 *
 * The Eclipse Public License is available at 
 *    http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at 
 *   http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *    Matteo Collina - initial API and implementation and/or initial documentation
 *******************************************************************************/

var http = require("http");
var resourcesRegexp = /^\/resources\/(.+)$/;
var callback = require("callback-stream");
var bunyan = require("bunyan");

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();


function HTTP(opts, done) {
  if (!(this instanceof HTTP)) {
    return new HTTP(opts, done);
  }

  if (typeof opts === "function") {
    cb = opts;
    opts = {};
  }

  var that = this;
  this._persistence = opts.ponte.persistence;
  this._ponte = opts.ponte;
  
  if (typeof opts.authenticate === "function") {
    this.authenticate = opts.authenticate;
  }
  
  if (typeof opts.authorizeGet === "function") {
    this.authorizeGet = opts.authorizeGet;
  }
  
  if (typeof opts.authorizePut === "function") {
    this.authorizePut = opts.authorizePut;
  }
  
  var logger = this._logger = opts.ponte.logger.child({
    service: 'HTTP',
    serializers: {
      req: bunyan.stdSerializers.req,
      res: bunyan.stdSerializers.res
    }
  });

  this.server=app;
  this.server.set('port', (process.env.PORT || 3030));


  logger.debug(path.join(__dirname,'chef'));
this.server.use('/', express.static(path.join(__dirname, 'chef')));
this.server.use(bodyParser.json());
this.server.use(bodyParser.urlencoded({extended: true}));

this.server.get('/comments.json', function(req, res) {
  fs.readFile('comments.json', function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});
   var logger = this._logger;
   var persistence = this._persistence;
   var ponte = this._ponte;

this.checkout = function(req, res, next) {
   logger.debug(req.body);
   //res.send('ok');
     var topic="order";
     
     var payload=JSON.stringify(req.body.c);
     logger.debug(req.body);

    // var pkg=payload;
     var packet = { topic: topic, payload: JSON.stringify(payload), retain: true };
        persistence.storeRetained(packet, function() {
          ponte.broker.publish("order", payload, {}, function() {
            res.setHeader('Location', '/resources/' + topic);
            res.statusCode = 204;
            res.end();
            ponte.emit('updated', topic, new Buffer(payload));
          });
        });


};

this.server.post("/chef", this.checkout);

this.server.post('/comments.json', function(req, res) {
  fs.readFile('comments.json', function(err, data) {
    var comments = JSON.parse(data);
    comments.push(req.body);
    fs.writeFile('comments.json', JSON.stringify(comments, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(comments));
    });
  });
});


this.server.listen(this.server.get('port'), function() {
     done(null, that);
     logger.debug('Server started: http://localhost:' + app.get('port') + '/');
});

}


module.exports = HTTP;
