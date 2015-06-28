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
 *    Matteo Collina - Extracted from ponte.js file.
 *******************************************************************************/

var CoAP = require("./coap");
var HTTP = require("./http");

var persistence = require("./persistence");
var ascoltatori = require("ascoltatori");
var bunyan = require("bunyan");
var xtend = require("xtend");

module.exports = [{
  service: "logger",
  factory: function(opts, done) {
    delete opts.ponte;
    done(null, bunyan.createLogger({name:"dtm",
streams: [
    {
            level:'debug',
	      path:'/Users/meridianc4m1l0/Downloads/CollectorServer/log.log' 

    }]}));
  },
  defaults: {
    name: "ponte",
    level: 20
  }
}, {

  service: 'broker',
  defaults: 
  {
    type: "redis",
    wildcardOne: '+',
    wildcardSome: '#',
    separator: '/'
  },
  factory: function(opts, done) {
    opts.json = false;
    ascoltatori.build(opts, function(ascoltatore) {
      done(null, ascoltatore);
    });
  }
}, 
{
  service: "persistence",
  factory: persistence,
  defaults: {
    type: "redis",
  }
}
,{
  service: "coap",
  factory: CoAP,
  defaults: {
    port: 5683
  }
}    
, {
  service: "http",
  factory: HTTP,
  defaults: {
    port: 3000,
  }
}
	];
