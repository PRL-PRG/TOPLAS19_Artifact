const fs = require("fs")

let downloadDir = "../projects"

let project ="sin/sinoory_2fv8"


project = JSON.parse(fs.readFileSync(downloadDir + "/projects/" + project, "utf8"));
let Q = [];
console.log(project.metadata.default_branch);
console.log(project.branches);
Q.push(project.branches[project.metadata.default_branch]);
let totalCommits = 0;
let studyCommits = 0;
let languageCommits = 0;
let mergeCommits = 0;
let visited = {}

function isLanguageFile(filename) {
    return filename.endsWith(".h") || filename.endsWith(".c") || filename.endsWith(".cpp") || filename.endsWith(".cc");
}


while (Q.length > 0) {
    let commit = Q.shift();
    if (visited[commit] !== undefined)
        continue;
    visited[commit] = true;
    ++totalCommits;
    commit = JSON.parse(fs.readFileSync(downloadDir + "/commits/" + commit.substr(0,2) + "/" + commit.substr(2,2) + "/" + commit.substr(4)));
    // add parents
    for (let p of commit.parents)
        Q.push(p);
    if (commit.info.date > 1389916800)
        continue;
    if (commit.parents.length > 1) {
        ++mergeCommits;
        continue;
    }
    ++studyCommits;
    let isLanguageCommit = false;
    for (let f of commit.files)
        if (isLanguageFile(f.path)) {
            isLanguageCommit = true;
            break;
        }
    if (isLanguageCommit)
        ++languageCommits;
    console.log(totalCommits + " -- " + languageCommits);
}

console.log("project name:     " + project.metadata.full_name);
console.log("total commits:    " + totalCommits);
console.log("merge commits:    " + mergeCommits);
console.log("study commits:    " + studyCommits);
console.log("language commits: " + languageCommits);

