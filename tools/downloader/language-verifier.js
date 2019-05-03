const fs = require("fs")
const csv_parser = require("csv-parse")
const child_process = require("child_process")

/** Takes a file and tokenizes it, stripping comments along the way
 */
function Tokenize(filename) {
    let words = fs.readFileSync(filename).replace(/\n/g, " ").split(" ")
    
    
}

let outputCSV = true;

function LOG(what) {
    if (! outputCSV)
        console.log(what);
}

function CSV(what) {
    if (outputCSV)
        console.log(what);
}



/** Determines if the given filename contains a C or C++ code.

    The bias is that if the function returns true, the code is *most* likely not C, but C++.

    Patterns:

    class name {
    class name :
//    virtual
    private:
    public:
    protected:
    using namespace
    namespace name {
*/
function IsCpp(filename) {
    // get the words
    let words = fs.readFileSync(filename, "utf8").replace(/\n/g, " ").split(" ")
    // look for c++ patterns
    let patterns = 0
    let i = 0
    while (i < words.length) {
        if (words[i] === "class" && words[i + 2] === "{") {
            i += 3;
            ++patterns
        } else if (words[i] === "class" && words[i + 2] === ":") {
            i += 3;
            ++patterns
        } else if (words[i] === "private" && words[i + 1] === ':') {
            i += 2;
            ++patterns
        } else if (words[i] === "public" && words[i + 1] === ":" ) {
            i += 2;
            ++patterns;
        } else if (words[i] === "protected" && words[i + 1] === ":") {
            i += 2;
            ++patterns;
        } else if (words[i] === "using" && words[i + 1] === "namespace") {
            i += 2
            ++patterns
        } else if (words[i] === "using" && words[i + 2] === "{}") {
            i += 3
            ++patterns
        } else if (words[i] === "::") {
            i += 1;
            ++patterns
        } else {
            ++i
        }
    }
    return patterns
}

function Linguist(filename, expected, ext) {
    try {
        child_process.execSync("cp " + filename + " ./test." + ext)
        let x = child_process.execSync("linguist ./test." + ext , { encoding : "utf8" })
        fs.unlink("test." + ext)
        x = x.split("\n")[3].split(":")[1].trim()
        if (x !== expected)
            console.log(x);
        return x == expected
    } catch (e) {
        fs.unlink("test." + ext)
        console.log(e)
        return false
    }
}

function CheckFiles(filename, callback) {
    let parser = csv_parser();
    let total = 0;
    let errors = 0;
    LOG("Loading commits...")
    parser.on("readable", () => {
        while (record = parser.read()) {
            let path = record[0]
            let ext = record[1]
            if (ext == "ts") {
                ++total;
                if (! Linguist(path, "TypeScript", "ts")) {
                    ++errors;
                    console.log(path)
                }
                if (total % 100 == 0)
                    console.log(total + " / " + errors);
            }
        }
    });
    parser.on("finish", () => {
        console.log("Total header files: " + total);
        console.log("CPP headers:        " + errors)
        callback(null);
    });
    let istream = fs.createReadStream(filename);
    istream.pipe(parser);
}



CheckFiles("snapshots.txt", (err) => {
    console.log("KTHXBYE");
    process.exit();
})



