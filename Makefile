# default build just executes the artifact & paper build steps
all: paper
# cleans any of the generated data (including the extracted original artifact data)
.PHONY: clean
clean:
	rm -rf *~ paper/*.bbl paper/*.blg paper/*.dvi paper/*.aux paper/*.log  paper/*.out *.html
	rm -rf original/sqlDump
	rm -rf original/R_code
	rm -rf artifact
# builds only the artifact without trying to create the paper
.PHONY: artifact
artifact: R_LIBS_USER=./.R
artifact:
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("original_artifact.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("repetition.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("re-analysis.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("permutations.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("missing_commits.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("commit_survey.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("threats_to_validity.Rmd", "html_document")'
# builds the paper
.PHONY: paper
paper: artifact
	cd paper && pdflatex main && bibtex main && pdflatex main && pdflatex main
# installs necessary dependencies for building the artifact
.PHONY: setup
setup: R_LIBS_USER=./.R
setup:
    sudo apt install git-lfs
    git checkout -f HEAD
    sudo apt install r-base libcurl14-openssl-dev pandoc tcsh
    mkdir .R
    Rscript setup_r.R
# installs necessary dependenciesfor building the artifact and the paper (i.e. the entirety of tex) 
.PHONY: setup_tex
setup_tex: setup
    sudo apt install texlive-full
# on top of all dependencies for the artifact and paper also installs rstudio so that the notebooks can be viewed
.PHONY: setup_rstudio
setup_rstudio: setup_tex
    sudo apt install gdebi
    wget https://https://download1.rstudio.org/desktop/bionic/amd64/rstudio-1.2.1335-amd64.deb
    sudo gdebi rstudio-1.2.1335-amd64.deb
# installs and builds completely everything
.PHONY: full
full: setup_rstudio paper


