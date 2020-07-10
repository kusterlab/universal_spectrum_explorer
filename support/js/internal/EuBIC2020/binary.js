// EXAMPLE BINNED SPECTRA
//
//

var exports = {};

var groupBy = function(data, key) { // `data` is an array of objects, `key` is the key (or property accessor) to group by
	// reduce runs this anonymous function on each element of `data` (the `item` parameter,
	//   // returning the `storage` parameter at the end
	return data.reduce(function(storage, item) {
		//         // get the first instance of the key by which we're grouping
		var group = item[key];
		//
		//                     // set `storage` for this instance of group to the outer scope (if not empty) or initialize it
		storage[group] = storage[group] || [];
		//
		//                                 // add this item to its group within `storage`
		storage[group].push(item);
		//
		//                                             // return the updated storage to the reduce function, which will then loop through the next
		return storage;
	}, {}); // {} is the initial value of the storage
}


// [{"mz": v1, "intensity": v2}, ...]
// TODO needs a sorted array
var binarySearch = function(arr,target){
	var midpoint = Math.floor(arr.length/2);

	if (arr[midpoint] === target){
		return arr[midpoint];
	}
	if (arr.length === 1){
		return arr[0];
	}

	if (arr[midpoint] > target){
		return binarySearch(arr.slice(0,midpoint),target);
	}else if (arr[midpoint] < target){
		return binarySearch(arr.slice(midpoint),target);
	}
}

var full_merge = function(spec1_spec2, spec2_spec1){
	// first swap labels
	spec2_spec1 = spec2_spec1.map(function(peakObj){
		return {
			id_1: peakObj["id_2"],
			id_2: peakObj["id_1"],
			mz_1: peakObj["mz_2"],
			mz_2: peakObj["mz_1"],
			intensity_1: peakObj["intensity_2"],
			intensity_2: peakObj["intensity_1"],
		}
	});
	var mergedSpectrum = spec1_spec2.concat(spec2_spec1);

	mergedSpectrum = mergedSpectrum.map(function(peakObj){
		return {

			id_1: peakObj["id_1"],
			intensity_1: peakObj["intensity_1"],
			mz_1: peakObj["mz_1"],
			id_2: peakObj["id_2"],
			intensity_2: peakObj["intensity_2"],
			mz_2: peakObj["mz_2"],
			id: peakObj["id_1"] + "_" + peakObj["id_2"]
		}
	});
	var non_duplicated_merged_spectrum = _.uniqBy(mergedSpectrum, 'id');


	var splice_non_matched = non_duplicated_merged_spectrum.filter(function(x){
		return (x["id_1"]===-1) || (x["id_2"] ===-1)

	});
	var splice_matched = non_duplicated_merged_spectrum.filter(function(x){
		return (x["id_1"]!==-1) && (x["id_2"] !==-1)

	});

	var spliced_matched_add = _.uniqBy(splice_matched.map(function(peakObj){
		return {
			id_1: peakObj["id_1"],
			intensity_1: peakObj["intensity_1"],
			mz_1: peakObj["mz_1"],
			id_2: -1,
			intensity_2: 0,
			mz_2: -1,

		}
	}), "id_1");
	var spliced_matched_add2 = _.uniqBy(splice_matched.map(function(peakObj){
		return {
			id_2: peakObj["id_2"],
			intensity_2: peakObj["intensity_2"],
			mz_2: peakObj["mz_2"],
			id_1: -1,
			intensity_1: 0,
			mz_1: -1,

		}
	}), "id_2");
	splice_non_matched = spliced_matched_add
		.concat(spliced_matched_add2)
		.concat(splice_non_matched);



	// remove the -1 stuff for external
	var non_duplicated_merged_spectrum_without_non_matching = splice_matched;


	var grp1 = groupBy(non_duplicated_merged_spectrum_without_non_matching, "id_1")
	// with entries -> every entry is a array
	grp1 = Object.values(grp1).map(function(objPeak){
		return objPeak.reduce(function(prev, current){
			return prev.intensity_1 + prev.intensity_2 > current.intensity_1 + current.intensity_2? prev: current
		},{})

	});
	var grp2 = groupBy(grp1, "id_2")
	grp2 = Object.values(grp2).map(function(objPeak){
		return objPeak.reduce(function(prev, current){
			return prev.intensity_1 + prev.intensity_2 > current.intensity_1 + current.intensity_2? prev: current
		},{})

	});


	grp2 = grp2.concat(splice_non_matched);


	grp1 = groupBy(grp2, "id_1")
	// return grp1["5"];
	// with entries -> every entry is a array
	grp1 = Object.values(grp1).map(function(objPeak){
		if (objPeak[0].id_1 === -1) {
			return objPeak;
		}
		return objPeak.reduce(function(prev, current){
			return prev.id_2 > current.id_2? prev: current
		},{})

	});
	grp2 = groupBy([].concat(...grp1), "id_2")
	grp2 = Object.values(grp2).map(function(objPeak){
		if (objPeak[0].id_2 === -1) {
			return objPeak;
		}
		return objPeak.reduce(function(prev, current){
			return prev.id_1 > current.id_1? prev: current
		},{})

	});

	var arr = [].concat(...grp2) 
		.map(function(peakObj){
			return{

				id_1: peakObj["id_1"],
				intensity_1: peakObj["intensity_1"],
				mz_1: peakObj["mz_1"],
				id_2: peakObj["id_2"],
				intensity_2: peakObj["intensity_2"],
				mz_2: peakObj["mz_2"]
			}
		});

	return arr.filter((v,i,a)=>a.findIndex(t=>(t.id_1 === v.id_1 && t.id_2===v.id_2))===i);

	// I am very sorry :(
	// TODO: simplify to oneliner

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

var getClosestValues_specF = function(property){
	return function(a, x) {
		var lo = -1, hi = a.length;
		while (hi - lo > 1) {
			var mid = Math.round((lo + hi)/2);
			if (a[mid][property] <= x) {
				lo = mid;
			} else {
				hi = mid;
			}
		}
		if (a[lo] == x) hi = lo;
		return [a[lo], a[hi]];
	}
}
// x is a m/z value
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

var getClosestValues_spec2_FACTORY = function(selection){
	return function(a, x){

		/*
		 * ppm part
		 */
		f = getClosestValues_specF(selection)
		return	f(a, x)
			.filter(x=>{return x!==undefined})
			.reduce((prev, next)=>{return Math.abs(prev[selection]-x)<Math.abs(next[selection]-x)?prev: next },0) 
	}
} 



var selectMostIntensePeak = function(mergedSpectrum){
	return mergedSpectrum.map(function(peakObj){
		if (peakObj["id_1"].length ===0){
			var mostIntense	= {
				mz: -1,
				intensity: 0,
				id: -1,
			}
		}else{
			var mostIntense = peakObj["id_1"].map(function(id, i){
				return{
					mz: peakObj["mz_1"][i],
					intensity: peakObj["intensity_1"][i],
					id: peakObj["id_1"][i],
				}
			}).reduce(function(prev, current){
				return prev.intensity > current.intensity? prev: current
			})
		}
		return {
			id_1: mostIntense["id"],
			intensity_1: mostIntense["intensity"],
			mz_1: mostIntense["mz"],
			id_2: peakObj["id_2"],
			intensity_2: peakObj["intensity_2"],
			mz_2: peakObj["mz_2"],
		}
	})
}

var getClosestValues_spec2 = getClosestValues_spec2_FACTORY("mz")

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

compare_ppm_FACTORY = function(property){
	return function(peak1, peak2, ppm){
		// asking if peak2 is close to peak1
		error = 1 / Math.pow(10, 6) * ppm * peak1[property]
		return(peak2["mz"] < peak1[property] + error && peak2["mz"] > peak1[property] - error)
	}
}

exports.compare_ppm = compare_ppm_FACTORY("mz")
exports.my_sorter = my_sorter

var generate_searchF = function(spectrum){
	return function(peak){
		getClosestValues_spec2F = getClosestValues_spec2_FACTORY("mz_2")
		a = getClosestValues_spec2F(spectrum, peak["mz"])
		compare_ppmF = compare_ppm_FACTORY("mz_2");
		is_inside = compare_ppmF(a, peak, 10) //TODO correct here?
		if(is_inside){
			a["intensity_1"].push(peak["intensity"])
			a["mz_1"].push(peak["mz"])
			a["id_1"].push(peak["id"])
			return true;
		}
		return false;

		//		return true;
		//	return false;
	}
}
var add_exp_flag = function(peak){
	peak["intensity_2"] = 0
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
var binary_search_spectrum = function(spectrum_1, spectrum_2 ){

	var sorter_asc_mz = my_sorter('mz', 'asc');
	spectrum_2 = spectrum_2.sort(sorter_asc_mz);
	spectrum_2 = spectrum_2.map(function(peak, i){
		return {
			intensity_2: peak.intensity,
			mz_2: peak.mz,
			id_2: i,
			id_1: [],
			mz_1: [],
			intensity_1: [],
		}
	});

	var sorter_asc_intensity = my_sorter('intensity', 'asc');
	spectrum_1 = spectrum_1.sort(sorter_asc_mz);
	spectrum_1 = spectrum_1.map(function(peak, i){
		return {
			id: i,
			mz: peak.mz,
			intensity: peak.intensity
		}
	});

	var f_peak = generate_searchF(spectrum_2);
	spectrum_1.map(f_peak);
	return(spectrum_2);
}


var binary_full_merge = function(spectrum_1, spectrum_2){
	merge1 = binary_search_spectrum(spectrum_1, spectrum_2);
	merge2 = binary_search_spectrum(spectrum_2, spectrum_1);
	to_add_1 = merge2.intensity_1.filter((x,i) => x===0);
	to_add_2 = merge2.intensity_2.filter((x,i) => merge2.intensity_1[i]===0);
	merge1.intensity_1 = merge1.intensity_1.concat(to_add_2);
	merge1.intensity_2 = merge1.intensity_2.concat(to_add_1);
	return(merge1);
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
exports.selectMostIntensePeak = selectMostIntensePeak
exports.groupBy = groupBy
exports.full_merge = full_merge
