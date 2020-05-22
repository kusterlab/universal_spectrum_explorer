// [{"mz": v1, "intensity": v2}, ...]
// TODO needs a sorted array
//
var exports = {}

var binarySearch = function(arr,target){
	var midpoint = Math.floor(arr.length/2);

	if (arr[midpoint] === target){
		return arr[midpoint];
	}
	if (arr.length === 1){
		return arr[0];
	}

	if (arr[midpoint] > target){
		console.log(arr.slice(0, midpoint));
		return binarySearch(arr.slice(0,midpoint),target);
	}else if (arr[midpoint] < target){
		console.log(arr.slice(midpoint));
		return binarySearch(arr.slice(midpoint),target);
	}
}

var getClosestValues = function(a, x) {
	var lo = -1, hi = a.length;
	while (hi - lo > 1) {
		var mid = Math.round((lo + hi)/2);
		if (a[mid] <= x) {
			lo = mid;
		} else {
			hi = mid;
		}
	}
	if (a[lo] == x) hi = lo;
	return [a[lo], a[hi]];
}

var getClosestValues_spec = function(a, x) {
	var lo = -1, hi = a.length;
	while (hi - lo > 1) {
		var mid = Math.round((lo + hi)/2);
		if (a[mid]["mz"] <= x) {
			lo = mid;
		} else {
			hi = mid;
		}
	}
	if (a[lo] == x) hi = lo;
	return [a[lo], a[hi]];
}

var getClosestValues_spec2 = function(a, x){
	/*
	 * ppm part
	 */
	return	getClosestValues_spec(a, x)
			.filter(x=>{return x!==undefined})
			.reduce((prev, next)=>{return Math.abs(prev["mz"]-x)<Math.abs(next["mz"]-x)?prev: next },0) 
}

var binarySearch_spec = function(arr,target){
	var midpoint = Math.floor(arr.length/2);

	if (arr[midpoint]["mz"] == target){
		return arr[midpoint];
	}
	if (arr.length == 1){
		return arr[0];
	}

	if (arr[midpoint]["mz"] > target){
		return binarySearch_spec(arr.slice(0,midpoint),target);
	}else if (arr[midpoint]["mz"] < target){
		return binarySearch_spec(arr.slice(midpoint),target);
	}
}

var my_sorter = function(attribute, type){ 
	return function(peak1, peak2){
		if (peak1[attribute] > peak2[attribute]) {
			return type==="asc"?1:-1;
		}
		if (peak2[attribute] > peak1[attribute]) {
			return type==="asc"?-1:1;
		}
		return 0;
	}
}



/*
 *peak 1 is always reference (we assume the bottom/predicted one
 * checking for smaller or greater not equal case
 */
exports.compare_ppm = function(peak1, peak2, ppm){
	// asking if peak2 is close to peak1
	error = 1 / Math.pow(10, 6) * ppm * peak1["mz"]
	return(peak2["mz"] < peak1["mz"] + error && peak2["mz"] > peak1["mz"] - error)
}
exports.my_sorter = my_sorter

var generate_searchF = function(spectrum){
	return function(peak){
		a = getClosestValues_spec2(spectrum, peak["mz"])
		is_inside = exports.compare_ppm(a, peak, 10) //TODO correct here?
		if(is_inside){
			a["exp_intensity"] = peak["intensity"]
			return true;
		}
		return false;
	}
}
var add_exp_flag = function(peak){
	peak["exp_intensity"] = 0
	return(peak)
}
var extract_mzs = function(prev, peak){
	prev["intensity_1"].push( peak["exp_intensity"])
	prev["intensity_2"].push(  peak["intensity"])
	return(prev)
}


/**
 * solves question of specrum_2 is how much part of 1
 */
var binary_search_spectrum = function(check_spectrum, ref_spectrum ){

	var sorter_asc_mz = my_sorter('mz', 'asc');
	ref_spectrum = ref_spectrum.sort(sorter_asc_mz);

	var sorter_asc_intensity = my_sorter('intensity', 'asc');
	check_spectrum = check_spectrum.sort(sorter_asc_mz);

	ref_spectrum = ref_spectrum.map(add_exp_flag);
	var f_peak = generate_searchF(ref_spectrum);

	check_spectrum.map(f_peak);
	return ref_spectrum.reduce(extract_mzs, { intensity_1: [], intensity_2: [] });
}
var binary_full_merge = function(check_spectrum, ref_spectrum){
	merge1 = binary_search_spectrum(check_spectrum, ref_spectrum);
	merge2 = binary_search_spectrum(ref_spectrum, check_spectrum);
	to_add_1 = merge2.intensity_1.filter((x,i) => x===0);
	to_add_2 = merge2.intensity_2.filter((x,i) => merge2.intensity_1[i]===0);
	merge1.intensity_1 = merge1.intensity_1.concat(to_add_2);
	merge1.intensity_2 = merge1.intensity_2.concat(to_add_1);
	return(merge1);
}

var create_post_body_for_prediction = function(aSequence, iCharge, dCe, aMods){
	var postbody = {"sequence": [], "charge": [], "ce": [], "mods":[]};
	function reducer(total, el, i){
				total["sequence"].push(el);
				total["charge"].push(iCharge);
				total["ce"].push(dCe);
				total["mods"].push(aMods[i]);
				return total;
			}
	return aSequence.reduce(reducer, postbody);
}

exports.generate_searchF = generate_searchF
exports.add_exp_flag = add_exp_flag
exports.extract_mzs = extract_mzs 
exports.binary_search_spectrum = binary_search_spectrum
exports.binarySearch_spec = binarySearch_spec
exports.binarySearch = binarySearch
exports.getClosestValues = getClosestValues
exports.getClosestValues_spec = getClosestValues_spec
exports.getClosestValues_spec2 = getClosestValues_spec2
exports.binary_full_merge = binary_full_merge

