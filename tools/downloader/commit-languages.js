const fs = require("fs");
const csv_parser = require("csv-parse");

let studyCommits = "/home/peta/devel/CACM/cacm-study/original_from_authors/sqlDump/DATA/_newSha.csv";
let downloadDir = "/home/peta/devel/CACM/projects/"


let outputCSV = true;

function LOG(what) {
    if (! outputCSV)
        console.log(what);
}

function CSV(what) {
    if (outputCSV)
        console.log(what);
}

function ExtractFileSnapshots(filename, callback) {
    let snapshots = {}
    let parser = csv_parser();
    let expectHeader = true;
    LOG("Loading commits...")
    parser.on("readable", () => {
        while (record = parser.read()) {
            if (expectHeader) {
                expectHeader = false;
                continue;
            }
            let hash = record[6];
            try {
                let commit = JSON.parse(fs.readFileSync(downloadDir + "commits/" + hash.substr(0,2) + "/" + hash.substr(2,2) + "/" + hash.substr(4)));
                for (let f of commit.files) {
                    if (f.status === "A" || f.status === "M") {
                        // get the hash
                        let hash = f.hash
                        // get the extension
                        let ext = f.path.split(".");
                        ext = ext[ext.length - 1]
                        if (snapshots[hash] === undefined) {
                            CSV(downloadDir + "snapshots/" + hash.substr(0,2) + "/" + hash.substr(2,2) + "/" + hash.substr(4) + "," + ext);
                            snapshots[hash] = true;
                        }
                    }
                }
            } catch (e) {
                
            }
        }
    });
    parser.on("finish", () => {
        callback(null, projects);
    });
    let istream = fs.createReadStream(filename);
    istream.pipe(parser);
}

/** Loads the predictions.
    */
function LoadPredictions(filename, callback) {
    let parser = csv_parser();
    let predictions = {}
    LOG("Loading predictions...")
    parser.on("readable", () => {
        while (record = parser.read()) {
            let name = record[0];
            let language = record[1];
            let diff = parseFloat(record[2]);
            name = name.split("/")
            name = name[name.length - 3] + name[name.length - 2] + name[name.length - 1];
            predictions[name] = { language : language, diff : diff }
        }
    });
    parser.on("finish", () => {
        callback(null, predictions);
    });
    let istream = fs.createReadStream(filename);
    istream.pipe(parser);
}
/*
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
function GetLanguageCounter() {
    return {
        "C" : 0,
        "C++" : 0,
//        "C#" : 0,
        "Objective-C" : 0,
//        "Go" : 0,
        "Java": 0,
//        "Coffeescript": 0,
        "Javascript" : 0,
        "Typescript" : 0,
        "Ruby": 0,
        "Php" : 0,
        "Python" : 0,
        "Perl" : 0,
//        "Clojure" : 0,
//        "Erlang" : 0,
//        "Haskell" : 0,
        "Scala" : 0
    }
}

function ExpectedLangFile(filename, language) {
    ext = filename.split(".")
    ext = ext[ext.length - 1]
    switch (ext) {
    case "h":
        return language == "C" || language == "C++";
    case "c":
    case "C":
        return language == "C";
    case "cc":
    case "cpp":
    case "hpp":
    case "hxx":
    case "cxx":
    case "c++":
    case "h++":
        return language == "C++";
    case "m":
    case "mm":
    case "M":
        return language == "Objective-C";
    case "java":
        return language == "Java";
    case "js":
        return language == "Javascript";
    case "ts":
    case "tsx":
        return language == "Typescript";
    case "rb":
        return language == "Ruby";
    case "php":
    case "phtml":
    case "php3":
    case "php4":
    case "php5":
    case "php7":
    case "phps":
    case "php-s":
        return language == "Php";
    case "py":
        return language == "Python";
    case "pl":
    case "pm":
        return language == "Perl";
    case "sc":
    case "scala":
        return language == "Scala";
    default:
        return false;
    }
}


function VerifyFileLanguages(filename, predictions, callback) {
    let parser = csv_parser();
    let expectHeader = true;
    let validCommits = GetLanguageCounter();
    let invalidCommits = GetLanguageCounter();
    let totalCommits = 0;
    LOG("Loading commits...")
    parser.on("readable", () => {
        while (record = parser.read()) {
            if (expectHeader) {
                expectHeader = false;
                continue;
            }
            let language = record[0];
            if (validCommits[language] == undefined)
                continue;
            let chash = record[6];
            try {
                let commit = JSON.parse(fs.readFileSync(downloadDir + "commits/" + chash.substr(0,2) + "/" + chash.substr(2,2) + "/" + chash.substr(4)));
                let ok =- false;
                for (let f of commit.files) {
                    if (f.status === "A" || f.status === "M") {
                        // only care about language files
                        if (ExpectedLangFile(f.path, language)) {
                            // get the hash
                            let hash = f.hash
                            let p = predictions[hash];
                            if (p !== undefined) {
                                if (p.language.toLowerCase() == language.toLowerCase()) {
                                    ok = true;
                                    break;
                                } else {
                                    CSV(hash + "," + f.path + ", " + p.language +", " + chash);
                                }
                            }
                        }
                    }
                }
                if (ok) {
                    ++validCommits[language];
                } else {
                    ++invalidCommits[language];
                    CSV(chash + "," + language + ",commit,commit")
                }
/*                ++totalCommits;
                if (totalCommits % 1000 === 0) {
                    let out = "total: " + totalCommits;
                    for (let lang in validCommits)
                        out = out + " " + lang + "(" + validCommits[lang] + "," + invalidCommits[lang] + ")"
                    LOG(out);
                } */
            } catch (e) {
                
            }
        }
    });
    parser.on("finish", () => {
        let out = "total: " + totalCommits;
        for (let lang in validCommits)
            out = out + " " + lang + "(" + validCommits[lang] + "," + invalidCommits[lang] + ")"
        LOG(out);
        callback(null);
    });
    let istream = fs.createReadStream(filename);
    istream.pipe(parser);
    
}



LOG("OH HAI!");
/*ExtractFileSnapshots(studyCommits, (error, projects) => {
    LOG("KTHXBYE!!!");
    process.exit();
    }); */
LoadPredictions("/mnt/data/CACM/pangloss/prediction-full.txt", (err, predictions) => {
    VerifyFileLanguages(studyCommits, predictions, (err, langStats) => {
        LOG("KTHXBYE!!!");
        process.exit();
    });
});
