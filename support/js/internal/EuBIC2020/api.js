// Nyborg, DK, 2020-01-14 1800 Tobi, Leon, CP 
// TODO: docu

function queryProtDBGet(peptideseq="SCTLFPQNPNLPPPSTRER", charge="3"){
	let url = "https://www.proteomicsdb.org/logic/api/getReferenceSpectrum.xsjs?sequence=" + peptideseq + "&mods=Carbamidomethyl@C2&charge=" + charge
	return d3.json(url, function(data) {console.log(data)})
}


function queryProteomicsDbPost(peptideSequence = ["LASVSVSR"], charge = [2], ce = [30]){
	let url = "https://www.proteomicsdb.org/logic/api/getFragmentationPrediction.xsjs";

	//query = {"sequence": ["TDLHAFENLEIIR", "TDLHAFENLEIIR", "VTSGSTSTSR", "LASVSVSR", "YVYVADVAAK"], "charge": [2, 3, 2, 2, 2], "ce": [25, 30, 30, 30, 30]}
	query = {"sequence": peptideSequence, "charge": charge, "ce": ce}

	return d3.json(url, {method: "POST", body: JSON.stringify(query)})
}


/// input: output from proteomicsDB a  and a colormap cm
/// returns a peaklist readable by IPSA from a proteomicsDB given input
/// history: 2020-01-15, 2020-01-16 CP/TK/P
function transform2scope(a, cm = { 'b': "#0d75bc", 'c': '#07a14a', 'y': '#be202d', 'z': '#000000'}){


	try {
		let intensitiesmax = Math.max(...a['ions'].map(x => x.intensity))

			scope = {
x: a['ions'].map(x => x.mz),
   intensities: a['ions'].map(x => x.intensity),
   percentBasePeak : a['ions'].map(x => (100 * (x.intensity / intensitiesmax))),
   massError: a['ions'].map(x => 'NA'),
   colors: a['ions'].map(x => cm[x.ion]),
   labels: a['ions'].map(x => x.ion + x.number),
   labelCharges: a['ions'].map(x => x.charge),
   neutralLosses: [],
   widths: a['ions'].map(x => 2),
   sequence: a['sequence']
			}

console.log(scope)
		return scope;
	} catch(err) {
		console.log("ERROR: " + err)
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

function getClosestCESpectrum(spectra, ice) {
	var closestCE = spectra
				.map(x => {return {ce: x.collissionEnergy, dist: Math.abs(x.collissionEnergy - ice)}})
				.reduce( (p,n) => { if (p.dist > n.dist) {
										return n
									} else {
										return p
									}
								}, {ce: -1000, dist: 1000});
	var spectrum = spectra.filter(x => {return x.collissionEnergy === closestCE.ce});
	return spectrum[0];
}



