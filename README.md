# A Large-Scale Study of Programming Languages and Code Quality in GitHub: A Reproducibility Study

This repository contains the artifact and the paper.

## Artifact Overview

`.` 

The root directory contains this readme, the makefile and R notebooks and implementation files in R which take the input data and produce the numbers, tables and figures for the paper. 

`paper`

Contains the LaTEX source code of the TOPLAS paper. The paper pdf is generated as part of the artifact since the artifact generatres the numbers, tables and figures used in the paper.

`original`

Contains the compressed artifact of the original paper as it was obtained. 

`tools`

Contains tools we have used to re-gather the projects mentioned in the original paper for a thorough analysis and the code for the webapp for the survey asking developers to classify commits as buggy vs non-buggy.

> While the complete source code is provided, these tools are not executed as part of the artifact due to their non-deterministic nature (github projects may be taken down, etc.). Complete dump of the data we have downloaded from the github is too large to be included as part of the artifact, but can be downloaded from [our servers](http://violet.ele.fit.cvut.cz/TOPLAS19/inputData). It contains downloaded commits and file snapshots for the projects we have matched which were later used for the language classification and missing commits analysis.

`input_data`

Contains the aggregated data obtained from the above mentioned tools.

## Running the artifact

> The artifact has been tested on Ubuntu 17.10, i7-7700, 64GB RAM and 1TB NVMe disk. THe following steps are necessary  





The artifact can be executed by invoking the `make` command from its root dir. Make then executes the markdown files which in turn load the input data, perform the analyses and produce all the tables, graphs and numbers used in the paper. Brief description of the notebooks and the order in which they are executed follows:

- building the original artifact (`original_artifact.Rmd`)
- repetition of the original experiment (`repetition.Rmd`)
- re-analysis (our effort for a deeper analysis of the first research question from the original paper in terms of both data and methods) (`re-analysis.Rmd`)
- permutations of varius methods & dat filters from the re-nalysis to detemin their effect (`permutations.Rmd`)
- analysis of the missing commits (`missing_commits.Rmd`)
- survey about commit classification as bugfixes or not (`commit_survey.Rmd`)
- evidence for threats to validity (`threats_to_validty.Rmd`)

When the markdows have executed, `make` generates the paper's pdf. 













This is the artifact for our paper titled "A Large-Scale Study of Programming Languages and Code Quality in GitHub: A Reproducibility Study". The artifact is organized into several R notebooks, the paper itself and input data and extra tools.

## TL;DR;

All of these steps can be executed manually, or single shell file, `runall.sh` can be executed which runs the required steps in the correct order automatically. It takes one argument, which is the number of permutations it may execute at once, we recommend a value RAM/16. 

## R Notebooks and Scripts

The bulk of the artifact is generated from R notebooks, which contain R code and textual explanations in a single file, which when executed executes the R code producing the graphs and data. Best way to view the notebooks is to use RStudio, where you can open then and execute a notebook all at one (`Ctrl+Alt+R`), or step by step (`Ctrl+Shift+Enter`). The following steps should be done in the following order to generate everything that is required for the paper. If they are executed from within RStudio, the environment should be cleaned after each notebook:

### `repetition.Rmd`

This notebook contains a summary of our efforts to repeat the analysis in the original paper. 

### `re-analysis.Rmd`

This notebook contains a summary of our affort for a deeper analysis of the first research question of the original paper both in terms of data and methods. 

### `runall-permutations.sh`

This shell file should be executed to produce all possible permutations of our cleaning and methodology steps, which can later be analyzed. The script takes single argument, which is number of permutations it may try in parallel for increased speed. We recommend at least 16GB to run this:

    bash runall-permutations.sh 
    
### `permutations.Rmd`

This file analyzes the previously executed permutations and generates the summary table for the paper. 

### `threats-to-validity.Rmd`

This file provides evidence for some of the threats to validity to the paper, namely the inclusion of tests. 

### `missing-commits.Rmd` 

This file contains information on our analysis of commits missing from the paper and produces the relevant graphs for the paper. 

### `check-survey.Rmd`

Contains the analysis of the results of our survey to determine the precission of labelling buggy commits. 

## Building the paper

For this, we simply provide a makefile, so running `make` is enough. Of course, latex must be installed and configured properly. 

## Extra folders

- `original-artifact` contains the original artifact we have obtained from the authors of the reviewer paper. Due to space limitations on anonymous dropbox account for the double blind review we are only including the data parts of the original artifact that our repetition uses. The full artifact will of course include the full copy of the original artifact. 
- `missing-commits-input` contains the source code for our tool to analyze missing commits and its raw outputs
- `commit_survey` contains the raw results of the survey we gave to professional developers to determine accuracy of the buggy commits classifier
- `commit_survey_extras` contains extra developers who were backup and did not finish
- `commit_survey_app` contains code for the webapplication the developers used to interact with when classifying the commits
- `Pictures` contains pictures used in the paper

