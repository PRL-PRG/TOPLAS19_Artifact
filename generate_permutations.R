library("knitr")
#library("dplyr")
library("rmarkdown")
#source("implementation.R")

# Function which moves the flags vector to new permutation in a way similar to binary increment. Returns the environment in which the notebook should be rendered, or NULL if all permutations were exhausted.
nextPermutation = function() {
    # construct the environment
    e = new.env()
    for (i in 1:length(flags))
        assign(names(flags)[[i]], flags[[i]], e)
    # increment flags
    i = 1
    while (i <= length(flags)) {
        flags[[i]] <<- ! flags[[i]]
        if (flags[[i]] == T)
            return(e)
        i = i + 1
    } 
    flags <<- NULL
    e
}



# array of the flags for permutation
flags = c(
    REMOVE_DUPLICATES = 0, 
    REMOVE_TYPESCRIPT = 0,
    REMOVE_V8 = 0,
    USE_AUTHORS_INSTEAD_COMMITTERS = 0,
    UNCERTAINTY = 0
)

whitelist = c("00000", "11111")

permutations = 0
fails = 0
id = -1
# now just loop over all permutations of the flags
while (!is.null(flags)) {
    ident = paste(as.integer(flags), collapse = "")
    knitEnv = nextPermutation()
    if (!is.na(whitelist) && ! ident %in% whitelist)
        next()
    if (is.null(knitEnv))
        break()
    id = id + 1
    # knit the document
    cat(paste("Executing permutation ", ident, "...\n", sep = ""))
    permutations <<- permutations + 1
    tryCatch({
        WORKING_DIR <<- paste0("./artifact/permutations/", ident)
        assign("WORKING_DIR", paste0("./artifact/permutations/", ident), knitEnv)
        rmarkdown::render("./re-analysis.Rmd", "html_document", envir = knitEnv, quiet = F, output_file = paste0("./artifact/permutations/", ident, "/main.html"), output_dir = WORKING_DIR)        
        cat("    PASS\n")
    }, error = function(e) {
        fails <<- fails + 1
        print(e)
    })
}
cat("ALL DONE.\n")
cat(paste("permutations: ", permutations, "\n", sep = ""))
cat(paste("fails:        ", fails, "\n", sep = ""))
