# A Large-Scale Study of Programming Languages and Code Quality in GitHub: A Reproducibility Study

This repository contains both our paper and its accompanying artifact. 

## TL;DR;

The following commands build the whole artifact and the paper and open the paper in your system's default pdf viewer (assuming you have all prerequisites installed):

    make
    open paper/main.pdf
    
Please do read the rest of this readme to find out about the structure of the artifact and how to use it correctly.

## Artifact Overview

The artifact is structured in the following directories:

`.` 

The root directory contains this readme, the makefile and R notebooks and implementation files in R which take the input data and produce the numbers, tables and figures for the paper. 

`paper`

Contains the LaTEX source code of the TOPLAS paper. The paper pdf is generated as part of the artifact since the artifact generatres the numbers, tables and figures used in the paper. Pictures and diagrams not related to the data analysis are stored in `paper/Pictures` directory.

`original`

Contains the compressed artifact of the original paper as it was obtained. 

`tools`

Contains tools we have used to re-gather the projects mentioned in the original paper for a thorough analysis and the code for the webapp for the survey asking developers to classify commits as buggy vs non-buggy.

> While the complete source code is provided, these tools are not executed as part of the artifact due to their non-deterministic nature (github projects may be taken down, etc.). Complete dump of the data we have downloaded from the github is too large to be included as part of the artifact, but can be downloaded from [our servers](http://violet.ele.fit.cvut.cz/TOPLAS19/inputData). It contains downloaded commits and file snapshots for the projects we have matched which were later used for the language classification and missing commits analysis.

`input_data`

Contains the aggregated data obtained from the above mentioned tools. The following data is part of the artifact:

- `missing-commits.csv` contains the raw input of the missing commits analysis tool in `tools` folder
- `commit_survey` contains the raw results of the survey we gave to professional developers to determine accuracy of the buggy commits classifier
- `commit_survey_extras` contains extra developers who were backup and did not finish
- `petrs_commits` contains the analysis of the commits done by us for a previous version of the paper

## Running the artifact

> The artifact has been tested on Ubuntu 17.10, i7-7700, 64GB RAM and 1TB NVMe disk.

It assumes that R is installed and working properly. Other necessary setup steps are described in the `system_setup.Rmd` R notebook, which is not part of the build process itself, but can be invoked using:

    make setup
    
This should install the necessary system and R packages. 

The artifact can be executed by invoking the `make` command from its root dir. Make then executes the markdown files which in turn load the input data, perform the analyses and produce all the tables, graphs and numbers used in the paper. Brief description of the notebooks and the order in which they are executed follows:

- building the original artifact (`original_artifact.Rmd`)
- repetition of the original experiment (`repetition.Rmd`)
- re-analysis (our effort for a deeper analysis of the first research question from the original paper in terms of both data and methods) (`re-analysis.Rmd`)
- permutations of varius methods & dat filters from the re-nalysis to detemin their effect (`permutations.Rmd`)
- analysis of the missing commits (`missing_commits.Rmd`)
- survey about commit classification as bugfixes or not (`commit_survey.Rmd`)
- evidence for threats to validity (`threats_to_validty.Rmd`)

When the markdows have executed, `make` generates the paper's pdf in `paper/main.pdf`. The process also creates the `artifact` dir, in which respective markdowns output their results. These take form of either pregenerated TEX files & tables (such as TEX commands for putting numbers in the paper) and figures in their respective `Data` and `Figures` directories.
