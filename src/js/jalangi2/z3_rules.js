/*
 * Copyright 2016 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Author: Koushik Sen

// do not remove the following comment
// JALANGI DO NOT INSTRUMENT

/**
 * @file Started from Jalangi 2 analysis to log all callbacks
 * @author  Kijin An
 *
 */

 var fs = require('fs');
 var esprima = require('esprima');
 var estraverse = require('estraverse');
 var escodegen = require('escodegen');
 var stringify = require('json-stringify-safe');

 var ast         = require('../src/js_wala/common/lib/ast.js'),
     sets        = require('../src/js_wala/common/lib/sets.js'),
     cfg         = require('../src/js_wala/cfg/lib/cfg'),
     dominators  = require('../src/js_wala/cfg/lib/dominators'),
normalizer       = require('../src/js_wala/normalizer/lib/normalizer');



 //parsing log.json, Deserialization
 var obj        = JSON.parse(fs.readFileSync('./log.json', 'utf8'));
 var log_output = obj.output.value;
 var log_input  = obj.input.value;
 console.log(log_output);
 console.log(log_input);


 //Construction of Control Flow Graph(CFG) by using AST
 function iterCFG(nd, f) {
  function rec(nd) {
    iterCFG(nd, f);
  }


  if(!nd)
    return;

  switch(nd.type) {
  case 'Program':
    f(nd);
    f(ast.getAttribute(nd, 'fakeRoot'));
    nd.body.forEach(rec);
    break;

  case 'FunctionExpression':
    f(nd);
    f(ast.getAttribute(nd, 'fakeRoot'));
    rec(nd.body);
    break;

  case 'EmptyStatement':
  case 'DebuggerStatement':
  case 'VariableDeclaration':
  case 'ReturnStatement':
  case 'BreakStatement':
  case 'ThrowStatement':
    f(nd);
    break;

  case 'ExpressionStatement':
    f(nd);
    switch(nd.expression.type) {
    case 'CallExpression':
      f(nd.expression.callee);
      break;
    case 'AssignmentExpression':
      if(nd.expression.right.type === 'FunctionExpression')
        rec(nd.expression.right);
      break;
    default:
      throw new Error("unexpected expression statement");
    }
    break;

  case 'IfStatement':
    f(nd);
    rec(nd.consequent);
    rec(nd.alternate);
    break;

  case 'WhileStatement':
  case 'ForInStatement':
    f(nd);
    rec(nd.body);
    break;

  case 'LabeledStatement':
    f(nd);
    rec(nd.body);
    break;

  case 'TryStatement':
    f(nd);
    rec(nd.block);
    if(nd.handlers && nd.handlers[0])
      rec(nd.handlers[0].body);
    if(nd.finalizer)
      rec(nd.finalizer);
    break;

  case 'BlockStatement':
    for(var i=0;i<nd.body.length;++i)
      rec(nd.body[i]);
    break;

  default:
    throw new Error("unexpected statement of type " + nd.type);
  }
}

 function dumpNode(nd) {
     if(!nd)
       return "<null>";
     var pos = ast.getPosition(nd);
    // console.log(escodegen.generate(nd, { comment: true }));
     var hashPos = ast.getAttribute(nd, 'hash');
     console.log(hashPos);
     return nd.type + " at " + pos.start_line + ":" + pos.start_offset+" ::"+nd.attr.pos;
 }

 function dumpCFG(root) {
  var res = "";
  iterCFG(root, function(nd) {
    var succs = ast.getAttribute(nd, 'succ');
        idom = ast.getAttribute(nd, 'idom'),
        ipdom = ast.getAttribute(nd, 'ipdom');

    if(sets.size(succs) === 0) {
      res += dumpNode(nd) + " --> []\n";
    } else {
      res += dumpNode(nd) + " --> [" + sets.map(succs, dumpNode).join(', ') + "]\n";
    }
    res += "    immediate dominator: " + (idom ? dumpNode(idom) : "none")  +"\n";
    res += "    immediate postdominator: " + (ipdom ? dumpNode(ipdom) : "none") + "\n";
  });
  return res;
}
var polycrc = require('polycrc');


function iidToSyntax(i, value){
  //var nnmae = "/Users/kijin/projects/insourcing_refactoring/remotecall_repos/before/before/ionic2-realty-rest/server/broker-service.js";
   //var nnmae = "/Users/kijin/projects/component-insourcing/apps/realty/ionic2-realty-rest/server/broker-service.js";
var nnmae = "apps/realty/ionic2-realty-rest/server/broker-service.js";
  //var ast = esprima.parse(prog, { loc: true, range: true });


  var id = J$.getGlobalIID(i);
  var location = J$.iidToLocation(id);
  var aaa = /\((.+):(.+):(.+):(.+):(.+)\)/g.exec(location);


  //if(aaa !=null && aaa.length == 6 && nnmae ==aaa[1])
  if(aaa !=null && aaa.length == 6)
  {
    var input_src = fs.readFileSync(aaa[1], 'utf-8');
    // var ast = esprima.parse(input_src,{ loc: true, range: true });
    var ast = esprima.parse(input_src, { loc: true, range: true });
    var filename = aaa[1];

    try{
          var sline=aaa[2], scol=aaa[3]-1, eline=aaa[4], ecol=aaa[5]-1;
          //console.log("LOCATION ",location, aaa[1],sline,"	",scol,"	",eline,"	",ecol,"   ");
           estraverse.traverse(ast, {
             enter: function(node) {
              if (node.type === 'EmptyStatement'){
                  // console.log(escodegen.generate(node), 'EmptyStatement');
              }else if(node.type === 'ExpressionStatement'){
                  // console.log(escodegen.generate(node), 'ExpressionStatement');
              }
              else if(node.type === 'ReturnStatement'){
                  // console.log(escodegen.generate(node), 'ReturnStatement');
              }
              else if (node.type === 'AssignmentExpression'){
                  // console.log(escodegen.generate(node), 'AssignmentExpression');
              }
              // else if (node.type === 'BlockStatement'){
                 // console.log(escodegen.generate(node), 'BlockStatement');
              // }
              else if (node.type === 'FunctionDeclaration'){
                 // console.log(escodegen.generate(node), 'FunctionDeclaration');
              }

               // if (node.type === 'ExpressionStatement'){
                 // console.log('Encountered ExpressionStatement to', escodegen.generate(node));
               // }
               // else if (node.type === 'AssignmentExpression'){
                 // console.log('Encountered assignment to', escodegen.generate(node));
               // }

                if (node.loc.start.line == sline && node.loc.end.line == eline &&
                       node.loc.start.column == scol && node.loc.end.column == ecol
                        && deepEqual(value,log_input))
                {
                  console.log("LOG INPUT   ", node.type, escodegen.generate(node))

                  var ustr  = filename+":"+node.loc.start.line;
                  // var hash1=ADLER32.str(ustr).toString(16);
                  // ast.getPosition(node).url = input_file;

                  var hash1 = polycrc.crc24(ustr).toString(10);
                  console.log("fp.fact(Stmt(BitVecVal("+hash1+",lineNum),BitVecVal(0000000,obj)))");
                  // console.log(location, aaa[1], "!!:!!:!!  ",sline,"	",scol,"	",eline,"	",ecol,"   ",ast);

                }

                if (node.loc.start.line == sline && node.loc.end.line == eline &&
                      node.loc.start.column == scol && node.loc.end.column == ecol && deepEqual(value,log_output))
               {

                 var ustr  = filename+":"+node.loc.start.line;
                 // var hash1=ADLER32.str(ustr).toString(16);
                 // ast.getPosition(node).url = input_file;

                 var hash1 = polycrc.crc24(ustr).toString(10);
                 console.log("LOG OUTPUT    ", node.type, escodegen.generate(node));


                 console.log("fp.fact(Stmt(BitVecVal("+hash1+",lineNum),BitVecVal(1111111,obj)))");


                 // console.log(location, aaa[1], "!!:!!:!!  ",sline,"	",scol,"	",eline,"	",ecol,"   ",ast);

               }
             }
           });


      }
      catch (e){
      }

}

}


(function (sandbox) {
    function MyAnalysis() {

        function getValue(v) {
            var type = typeof v;
            if ((type === 'object' || type ==='function') && v!== null) {
                var shadowObj = sandbox.smemory.getShadowObjectOfObject(v);
                try{
                  // if(stringify(v).includes("mobilePhone"))
                  // console.log("##################"+stringify(v));
                  // if(deepEqual(v,log_output))
                     // console.log("@@@@@@@@@@@@@@@@@@@@@@@"+stringify(v));
              }catch(e){}
                return shadowObj;
                //return sandbox.smemory.getIDFromShadowObjectOrFrame(shadowObj);
            } else {
                return v;
            }
        }


        this.invokeFunPre = function (iid, f, base, args, isConstructor, isMethod, functionIid) {
            // iidToSyntax(iid);
            return {f: f, base: base, args: args, skip: false};
        };

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod, functionIid) {
          // iidToSyntax(iid);
            return {result: result};
        };

        this.literal = function (iid, val, hasGetterSetter) {
          // iidToSyntax(iid);
            return {result: val};
        };

        this.forinObject = function (iid, val) {
          // iidToSyntax(iid);
            return {result: val};
        };

        this.declare = function (iid, name, val, isArgument, argumentIndex, isCatchParam) {
            // iidToSyntax(iid);
            return {result: val};
        };

        this.getFieldPre = function (iid, base, offset, isComputed, isOpAssign, isMethodCall) {
          // iidToSyntax(iid);
            // iidToSyntax(iid,val);
            return {base: base, offset: offset, skip: false};
        };
        this.getField = function (iid, base, offset, val, isComputed, isOpAssign, isMethodCall) {
            var shadowObj = sandbox.smemory.getShadowObject(base, offset, true);
	    //console.log("testing ... getField", iid, val);
            //var args = {base: sandbox.smemory.getIDFromShadowObjectOrFrame(shadowObj.owner), offset: offset, val: getValue(val), isComputed: isComputed, isOpAssign: isOpAssign, isMethodCall: isMethodCall};
            // var args = {base: sandbox.smemory.getIDFromShadowObjectOrFrame(shadowObj.owner), val: val};
            iidToSyntax(iid,val);
//            console.log("getField() at " + J$.iidToLocation(J$.sid, iid));
/*
            var id = J$.getGlobalIID(iid);
            var location = J$.iidToLocation(id);
            var aaa = /\((.+):(.+):(.+):(.+):(.+)\)/g.exec(location);
            if(aaa !=null && aaa.length == 6 )
            {
              var filename = aaa[1];
              try{
                    var ast = esprima.parse(fs.readFileSync(filename,'utf-8'),{ loc: true, range: true });
                    var sline=aaa[2], scol=aaa[3]-1, eline=aaa[4], ecol=aaa[5]-1;
                    // console.log(location, aaa[1], "!!:!!:!!  ",sline,"	",scol,"	",eline,"	",ecol,"   ",ast);
                     estraverse.traverse(ast, {
                       enter: function(node) {

                         if (node.type === 'ExpressionStatement'){
                           // console.log('Encountered ExpressionStatement to', escodegen.generate(node));
                         }
                         else if (node.type === 'AssignmentExpression'){
                           // console.log('Encountered assignment to', escodegen.generate(node));
                         }

                           if (node.loc.start.line == sline && node.loc.end.line == eline &&
                                 node.loc.start.column == scol && node.loc.end.column == ecol && deepEqual(val,log_input))
                          {
                            console.log("Deserialized??", node.type, escodegen.generate(node))
                            console.log(location, aaa[1], "!!:!!:!!  ",sline,"	",scol,"	",eline,"	",ecol,"   ",ast);

                          }

                          if (node.loc.start.line == sline && node.loc.end.line == eline &&
                                node.loc.start.column == scol && node.loc.end.column == ecol && deepEqual(val,log_output))
                         {
                           console.log("??????? Serialized???", node.type, escodegen.generate(node))
                           console.log(location, aaa[1], "!!:!!:!!  ",sline,"	",scol,"	",eline,"	",ecol,"   ",ast);

                         }
                       }
                     });


                }
                catch (e){
                }


          }
          */
            return {result: val};
        };

        this.putFieldPre = function (iid, base, offset, val, isComputed, isOpAssign) {
            // iidToSyntax(iid,val);
            return {base: base, offset: offset, val: val, skip: false};
        };

        this.putField = function (iid, base, offset, val, isComputed, isOpAssign) {
            var shadowObj = sandbox.smemory.getShadowObject(base, offset, true);


        //    iidToSyntax(iid);
            //console.log(val, "putField");
            iidToSyntax(iid,val);
            //var args = {base: sandbox.smemory.getIDFromShadowObjectOrFrame(shadowObj.owner), offset: offset, val: getValue(val), isComputed: isComputed, isOpAssign: isOpAssign};
            //var args = {base: sandbox.smemory.getIDFromShadowObjectOrFrame(shadowObj.owner), val: getValue(val)};
	    //console.log(val);
/*
      var id = J$.getGlobalIID(iid);
      var location = J$.iidToLocation(id);
      var aaa = /\((.+):(.+):(.+):(.+):(.+)\)/g.exec(location);
      if(aaa !=null && aaa.length == 6)
      {
        var filename = aaa[1];
        try{
              var ast = esprima.parse(fs.readFileSync(filename,'utf-8'),{ loc: true, range: true });
              var sline=aaa[2], scol=aaa[3]-1, eline=aaa[4], ecol=aaa[5]-1;
               estraverse.traverse(ast, {
                 enter: function(node) {
                     if (node.loc.start.line == sline && node.loc.end.line == eline &&
                           node.loc.start.column == scol && node.loc.end.column == ecol && deepEqual(val,log_input))
                    {
                      console.log("Deserialized??", node.type, escodegen.generate(node))
                      // console.log(location, aaa[1], "!!:!!:!!  ",sline,"	",scol,"	",eline,"	",ecol,"   ",ast);

                    }

                    if (node.loc.start.line == sline && node.loc.end.line == eline &&
                          node.loc.start.column == scol && node.loc.end.column == ecol && deepEqual(val,log_output))
                   {
                     console.log("??????? Serialized???", node.type, escodegen.generate(node))
                     // console.log(location, aaa[1], "!!:!!:!!  ",sline,"	",scol,"	",eline,"	",ecol,"   ",ast);

                   }
                 }
               });


          }
          catch (e){
          }


    }
*/
            var args = {base: sandbox.smemory.getIDFromShadowObjectOrFrame(shadowObj.owner), val: val};
            //console.log("putField("+JSON.stringify(args)+") at " + J$.iidToLocation(J$.sid, iid));
            return {result: val};
        };

        this.read = function (iid, name, val, isGlobal, isScriptLocal) {
          // iidToSyntax(iid);
            return {result: val};
        };

        this.write = function (iid, name, val, lhs, isGlobal, isScriptLocal) {
          // iidToSyntax(iid);
            return {result: val};
        };

        this._return = function (iid, val) {
          // iidToSyntax(iid);
            return {result: val};
        };

        this._throw = function (iid, val) {
          // iidToSyntax(iid);
            return {result: val};
        };

        this._with = function (iid, val) {
          // iidToSyntax(iid);
            return {result: val};
        };

        this.functionEnter = function (iid, f, dis, args) {
          // iidToSyntax(iid);
        };

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
          // iidToSyntax(iid);
            return {returnVal: returnVal, wrappedExceptionVal: wrappedExceptionVal, isBacktrack: false};
        };

        this.scriptEnter = function (iid, instrumentedFileName, originalFileName) {
          // iidToSyntax(iid);
        };

        this.scriptExit = function (iid, wrappedExceptionVal) {
            return {wrappedExceptionVal: wrappedExceptionVal, isBacktrack: false};
        };

        this.binaryPre = function (iid, op, left, right, isOpAssign, isSwitchCaseComparison, isComputed) {
          // iidToSyntax(iid);
            return {op: op, left: left, right: right, skip: false};
        };

        this.binary = function (iid, op, left, right, result, isOpAssign, isSwitchCaseComparison, isComputed) {
          // iidToSyntax(iid);
            return {result: result};
        };

        this.unaryPre = function (iid, op, left) {
          // iidToSyntax(iid);
            return {op: op, left: left, skip: false};
        };

        this.unary = function (iid, op, left, result) {
          // iidToSyntax(iid);
            return {result: result};
        };

        this.conditional = function (iid, result) {
          // iidToSyntax(iid);
            return {result: result};
        };

        this.instrumentCodePre = function (iid, code, isDirect) {
          // iidToSyntax(iid);
            return {code: code, skip: false};
        };

        this.instrumentCode = function (iid, newCode, newAst, isDirect) {
          // iidToSyntax(iid);
            return {result: newCode};
        };

        this.endExpression = function (iid) {
          // iidToSyntax(iid);
        };

        this.endExecution = function () {
          // iidToSyntax(iid);
        };

        this.runInstrumentedFunctionBody = function (iid, f, functionIid) {
          // iidToSyntax(iid);
            return false;
        };
        this.scriptEnter = function (iid, instrumentedFileName, originalFileName) {
        //  iidToSyntax(iid);
	 	        //var id = J$.getGlobalIID(iid);
	    	    //console.log("filename "+id+"  "+originalFileName);
        };
        /**
         * onReady is useful if your analysis is running on node.js (i.e., via the direct.js or jalangi.js commands)
         * and needs to complete some asynchronous initialization before the instrumented program starts.  In such a
         * case, once the initialization is complete, invoke the cb function to start execution of the instrumented
         * program.
         *
         * Note that this callback is not useful in the browser, as Jalangi has no control over when the
         * instrumented program runs there.
         * @param cb
         */
        this.onReady = function (cb) {
            cb();
        };
    }

    sandbox.analysis = new MyAnalysis();
})(J$);


function deepEqual(obj1, obj2) {
    if (typeof obj1 === "object" && typeof obj2 === "object") {
        let isObjectMatch = false;
        for (let property1 in obj1) {
            let isPropertyMatch = false;
            for (let property2 in obj2) {
                if (property1 === property2) {
                    isPropertyMatch = deepEqual(obj1[property1], obj2[property2])
                }

                if(isPropertyMatch){
                    break;
                }
            }

            isObjectMatch  = isPropertyMatch;

            if (!isObjectMatch) {
                break;
            }
        }

        return isObjectMatch;
    }
    else if(typeof obj1 ==="number" || typeof obj2 ==="number" || typeof obj1 ==="string" || typeof obj2 ==="string"){
        return obj1 == obj2;
    }


    else {
        return obj1 === obj2;
     }
}

// node src/js/commands/jalangi.js --inlineIID --inlineSource --analysis src/js/sample_analyses/ChainedAnalyses.js --analysis src/js/runtime/SMemory.js --analysis src/js/sample_analyses/tutorial/LogAll.js tests/octane/deltablue.js
