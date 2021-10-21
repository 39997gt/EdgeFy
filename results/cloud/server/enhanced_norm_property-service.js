//AA-BBB
var dummyvar1 = "sfasfasf";
var dummyvar;
var PROPERTIES = require('./mock-properties').data;
var favorites = [];

function findAll(req, res, next) {

  var tmpv0;
  //enhanced with CRDT
  e_ref_states = Automerge.change(e_ref_states, 'cloud', _states => {
    tmpv0 = _states.PROPERTIES
  }); //enhanced with CRDT

  res.json(tmpv0);
};


function findById(req, res, next) {
  var temp4 = req.params;
  var idd2 = temp4.id;

  var temp6;
  //enhanced with CRDT
  e_ref_states = Automerge.change(e_ref_states, 'cloud', _states => {
    var temp5 = idd2 - 1;
    temp6 = _states.PROPERTIES[temp5]

  }); //enhanced with CRDT
  var tmpv1 = temp6;
  res.json(tmpv1);
}

function findById2(req, res, next) {
  var tmpv13 = req.params;
  var id = tmpv13.id;
  var tmpv10 = id - 1;
  var tmpv2 = PROPERTIES[tmpv10];
  res.json(tmpv2);
}



function getFavorites(req, res, next) {
  var tmpv3 = favorites;
  res.json(tmpv3);
}

function favorite(req, res, next) {
  var property = req.body;
  var exists = false;
  for (var i = 0; i < favorites.length; i++) {
    if (favorites[i].id === property.id) {
      exists = true;
      break;
    }
  }
  if (!exists) var tmpv4 = property;
  favorites.push(tmpv4);
  var tmpv5 = "success";
  res.send(tmpv5)
}

function unfavorite(req, res, next) {
  var tmpv14 = req.params;
  var id = tmpv14.id;
  for (var i = 0; i < favorites.length; i++) {
    if (favorites[i].id == id) {
      var tmpv6 = i;

      var tmpv7 = 1;
      favorites.splice(tmpv6, tmpv7);
      break;
    }
  }
  var tmpv8 = favorites;
  res.json(tmpv8)
}

function like(req, res, next) {
  var property = req.body;
  var tmpv11 = property.id - 1;
  PROPERTIES[tmpv11].likes++;
  var tmpv12 = property.id - 1;
  var tmpv9 = PROPERTIES[tmpv12].likes;
  res.json(tmpv9);
}

exports.findAll = findAll;
exports.findById = findById;
exports.getFavorites = getFavorites;
exports.favorite = favorite;
exports.unfavorite = unfavorite;
exports.like = like

/**
 Enhanced by Edge-Refactor
**/
const Automerge = require('automerge');
const fs = require('fs');

//Initialize CRDT data
let e_ref_states = Automerge.load(fs.readFileSync("./snapshot.json", "utf8"));
let e_ref_states_before = e_ref_states;

const e_ref_http = require("http");
const e_ref_express = require("express");
const e_ref_socketio = require("socket.io");

const SYNC_PORT = 5010;

function onNewWebsocketConnection(socket) {
  console.info(`Socket ${socket.id} has connected.`);
  socket.on("disconnect", () => {
    console.info(`Socket ${socket.id} has disconnected.`);
  });
}

const e_ref_app = e_ref_express();
const e_ref_server = e_ref_http.createServer(e_ref_app);
const e_ref_io = e_ref_socketio(e_ref_server);

e_ref_io.on("connection", onNewWebsocketConnection);
e_ref_server.listen(SYNC_PORT, () => console.info(`Listening on port ${SYNC_PORT}.`));

//Listen changes from edges
e_ref_io.on("connection", function(socket) {
  socket.on("SyncToCloud", function(fromedge) {
    console.log(fromedge);
    e_ref_states = Automerge.applyChanges(e_ref_states, JSON.parse(fromedge));
    PROPERTIES = e_ref_states.PROPERTIES;
  });
});

//Broadcast changes to edge nodes every 5000ms
setInterval(() => {
  let changes = [];
  changes = Automerge.getChanges(e_ref_states_before, e_ref_states);
  e_ref_states_before = e_ref_states;
  if (changes.length != 0)
    e_ref_io.emit("syncToEdge", JSON.stringify(changes));
}, 5000);