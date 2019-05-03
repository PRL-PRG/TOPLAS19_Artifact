const fs = require("fs")
const csv_parser = require("csv-parse")


let ignored = 0
let deletions = 0

let hackusers = {
    "mono" : "",
    "spray" : "",
    "tslint" : "",
    "libgdx" : "",
    "django" : "",
    "symfony" : "",
    "snap" : "",
    "cakephp" : "",
    "ProjectTox-Core" : "RichiH",
    "scalaz" : "",
    "tiedot" : "",
    "phpunit" : "",
    "numpy" : "",
    "v8" : "",
    "scikit-learn" : "",
    "libCello" : "bgaff",
    "spring-framework" : "spring-projects",
    "guzzle" : "",
    "elasticsearch" : "",
    "VsVim" : "",
    "tsuru" : "",
    "coffee-script" : "",
    "doctrine2" : "",
    "otp" : "",
    "blueeyes" : "",
    "tsd" : "",
    "jquery-ui" : "jquery",
    "ghc" : "",
    "netty" : "",
    "hugo" : "",
    "nhibernate-core" : "",
    "ServiceStack" : "",
    "dropzone" : "",
    "ruby" : "",
    "gmvault" : "",
    "devise" : "",
    "ravendb" : "",
    "lila" : "ornicar",
    "incubator-spark" : "ooyala",
    "zf2" : "",
    "Newtonsoft.Json" : "JamesNK",
    "sqlite-net" : "",
    "core.logic" : "",
    "clj-http" : "",
    "ember.js" : "",
    "meck" : "eproxus",
    "opencv" : "",
    "core" : "nextcloud", // is now server
    "doozerd" : "",
    "erlydtl" : "",
    "androidquery" : "",
    "YouCompleteMe" : "",
    "cqrs-journey-code" : "jbogard",
    "mythtv" : "MythTV",
    "kafka" : "",
}

// load users
let projects = fs.readFileSync("../projects/projects.csv", "utf-8").split("\n")
for (let p of projects) {
    let pp = p.trim().split("/")
    if (hackusers[pp[1]] !== undefined)
        hackusers[pp[1]] = pp[0]
}
console.log("<html><body><table>")
console.log("<tr><th>Repo</th><th>Commit</th><th>File</th></tr>")

let parser = csv_parser({ delimiter : "," })
parser.on("readable", () => {
    while (record = parser.read()) {
        let repo = record[0]
        let user = hackusers[repo]
        let path = record[9]
        let chash = record[8]
        try {
            let commit = JSON.parse(fs.readFileSync("../projects/commits/" + chash.substr(0,2) + "/" + chash.substr(2, 2) + "/" + chash.substr(4)))
            let fhash = undefined
            for (let f of commit.files)
                if (f.path === path) {
                    fhash = f.hash
                    break;
                }
            if (fhash === undefined)
                console.log("!! Unable to find path " + path + " in commit " + chash)
            else if (fhash === "0000000000000000000000000000000000000000")
                deletions += 1
            else {
                let commitUrl = "https://github.com/" + user + "/" + repo + "/commit/" + chash
                let fileUrl = "https://github.com/" + user + "/" + repo + "/blob/" + chash + "/" +  path
                let repoUrl = "https://github.com/" + user + "/" + repo
                console.log("<tr><td><a href='"+ repoUrl+"'>" + user + "/" + repo + "</a></td><td><a href='"+ commitUrl+"'>"+chash+"</a></td><td><a href='"+ fileUrl + "'>"+path+"</a></td></tr>")
                //console.log(record.slice(1, record.length -1).join(","))
                
            }
        } catch (e) {
            ignored += 1
//            console.log("!! commit " + chash + " not analyzed");
		console.log(e);
        }
    }
})
parser.on("finish", () => {
    console.log("</table></body></html>")
//    console.log("Deletions: " + deletions)
//    console.log("Ignored:   " + ignored)
    process.exit()
})
let istream = fs.createReadStream("tested-tests.csv")
istream.pipe(parser)

