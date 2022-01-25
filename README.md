# Welcome to USE (Universal Spectrum Explorer)
![Example plot](/example.png)

The Universal Spectrum Explorer (USE) is a web-based tool for cross-resource (peptide) spectrum visualization and comparison (https://www.proteomicsdb.org/use/) based on the Interactive Peptide Spectrum Annotator ([IPSA](https://github.com/coongroup/IPSA)).


## How to deploy for development

1. Package everything in a zip file with `zip_build.sh`. 
2. Go to `http://tps.proteomicsdb.in.tum.de/sap/hana/ide/editor/` and create a new package (e.g. `use`)
3. Copy the `.xsaccess` and `.xsapp` files from a different package
4. Change `.xsaccess` such that the `support` folder and `UniversalSpectrumExplorer.html` are accessible.
5. Update the `.xsaccess` file in `proteomicsdb/logic/api/` to match that of Q01 in order to allow cross origin access (CORS).
6. Update `proteomicsdb/logic/api/getFragmentationPrediction.xsjs` to match that of Q01.
7. Change the url in `support/js/internal/controller.js` for Prosit.

