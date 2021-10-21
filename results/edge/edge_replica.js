/**
    Edge-Replica
**/

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');


const Automerge = require('automerge')
const fs = require('fs');
const io = require("socket.io-client");
const ioClient = io.connect("http://127.0.0.1:5010");

const app = express();
const CLOUD_URL_PORT = "http://127.0.0.1:5005";
app.set('port', process.env.PORT || 5000);
var proxy = require('express-http-proxy');
app.use(cors());
app.use(bodyParser.json());
app.use(compression());

//Rules for forwarding or Processing
app.all("*", proxy(CLOUD_URL_PORT, {
  filter: function(req, res) {
    return !(req.url.match(/[/]properties[/][0-9.]+/) !== null && req.method == 'get') &&
    !(req.url == '/properties' && req.method == 'get');

  }
}));

//Listening Cloud's synchronization msgs
ioClient.on("syncToEdge", (msg) => {
  e_ref_states = Automerge.applyChanges(e_ref_states, JSON.parse(msg));
});

var PROPERTIES = require('./dVXRLg').data;

//Initialize CRDTs
var e_ref_states = Automerge.load(fs.readFileSync("./snapshot.json", "utf8"));

/** @Extracted-function
    function s1(input){
	var idd2 = input;
	var temp5 = idd2-1;
	var temp6 = PROPERTIES[temp5];
	var output = temp6;
	return output;
}

**/
app.get('/properties:id', function(req, res, next) {
  try {
    var output;
    var new_states = Automerge.change(e_ref_states, 'edge', _states => {
      var input = req.params.id;
      var idd2 = input;
      var temp5 = idd2 - 1;
      var temp6 = _states.PROPERTIES[temp5];
      output = temp6;


    });

    let changes = Automerge.getChanges(e_ref_states, new_states);
    if (changes.length > 0) { //Updating Cloud's state
      ioClient.emit("SyncToCloud", JSON.stringify(changes));
      e_ref_states = new_states;
    }
    if (typeof output == 'undefined') throw "undefined error";
    res.json(output);
  } catch (err) {
    console.log(err);
    res.redirect(CLOUD_URL_PORT + '/properties:id');
  }

});

/** @Extracted-function
    function s2(){
	var tmpv0 = PROPERTIES;
	var output = tmpv0;
	return output;
}

**/
app.get('/properties', function(req, res, next) {
  try {
    var output;
    var new_states = Automerge.change(e_ref_states, 'edge', _states => {
      var tmpv0 = _states.PROPERTIES
      output = tmpv0;


    });

    let changes = Automerge.getChanges(e_ref_states, new_states);
    if (changes.length > 0) { //Updating Cloud's state
      ioClient.emit("SyncToCloud", JSON.stringify(changes));
      e_ref_states = new_states;
    }
    if (typeof output == 'undefined') throw "undefined error";
    res.json(output);
  } catch (err) {
    console.log(err);
    res.redirect(CLOUD_URL_PORT + '/properties');
  }

});

app.listen(app.get('port'), function() {
  console.log('Server listening on port ' + app.get('port'));
});