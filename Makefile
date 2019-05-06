all: paper
	echo "Done"
.PHONY: clean
clean:
	echo "Cleaning all generated files..."
	rm -rf *~ paper/*.bbl paper/*.blg paper/*.dvi paper/*.aux paper/*.log  paper/*.out *.html
	rm -rf original/sqlDump
	rm -rf original/R_code
	rm -rf artifact
.PHONY: artifact
artifact:
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("original_artifact.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("repetition.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("re-analysis.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("permutations.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("missing_commits.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("commit_survey.Rmd", "html_document")'
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("threats_to_validity.Rmd", "html_document")'
.PHONY: paper
paper: artifact
	cd paper && pdflatex main && bibtex main && pdflatex main && pdflatex main
.PHONY: setup
setup:
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("system_setup.Rmd", "html_document")'

