// Nyborg, DK, 2020-01-14 1800 Tobi, Leon, CP 
// TODO: docu

function queryProtDBGet(peptideseq="SCTLFPQNPNLPPPSTRER", charge="3"){
	let url = "https://www.proteomicsdb.org/logic/api/getReferenceSpectrum.xsjs?sequence=" + peptideseq + "&mods=Carbamidomethyl@C2&charge=" + charge


		console.log("charge = " + charge)
		console.log("peptide = " + peptideseq)

		return d3.json(url, function(data) {console.log(data)})
}


function queryProtDBPOst(){
	url = "https://www.proteomicsdb.org/logic/api/getFragmentationPrediction.xsjs"

		query = {"sequence": ["TDLHAFENLEIIR", "TDLHAFENLEIIR", "VTSGSTSTSR", "LASVSVSR", "YVYVADVAAK"], "charge": [2, 3, 2, 2, 2], "ce": [25, 30, 30, 30, 30]}

	return d3.json(url, {method: "POST", body: JSON.stringify(query)})
}

