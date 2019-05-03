const fs = require("fs");
const csv_parser = require("csv-parse");

let studyCommits = "../original_from_authors/sqlDump/DATA/_newSha.csv";
let downloadDir = "../projects"

let outputCSV = true;


function LOG(what) {
    if (! outputCSV)
        console.log(what);
}
function CSV(what) {
    if (outputCSV)
        console.log(what);
}

/** Loads all the commits in the study, and categorizes them to projects. The structure of the input file is as follows:

    [0] = language
    [1] = type class
    [2] = lang class
    [3] = memory class
    [4] = compile class
    [5] = project
    [6] = commit sha
    [7] = files
    [8] = committer
    [9] = commit date
    [10] = commit age
    [11] = insertions
    [12] = deletions
    [13] = isBug
    [14] = bug_type
    [15] = phase
    [16] = domain
    [17] = btype1
    [18] = btype2
const CPP = 0
const CS = 1
const OBJC = 2
const GO = 3
const JAVA = 4
const COFFEE = 5
const JS = 6
const TS = 7
const RUBY = 8
const PHP = 9
const PYTHON = 10
const PERL = 11
const CLOJURE = 12
const ERLANG = 13
const HASKELL = 14
const SCALA = 15
    
 */
function LoadStudyProjects(filename, callback) {
    LOG("Reading study commits data...");
    let expectHeader = true;
    let totalRecords = 0;
    let totalProjects = 0;
    let duplicateCommits = 0;
    let uniqueCommits = 0;
    let parser = csv_parser();
    let projects = {}
    let invalidLanguageCommits = 0;
    parser.on("readable", () => {
        while (record = parser.read()) {
            if (expectHeader) {
                expectHeader = false;
                continue;
            }
            ++totalRecords;
            let projectName = record[5];
            if (projects[projectName] === undefined) {
                ++totalProjects;
                projects[projectName] = { maxDate : 10,
                                          commits : {},
                                          language : record[0],
                                          commitTotals : [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                                        };
            }
            // add the commit hash to the project
            // TODO for now, this is all we need
            let p = projects[projectName];
            let commitHash = record[6];
            let lang = record[0]
            if (lang === "C" || lang === "C++")
                ++p.commitTotals[CPP];
            else if (lang === "C#")
                ++p.commitTotals[CS];
            else if (lang === "Objective-C")
                ++p.commitTotals[OBJC];
            else if (lang === "Go")
                ++p.commitTotals[GO];
            else if (lang === "Java")
                ++p.commitTotals[JAVA];
            else if (lang === "Coffeescript")
                ++p.commitTotals[COFFEE];
            else if (lang === "Javascript")
                ++p.commitTotals[JS];
            else if (lang === "Typescript")
                ++p.commitTotals[TS];
            else if (lang === "Ruby")
                ++p.commitTotals[RUBY];
            else if (lang === "Php")
                ++p.commitTotals[PHP];
            else if (lang === "Python")
                ++p.commitTotals[PYTHON];
            else if (lang === "Perl")
                ++p.commitTotals[PERL];
            else if (lang === "Clojure")
                ++p.commitTotals[CLOJURE];
            else if (lang === "Erlang")
                ++p.commitTotals[ERLANG];
            else if (lang === "Haskell")
                ++p.commitTotals[HASKELL];
            else if (lang === "Scala")
                ++p.commitTotals[SCALA];
            else {
                console.log(lang);
                ++invalidLanmguageCommits;
            }
            if (p.commits[commitHash] !== undefined) {
                ++duplicateCommits;
                continue;
            }
            // this attaches the commit date to the record
            let t = Math.floor(new Date(record[9]).getTime() / 1000);
            p.commits[commitHash] = t;
            if (p.maxDate < t)
                p.maxDate = t;
            ++uniqueCommits;
        }
    });
    parser.on("finish", () => {
        LOG("  Total records:     " + totalRecords);
        LOG("  Total projects:    " + totalProjects);
        LOG("  Duplicate commits: " + duplicateCommits);
        LOG("  Unique commits:    " + uniqueCommits);
        callback(null, projects);
    });
    let istream = fs.createReadStream(filename);
    istream.pipe(parser);
}

/** Looks for all projects we have downloaded, and tries to find their match in the study projects. This should be easy because the project name alone should be the key.
 */
function VerifyProjects(projects, downloadDir) {
    LOG("Analyzing downloaded projects...");        
    let unknownProjects = 0;
    let identifiedProjects = 0;
    let projectsFolder = downloadDir + "/projects";
    let tasks = [];
    for (let d of fs.readdirSync(projectsFolder)) {
        if (d === "." || d === "..")
            continue;
        for (let p of fs.readdirSync(projectsFolder + "/" + d)) {
            if (d === "." || d === '..')
                continue;
            // now we have project, read the project's JSON
            let pInfo = JSON.parse(fs.readFileSync(projectsFolder + "/" + d + "/" + p));
            let projectName = pInfo.metadata.name;
            if (projects[projectName] === undefined) {
                ++unknownProjects;
                //LOG(projectName);
                continue;
            } else {
                ++identifiedProjects;
                // match the project with its commits to verify and create a tasks
                let initialCommit = pInfo.branches[pInfo.metadata.default_branch];
                tasks.push({ commit : initialCommit, project: projects[projectName], metadata: pInfo.metadata });
            }
        }
    }
    LOG("  Unknown projects:    " + unknownProjects);
    LOG("  Identified projects: " + identifiedProjects);
    return tasks;
}

const CPP = 0
const CS = 1
const OBJC = 2
const GO = 3
const JAVA = 4
const COFFEE = 5
const JS = 6
const TS = 7
const RUBY = 8
const PHP = 9
const PYTHON = 10
const PERL = 11
const CLOJURE = 12
const ERLANG = 13
const HASKELL = 14
const SCALA = 15

let missingTotals = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]


/** Scans the files changed by the commit and determines if the commit should be ignored by the study because it does not change any file written in the language of interest, or if the commit is actually important.
    */
function IsCommitValid(commit) {
    let missing = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    for (let f of commit.files) {
        if (f.status === "D")
            continue;
        f = f.path;
        // C and C++
        if (f.endsWith(".h") || f.endsWith(".cpp") || f.endsWith(".cc") || f.endsWith(".c") || f.endsWith(".cxx") || f.endsWith(".C") || f.endsWith(".c++") || f.endsWith(".hh") || f.endsWith(".hpp") || f.endsWith(".hxx") || f.endsWith(".h++")) {
            missing[CPP] = 1; 
        }
        // C#
        if (f.endsWith(".cs")) {
            missing[CS] = 1; 
        }
        // Objective-C
        if (f.endsWith(".m") || f.endsWith(".mm") || f.endsWith(".M")) {
            missing[OBJC] = 1; // .h conflicts with C/C++
        }
        // Go
        if (f.endsWith(".go")) {
            missing[GO] = 1; 
        }
        // Java
        if (f.endsWith(".java")) { // should we consider .jar and .class as well?
            missing[JAVA] = 1; 
        }
        // CoffeeScript
        if (f.endsWith(".coffee") || f.endsWith(".litcoffee")) {
            missing[COFFEE] = 1; 
        }
        // JavaScript
        if (f.endsWith(".js")) {
            missing[JS] = 1; 
        }
        // TypeScript
        if (f.endsWith(".ts") || f.endsWith(".tsx")) {
            missing[TS] = 1; 
        }
        // Ruby
        if (f.endsWith(".rb")) {
            missing[RUBY] = 1; 
        }
        // PhP
        if (f.endsWith(".php") || f.endsWith(".phtml") || f.endsWith(".php3") || f.endsWith(".php4") || f.endsWith(".php5") || f.endsWith(".php7") || f.endsWith(".phps") || f.endsWith(".php-s")) {
            missing[PHP] = 1; 
        }
        // Python
        if (f.endsWith(".py")) {
            missing[PYTHON] = 1; 
        }
        // Perl
        if (f.endsWith(".pl") || f.endsWith(".pm") /* || f.endsWith(".t") || f.endsWith(".pod") */) {
            missing[PERL] = 1; 
        }
        // Clojure
        if (f.endsWith(".clj") || f.endsWith(".cljs") || f.endsWith(".cljc") || f.endsWith(".edn")) {
            missing[CLOJURE] = 1; 
        }
        // Erlang
        if (f.endsWith(".erl") || f.endsWith(".hrl")) {
            missing[ERLANG] = 1; 
        }
        // Haskell
        if (f.endsWith(".hs") || f.endsWith(".lhs")) {
            missing[HASKELL] = 1; 
        }
        // Scala
        if (f.endsWith(".scala") || f.endsWith(".sc")) {
            missing[SCALA] = 1; 
        }
    }
    return missing;
}

function VerifyProject(task, downloadDir) {
/*
    let s = '"' + task.metadata.name + '","' + task.metadata.full_name + '",' + 0 + ',' + 0 + ',' + 0 + ',' + 0;
    for (let i = 0; i < task.project.commitTotals.length; ++i)
        s += ',' + task.project.commitTotals[i]
    CSV(s);
    return; 
*/


//    if (task.metadata.name != "clank")
//        return [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    LOG("Verifying project " + task.metadata.name + " identified as " + task.metadata.full_name + ", main branch " + task.metadata.default_branch + "...");
    downloadDir = downloadDir + "/commits/";
    // an array to which we put all verified commits
    let verified = {}
    // to make sure we do not visit same comit multiple times
    let visited = {}
    let inRange = false;
    //    let Q = [ task.commit ]
    let Q = []
    let validCommits = 0;
    let validMergeCommits = 0;
    let invalidCommits = 0;
    let invalidMergeCommits = 0;
    let ignoredCommits = 0;
    let missingCommits = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    let mc = {}
//    let olderCommits = 0;
    while (Q.length !== 0) {
        let commit = Q.shift();
        commit = JSON.parse(fs.readFileSync(downloadDir + commit.substr(0,2) + "/" + commit.substr(2,2) + "/" + commit.substr(4)));
        // if we have already seen the commit, continue with next one
        if (visited[commit.hash] !== undefined)
            continue;
        visited[commit.hash] = true;
        // enqueue parents
        for (let p of commit.parents)
            Q.push(p);
        // determine basic commit properties
        let isMerge = commit.parents.length > 1;
        let inStudy = (task.project.commits[commit.hash] !== undefined);
        inRange = inRange || inStudy;
        // if we are in range, we are interested in the commit
        if (inRange) {
            if (isMerge) {
                if (inStudy)
                    ++validMergeCommits;
                else
                    ++invalidMergeCommits;
            } else {
                if (inStudy) {
                    ++validCommits;
                } else {
                    let x = IsCommitValid(commit);
                    let isValid = false;
                    for (let i = 0; i < x.length; ++i) {
                        if (x[i] == 1)
                            isValid = true;
                        missingCommits[i] += x[i]
                    }
                        
                    if (isValid) {
                        ++invalidCommits;
  //                      if (mc[commit.hash] === undefined) {
  //                          console.log(commit.hash)
  //                          mc[commit.hash] = 1
  //                      }
                    } else {
                        ++ignoredCommits;
                    }
                }
            }
            if (inStudy)
                verified[commit.hash] = true;
        }
    }
    let unsampledCommits = (Object.keys(task.project.commits).length - Object.keys(verified).length);
    LOG("    Valid commits (merge):   " + validCommits + " (" + validMergeCommits + ")");
    LOG("    Invalid commits (merge): " + invalidCommits + " (" + invalidMergeCommits + ")");
    LOG("    Ignored commits          " + ignoredCommits);
//    LOG("    Older commits:           " + olderCommits);
    LOG("    Unsampled:               " + unsampledCommits);

    let str = '"' + task.metadata.name + '","' + task.metadata.full_name + '",' + validCommits + ',' + ignoredCommits + ',' + invalidCommits + ',' + unsampledCommits;
//    for (let i = 0; i < missingCommits.length; ++i)
//        str += ',' + missingCommits[i]
    for (let i = 0; i < task.project.commitTotals.length; ++i)
        str += ',' + task.project.commitTotals[i]
    CSV(str);
    for (let i = 0; i < missingCommits.length; ++i)
        missingTotals[i] += missingCommits[i]
}



LOG("OH HAI!");
LoadStudyProjects(studyCommits, (error, projects) => {
    let tasks = VerifyProjects(projects, downloadDir);
    // changed names of columns
    CSV("name, full_name, valid, irrelevant, missing, invalid, cpp, cs, objc, go, java, coffee, js, ts, ruby, php, python, perl, clojure, erlang, haskell, scala ")
    for (let t of tasks) {
        VerifyProject(t, downloadDir);
    }
    console.log("Missing commits:")
    console.log("  C/C++         :" + missingTotals[CPP]);
    console.log("  C#            :" + missingTotals[CS]);
    console.log("  Objective-C   :" + missingTotals[OBJC]);
    console.log("  Go            :" + missingTotals[GO]);
    console.log("  Java          :" + missingTotals[JAVA]);
    console.log("  CoffeeScript  :" + missingTotals[COFFEE]);
    console.log("  JavaScript    :" + missingTotals[JS]);
    console.log("  TypeScript    :" + missingTotals[TS]);
    console.log("  Ruby          :" + missingTotals[RUBY]);
    console.log("  PHP           :" + missingTotals[PHP]);
    console.log("  Python        :" + missingTotals[PYTHON]);
    console.log("  Perl          :" + missingTotals[PERL]);
    console.log("  Clojure       :" + missingTotals[CLOJURE]);
    console.log("  Erlang        :" + missingTotals[ERLANG]);
    console.log("  Haskell       :" + missingTotals[HASKELL]);
    console.log("  Scala         :" + missingTotals[SCALA]);
    LOG("KTHXBYE!!!");
    process.exit();
});
