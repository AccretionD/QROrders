var Apollo = require('apollo-cassandra');


function CassandraStore(opts, done) {
  if (!(this instanceof CassandraStore)) {
    return new CassandraStore(opts, done);
  }

  if (typeof opts === "function") {
    done = opts;
    opts = {};
  }
  var logger = this._logger= opts.ponte.logger.child({ service: 'cassandra' });
  this.options = opts;
  var that = this;
  this._client = this._buildClient();
  this._dtmPkg=this._buildSchema();
  done(null,that);


}


CassandraStore.prototype._buildClient = function() {
    var apollo = new Apollo({
	hosts: ["127.0.0.1"],
	keyspace:"dtmdb"},{
		//TODO: this should be opts later
	replication_strategy:{'class':'SimpleStrategy','replication_factor':1}
    });
  return apollo;
};

CassandraStore.prototype._buildSchema=function(){
  var client=this._client;
console.log('creating model');
  var dtmPkg = client.get_model("dtmpkg");
  if (!dtmPkg) {
	var dtmPackageSchema = {
	  fields: {
	  timestamp:            {"type":"int" },
          oemkey: 		{ "type":"int" },
          protocolversion:	{ "type":"text" },
          softwareversion:	{ "type":"text" },
          carmodel: 		{ "type":"text" },
          carid: 		{ "type":"text" },
          rate: 		{ "type":"float" },
          speed: 		{ "type":"float" },
          lat: 			{ "type":"float" },
          lon: 			{ "type":"float" },
          context: 		{ "type":"int" },
          varid:		{ "type":"int" },
          varvalue:		{ "type":"text" },
         state: 		{ "type":"int" }
	},
	key: ["carid","timestamp"],
       };
	dtmPackage = client.add_model("dtmpkg",dtmPackageSchema);
var logger=this._logger;
logger.debug('created');
	return dtmPackage;
   }
};



CassandraStore.prototype.createPkg = function(data) {
var logger=this._logger;
	try {var dtmPackageModel = new dtmPackage(data);}
	catch (err){ console.log(err.message) }
    		dtmPackageModel.save(function(err, dtmpackage) {
        	if (err) {
			logger.debug('err',err);
        	} else {
			logger.debug('correct insert');
        	}
    });
};

module.exports = CassandraStore;


