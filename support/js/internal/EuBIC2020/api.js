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


/// 2020-01-15 CP/TK
function transform2scope(a){

	try {
		let intensitiesmax = Math.max(...a['ions'].map(x => x.intensity))

			scope = {
x: a['ions'].map(x => x.mz),
   intensities: a['ions'].map(x => x.intensity),
   percentBasePeak : a['ions'].map(x => (100 * (x.intensity / intensitiesmax))),
   massError: a['ions'].map(x => 'NA'),
   colors: a['ions'].map(x => '#000000'),
   labels: a['ions'].map(x => x.ion + x.number),
   labelCharges: a['ions'].map(x => x.charge),
   neutralLosses: [],
   widths: [],
   sequence: a['sequence']
			}

		return scope;
	} catch(err) {
		scope = {
x: [],
   intensities: [],
   massError: [],
   colors: [],
   labels: [],
   labelCharges: [],
   neutralLosses: [],
   widths: [],
   sequence: []
		}
		return scope;
	}

}


