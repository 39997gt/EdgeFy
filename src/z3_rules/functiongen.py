exitLine = Const('exit', lineNum)
fp.declare_var(exitLine)
globals ={}

with open('Subject.json') as f:
    extracted_parts = json.load(f)


beforecloudjs=""
template1="//enhanced with CRDT\n    e_ref_states = Automerge.change(e_ref_states, 'cloud', _states => {\n"
template2="\n\t});//enhanced with CRDT"
for xx in range(0, len(sids_mar)):
    #value_sid_unmarshal = sids[x]
    #sql statements
    print sids_unmar[xx], sids_mar[xx]

    jscode = ''
    fp.query(unMarshal(line2, v1, sids_unmar[xx]))
    v_ex = fp.get_answer()
    unmarshal_stmt = v_ex.arg(1).arg(1).as_long()
    unmarshal_stmt_start = get_key(unmarshal_stmt).split(":")[1]
    print colored("*********** Constraint Solving Started::::",'magenta')
    print colored( "unMarshal***********",'blue'), unmarshal_stmt, unmarshal_stmt_start

    fp.query(Marshal(line2, v1, sids_mar[xx]))
    v_ex = fp.get_answer()

    marshal_stmt = v_ex.arg(1).arg(1).as_long()
    loadedVar = v_ex.arg(0).arg(1).as_long()
    marshal_stmt_start = get_key(marshal_stmt).split(":")[1]
    print colored("Marshal***********  ",'blue') , marshal_stmt, marshal_stmt_start


    fp.query(stmtdep(exitLine,unmarshal_stmt))
    v_ex = fp.get_answer()

    fp.query(stmtdep(exitLine,marshal_stmt))
    v_ex = fp.get_answer()


    if marshal_stmt != unmarshal_stmt:
        fp.query(ExecutedStmts(exitLine, 12313, sids_unmar[xx], sids_mar[xx]))
    else:
        fp.query(ExecutedStmts0(exitLine, sids_unmar[xx], sids_mar[xx]))

    # fp.query(ExecutedStmts(exitLine, 12313, 9114157, 1717943))
    v_ex = fp.get_answer()
    print colored("ExecutedStmts***********  ",'blue')
    print v_ex
    uid = "s"+str(xx+1)



    extract_ftn={};
    extract_globals={};
    extract_others={};

    for x in range(0, v_ex.num_args()):
        myposition = get_key(v_ex.arg(x).arg(1).as_long()).split(":")[1];
        #print "myposition", myposition, unmarshal_stmt_start, marshal_stmt_start , int(myposition)>=int(unmarshal_stmt_start)
        if int(myposition)>=int(unmarshal_stmt_start) and int(myposition)<=int(marshal_stmt_start):
            extract_ftn[int(myposition)] = int(v_ex.arg(x).arg(1).as_long());
        #  extract_globals[myposition]= v_ex.arg(x).arg(1).as_long();
        else:
            extract_globals[int(myposition)] = int(v_ex.arg(x).arg(1).as_long());
           # extract_ftn[myposition]=v_ex.arg(x).arg(1).as_long();

    #print "extract_ftn", extract_ftn
    #print "extract_others", extract_globals

    print colored("Extracting Functions***********  ",'magenta')

    for key in sorted(extract_globals.keys()):
        if extract_globals[key] > boundToExtractFunction:
            # print colored(code[extract_globals[key]], 'cyan')
            otherfilename = get_key(extract_globals[key]).split(":")[0]
            # print otherfilename
            if otherfilename in extract_others:
                extract_others[otherfilename].append(code[extract_globals[key]]);
            else:
                extract_others[otherfilename] = [];
                extract_others[otherfilename].append(code[extract_globals[key]]);
        else:
            # print colored(code[extract_globals[key]], 'blue')
            if extract_globals[key] not in globals:
                #jscode +=code[extract_globals[key]]+"\n"
                globals[extract_globals[key]]=code[extract_globals[key]]
                extracted_parts['dep_stmts'].append(code[extract_globals[key]])

    nested_stmts = ""
    # print "extract_others", extract_others
    if sids_unmar[xx]!=9114157:
        # print "function "+uid+"(input){"
        jscode +="function "+uid+"(input){"+"\n"
        adaptedIn = adaptinput(code[unmarshal_stmt],"id")
        nested_stmts = "\tvar input = req.params.id;\n"
        if int(unmarshal_stmt) not in extract_ftn.itervalues():
            # print colored(adaptedIn, 'blue')
            jscode += adaptedIn + "\n"
            nested_stmts+= adaptedIn + "\n"
    else:
        # print "function "+uid+"(){"
        jscode +="function "+uid+"(){"+"\n"
        adaptedIn = code[unmarshal_stmt];

    _start=0; _end=0; _len=len(extract_ftn.keys());
    jj=0;
    offset=0
    for key in sorted(extract_ftn.keys()):
        jj=jj+1
        jscode += "\t"+code[extract_ftn[key]] + "\n"

        _s_stmt = int(get_key(extract_ftn[key]).split(":")[1])
        _e_stmt = int(get_key(extract_ftn[key]).split(":")[2])
        _file = get_key(extract_ftn[key]).split(":")[0]
        if beforecloudjs == "":
            beforecloudjs = open(_file, 'r').read()
        _ttt=""
        if crdt_rewrite.has_key(_file):
            for loc in crdt_rewrite[_file]['locs']:
                _s = int(loc.split(":")[0])
                _e = int(loc.split(":")[1])
                # print "@@@@@", _s, _e, _s_stmt, _e_stmt
                if _s_stmt <= _s and _e_stmt >= _e:
                    _ttt = beforecloudjs[_s_stmt:_s] + crdt_rewrite[_file]['rewrite'] + beforecloudjs[_e:_e_stmt]
                    # print "_ttt", _ttt
                    nested_stmts += "\t" + _ttt + "\n"
        if _ttt=="":
            nested_stmts += "\t" + code[extract_ftn[key]] + "\n"
        if jj == 1:
            _start=int(get_key(extract_ftn[key]).split(":")[1])
            _file=get_key(extract_ftn[key]).split(":")[0]

        if _len == 1:
            _end = int(get_key(extract_ftn[key]).split(":")[2])+1
        elif jj == _len:
            _end = int(get_key(extract_ftn[key]).split(":")[2])+1


    _crdt_txt=""
    if crdt_rewrite.has_key(_file):
        for loc in crdt_rewrite[_file]['locs']:
            _s=int(loc.split(":")[0])
            _e=int(loc.split(":")[1])
            if _start <= _s and _end >=_e:
                _crdt_txt=beforecloudjs[_start:_s]+crdt_rewrite[_file]['rewrite']+beforecloudjs[_e:_end]

    beforecloudjs = beforecloudjs[0:_start]+template1+_crdt_txt+template2+beforecloudjs[_end:len(beforecloudjs)-1]

    jscode +=adaptoutput(code[marshal_stmt], loadedVar) +"\n"
    nested_stmts +=adaptoutput_netsted(code[marshal_stmt], loadedVar) +"\n"

    jscode +="\treturn output;\n}\n"

    if os.path.isdir("./results"):
        f = open("results/" + uid + ".js", "w")
        f.write(jscode)
    else:
        f = open("./" + uid + ".js", "w")
        f.write(jscode)

    extracted_parts['services'][xx]['ftn_stmts'] = jscode
    extracted_parts['services'][xx]['nested_ftn_stmts'] = nested_stmts
    # print extract_others
    for key in extract_others:
        # print key, extract_others[key]
        if os.path.isdir("./results"):
            f = open("results/"+key, "w")
        else:
            f = open("./" + key, "w")
        txt = "//generated code\n"
        for stmt in extract_others[key]:
            txt +=stmt
        f.write(txt)
        if len(txt)>201:
            print colored("//dependent statements in File "+key+"\n"+txt[0:200]+"\n...(cut for long contents)", 'cyan')
        else:
            print colored("//dependent statements in File " + key + "\n" + txt, 'cyan')

    for sql in sqlstmts:
        print colored("//sql stmts "+ "\n" + sql , 'cyan')

    # print colored("Extracting Functions DONE!***********  \n"+jscode,'magenta')
    print colored(jscode, 'green')
    print "\nExtracted Function DONE!***********  \n"
    print colored("//nested form\n"+nested_stmts, 'grey')

# print colored("Extracting Functions DONE!***********  \n",'magenta')

print colored(beforecloudjs, 'yellow')

json_object = json.dumps(snapshots, indent = 1)


f = open("results/snapshots.json", "w")
f.write(json_object)
json_object = json.dumps(extracted_parts, indent = 1)
f = open("results/data.json", "w")
f.write(json_object)

# if os.path.isdir("./results"):
#     f = open("results/" + uid + ".js", "w")
#     f.write(jscode)
# else:
#     f = open("./" + uid + ".js", "w")
#     f.write(jscode)
