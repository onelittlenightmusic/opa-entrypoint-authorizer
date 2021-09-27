var express = require('express');
var app = express();
var fs = require("fs");
const { restExpressOPAAuthorizer } = require('opa-entrypoint-authorizer')

const readJson = (fileName) => {
  let rawdata = fs.readFileSync(fileName);
  return JSON.parse(rawdata);
}

const dataUsers = [
  {name: "alice", age: 50},
  {name: "bob", age: 30},
  {name: "chris", age: 20},
]

const dataOffices = [
    {name: "santa clara", floor: 5},
]

//Definition of authorization
const permissions = readJson('permissions.json')

//Definition of entrypoint settings
const entrypointSetting = {
  type: "REST",
  restEntrypoints: [
    { "path": "/users", "method": "GET", require: {resource: "user", verb: "list"}},
    { "pathPattern": "/users/:user_name", "method": "GET", require: {resource: "user", verb: "getname", whoOwnsInArgs: "user_name"}},
    { "pathRegex": "^/+users/([^/]+)/age", "method": "GET", require: {resource: "user", verb: "getage", whoOwnsInArgs: "user_name"}},
    { "path": "/offices", "method": "GET", require: {resource: "office", verb: "list"}},
  ]
}

// Configure authorization middleware
const middleware = restExpressOPAAuthorizer('../../policy.wasm', {permissions, entrypointSetting})

//Definition of REST API for Express
app.get('/users', middleware, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(dataUsers.map((x)=>({name: x.name}))) );
})

app.get('/users/:user_name', middleware, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var user = dataUsers.find((x)=>(x.name==req.params.user_name));
  res.end( JSON.stringify({name: user.name}));
})

app.get('/users/:user_name/age', middleware, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  var user = dataUsers.find((x)=>(x.name==req.params.user_name));
  res.end( JSON.stringify({age: user.age}));
})

app.get('/offices', middleware, function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end( JSON.stringify(dataOffices) );
})

// Run Express service with authorization middleware
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
})

module.exports = app;