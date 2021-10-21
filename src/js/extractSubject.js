#!/usr/bin/env node
const readline = require("readline");
const StringDecoder = require("string_decoder").StringDecoder
const fs = require('fs');
console.log(process.argv);
//const source = fs.readFileSync(process.argv[2], {encoding:'utf8', flag:'r'});

var lines = require('fs').readFileSync(process.argv[2], 'utf-8')
    .split('\n')
    .filter(Boolean);


const Handlebars = require("handlebars");
// Handlebars.registerHelper('escape', function(variable) {
//   return variable.replace(/([/\/])/g, '\\$1');
// });
var source1 = "req.url.match(/{{{path}}}[/][0-9.]+/)!==null  && req.method == '{{method}}'";
var source2 = "req.url =='{{path}}' && req.method == '{{method}}'";

var template1 = Handlebars.compile(source1);
var template2 = Handlebars.compile(source2);


var ignoreIds = new Set();
var ignoreAddresses = "/api";
const decoder = new StringDecoder("utf8");
var Subject=[];

function convertHexString(hex) {
  var bytes = [];
  for (var i = 0; i < hex.length - 1; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return decoder.write(Buffer.from(bytes));
}

var Subject={"services":[],
  "EDGE_URL_PORT": "http://",
  "CLOUD_URL_PORT": "http://127.0.0.1:5005",
    "dep_stmts":[],
    "snapshot":"./snapshot.json"
};

var service = {};

const service_dummy = {
      "path": undefined,
       "ftn": "s1",
      "method": undefined,
      "server_return":undefined,
      "rule":undefined
    };
service = service_dummy;

var current_id=0;
var before_id=0;
var current_type="";
var data="";
var cnt =0;
var service_id=1;

function log(output) {
	//console.log(output);
	var msg = output.match(/([1|2]) ([0-9|a-z]+) [0-9]+ [0-9]+/);
	if(msg!==null){
	//	console.error("@@@@",output,msg[1], msg[2]);
		current_type = msg[1];
		current_id = msg[2];

	}
	if(current_id!=before_id && before_id!=0){
		//console.log("changed");
	}
	if(current_type==1){
		var match_method =output.match(/(GET|PUT|POST|DELETE) (.*) HTTP\/1.1/);
		if(match_method!==null){
        service.method=match_method[1].toLowerCase();
        var param = parseInt(match_method[2].split("/").pop());
		console.error(match_method[2].split("/"), "match_method",match_method[1],",",match_method[2], match_method[2].split("/").pop(),param);
		   if(isNaN(param)){
			    service.path=match_method[2];
			    var data = { "path":service.path,
                             "method": service.method};

                var result = template2(data);
                service.rule =result;
                console.log(service.rule);
		   }else{
                var arr = match_method[2].split("/");
                var aa1=arr.splice(0,arr.length-1).join('/');
                arr = match_method[2].split("/");
                var aa=arr.splice(0,arr.length-1).join('[/]');
                service.path=aa1+":id";

                var data = { "path":aa,
                             "method": service.method};

                var result = template1(data);
                service.rule =result;
                service.client_params = param;
                console.log(service.rule);
		   }



		}
	}
	var match_body =output.match(/\{.*\}|\[.*\]/);
	if(current_type==2 && match_body!=null){
         service.server_return = JSON.parse(match_body.input);
	}
	before_id = current_id;
	//console.error("===================",current_type, current_id,output);
    if(output=="🐵🙈🙉") cnt++;
	if(output=="🐵🙈🙉" && cnt>0 && cnt%2==0) {
		console.log("\n===Extracted Subject===\n");
		  Subject.services.push(service);

		  service_id++;
		  service = {
              "path": undefined,
              "ftn": "s"+service_id,
              "method": undefined,
              "server_return":undefined,
              "ftn_stmts":undefined,
              "netsted_ftn_stmts":undefined,
              "rule":undefined
		  };
	}

	var match_host =output.match(/Host: (.*)/);
	if(match_host!==null){
		console.error("match_host",match_host[1]);
		if(Subject.EDGE_URL_PORT=="http://")
		Subject.EDGE_URL_PORT = Subject.EDGE_URL_PORT+match_host[1];
}
}

function shouldOutputLine(request) {
  const components = request.split("\n");
  const header = components[0].split(" ");
  const type = parseInt(header[0]);
  const tag = header[1];

  if (type === 3) {
    return true;
  }
  if (type === 1) {
    // Check if it's oauth
    const endpoint = components[1].split(" ")[1];
    if (!endpoint.startsWith(ignoreAddresses)) {
      ignoreIds.add(tag);
      return false;
    }
  } else if (type === 2) {
    if (ignoreIds.has(tag)) {
      ignoreIds.delete(tag);
      return false;
    }
  }
  return true;
}

/**
 * const fileStream = fs.createReadStream('./ttta_0.gor');
 *const rl = readline.createInterface({
  input: fileStream
});
rl.on("line", (input) => {
  const str = convertHexString(input);
  //console.log("strrr", input);
  if (shouldOutputLine(str)) {
    log(input);
   // if(input=="\n") console.log("newline!!")
  }
}).on('close', (input) => {
 // EOF
  console.log(Subject);
  let data = JSON.stringify(Subject);
  fs.writeFileSync('Subject.json', data);
});
**/




for (var l in lines){
    // console.log();
    const str = convertHexString(lines[l]);
     if (shouldOutputLine(str)) {
        log(lines[l]);
     }

     if(l==lines.length-1){
          // EOF
        console.log(Subject);
          let data = JSON.stringify(Subject, null, 1);
          fs.writeFileSync('Subject.json', data);
     }
}

