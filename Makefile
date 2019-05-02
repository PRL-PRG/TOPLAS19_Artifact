all:
	echo "Building the 
clean:
	rm -rf *~ *.bbl *.blg *.dvi *.aux *.log  *.out *.html
	rm -rf original/sqlDump
	rm -rf original/R_code
	rm -rf artifact
artifact:
	echo "Preparig the orginal artifact"
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("orginal_arifact.Rmd", "html_document")'
	echo "Repetition of the original paper"
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("repetion.Rmd", "html_document")'
	echo "Re-analysis of the first research question"
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("re-analysis.Rmd", "html_document")'
	echo "Selected filtering and methods flas"
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("permutations.Rmd", "html_document")'
	echo "Commits missng from the original paper"
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("missing_commits.Rmd", "html_document")'
	echo "Commit cassifiation survey"
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("commit_survey.Rmd", "html_document")'
	echo "Threats to validity evidence"
	Rscript --vanilla -e 'library(rmarkdown); rmarkdown::render("threats_to_validity.Rmd", "html_document")'
paper:
	echo "Building the paper"
	
	
	

