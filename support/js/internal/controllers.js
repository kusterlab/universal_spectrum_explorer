angular.module("IPSA.spectrum.controller").controller("GraphCtrl", ["$scope", "$log", "$http", function($scope, $log, $http) {

  var populateMods = function() {
    var returnArray = [];
    for (var i = 0; i < 13; i++) {
      returnArray.push({
        site: i - 1,
        deltaElement: 0,
        deltaMass: 0
      });
    }
    return returnArray;
  }

  $scope.set = {
    saDist: {
      data: [ ]
    },
    plotData:
    {
      x: [ ],
      y: [ ],
      id: [ ],
      color: [ ],
      label: [ ],
      labelCharge: [ ],
      neutralLosses: [ ],
      barwidth: [ ],
      massError: [ ],
      theoMz: [ ],
      percentBasePeak: [ ],
      TIC: 0
    },
    score: {
      sa: 0.0,
      corr: 0.0
    },
    scoreTop: {
      sa: 0.0,
      corr: 0.0
    },
    scoreBottom: {
      sa: 0.0,
      corr: 0.0
    },
    plotDataBottom:
    {
      x: [ ],
      y: [ ],
      id: [ ],
      color: [ ],
      label: [ ],
      labelCharge: [ ],
      neutralLosses: [ ],
      barwidth: [ ],
      massError: [ ],
      theoMz: [ ],
      percentBasePeak: [ ],
      TIC: 0
    },
    peptideBottom:
    {
      sequence: "TESTPEPTIDE",
      usi: '',
      precursorMz: 609.77229,
      precursorCharge: $scope.peptideBottom.precursorCharge,
      mods: populateMods()
    },
    peptide:
    {
      sequence: "TESTPEPTIDE",
      usi: 'mzspec:PXD015890:20190213_Rucks_atm6.raw (F002091).mzid_20190213_Rucks_atm6.raw_(F002091).MGF:index:914:YLDGLTAER/2',
      precursorMz: 609.77229,
      precursorCharge: $scope.peptide.precursorCharge,
      mods: populateMods(),
      usiOriginTop: 'pride',
    },
    settingsBottom:
    {
      toleranceThreshold: 0,
      toleranceType: "",
      ionizationMode: ""
    },
    settings:
    {
      toleranceThreshold: 0,
      toleranceType: "",
      ionizationMode: ""
    },

  };


  $scope.n = 150;

  $scope.promiseTop = {
      resolved: new Promise((res,rej)=> {setTimeout((x) => {return(false)}, 1000*3600)})
  };


  $scope.promiseBottom = {
      resolved: new Promise((res,rej)=> {setTimeout((x) => {return(false)}, 1000*3600)})
  };

  $scope.min = 0;

  $scope.max = 100;

  $scope.randomize = function() {
    _.times(150, function(n) {
      var x = _.random(0, 2000);
      var y = _.random(0, 100);
      if (y < 1) {
        y = 1;
      }
      $scope.set.plotData.TIC += y;
      $scope.set.plotData.y.push(y);
      $scope.set.plotData.x.push(x);
      $scope.set.plotData.color.push("#A6A6A6");
      $scope.set.plotData.label.push("");
      $scope.set.plotData.labelCharge.push(0);
      $scope.set.plotData.neutralLosses.push("");
      $scope.set.plotData.barwidth.push(1);
      $scope.set.plotData.massError.push("");
      $scope.set.plotData.theoMz.push(0);
      $scope.set.plotData.percentBasePeak.push(100 * y/d3.max($scope.set.plotData.y));
    });
    $scope.set.plotData.x.sort(function(a, b){return a - b});
    $scope.set.settings.toleranceType = "ppm";
    $scope.set.settings.toleranceThreshold = 10;
    $scope.set.settings.ionizationMode = "+";
    $scope.set.plotDataBottom = Object.assign({}, $scope.set.plotData);

  };

  $scope.plotDataBottom = function(returnedData) {
    $scope.set.peptideBottom =
      {
        sequence: returnedData.sequence,
        precursorMz: returnedData.precursorMz,
        precursorCharge: $scope.peptideBottom.precursorCharge,
        mods: returnedData.modifications
      };

    $scope.set.settingsBottom =
      {
        toleranceThreshold: $scope.cutoffs.tolerance,
        toleranceType: $scope.cutoffs.toleranceType,
        ionizationMode: ""
      };

    if ($scope.peptideBottom.precursorCharge > 0) {
      $scope.set.settingsBottom.ionizationMode = "+";
    } else {
      $scope.set.settingsBottom.ionizationMode = "-";
    }

    $scope.set.plotDataBottom.x = [ ];
    $scope.set.plotDataBottom.y = [ ];
    $scope.set.plotDataBottom.color = [ ];
    $scope.set.plotDataBottom.label = [ ];
    $scope.set.plotDataBottom.labelCharge = [ ];
    $scope.set.plotDataBottom.neutralLosses = [ ];
    $scope.set.plotDataBottom.barwidth = [ ];
    $scope.set.plotDataBottom.massError = [ ];
    $scope.set.plotDataBottom.theoMz = [ ];
    $scope.set.plotDataBottom.percentBasePeak = [ ];
    $scope.set.plotDataBottom.TIC = 0;

    console.log(returnedData.peaks);
    returnedData.peaks.forEach(function(data, i) {
      $scope.set.plotDataBottom.x.push(data.mz);
      $scope.set.plotDataBottom.y.push(data.intensity);
      $scope.set.plotDataBottom.id.push(i);
      $scope.set.plotDataBottom.TIC += data.intensity;
      $scope.set.plotDataBottom.percentBasePeak.push(data.percentBasePeak);
      if (data.matchedFeatures.length == 0) {
        $scope.set.plotDataBottom.color.push($scope.colorArray[9]);
        $scope.set.plotDataBottom.label.push("");
        $scope.set.plotDataBottom.labelCharge.push(0);
        $scope.set.plotDataBottom.neutralLosses.push("");
        $scope.set.plotDataBottom.barwidth.push(1);
        $scope.set.plotDataBottom.massError.push("");
        $scope.set.plotDataBottom.theoMz.push(0);
      } else {
        var peakData = data.matchedFeatures[0];
        var fragment = peakData.feature;
        if (fragment.type == "a") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[0]);
        } else if (fragment.type == "b") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[1]);
        } else if (fragment.type == "c") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[2]);
        } else if (fragment.type == "C") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[3]);
        } else if (fragment.type == "x") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[4]);
        } else if (fragment.type == "y") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[5]);
        } else if (fragment.type == "z") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[6]);
        } else if (fragment.type == "Z") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[7]);
        } else if (fragment.type == "M") {
          $scope.set.plotDataBottom.color.push($scope.colorArray[8]);
        }

        if (fragment.neutralLoss == null) {
          $scope.set.plotDataBottom.neutralLosses.push("");
        } else {
          $scope.set.plotDataBottom.neutralLosses.push(fragment.neutralLoss);
        }

        $scope.set.plotDataBottom.labelCharge.push(fragment.charge);
        // two label types, precursor, or regular label w/wo neutral losses
        if (fragment.hasOwnProperty("isPrecursor")) {
          $scope.set.plotDataBottom.label.push("[" + fragment.type + fragment.number + "]");
        } else {
          $scope.set.plotDataBottom.label.push(fragment.type + fragment.number);
        }

        $scope.set.plotDataBottom.barwidth.push(3);
        $scope.set.plotDataBottom.massError.push(peakData.massError);
        $scope.set.plotDataBottom.theoMz.push(fragment.mz);
      }
    });

    //$log.log($scope.set);
  };
  $scope.plotData = function(returnedData, returnedError = [], returnedErrorX = [], intensityError=[], intensityErrorIdsTop=[], intensityErrorIdsBottom=[]) {
    $scope.set.peptide =
      {
        sequence: returnedData.sequence,
        precursorMz: returnedData.precursorMz,
        precursorCharge: $scope.peptide.precursorCharge,
        mods: returnedData.modifications
      };

    $scope.set.settings =
      {
        toleranceThreshold: $scope.cutoffs.tolerance,
        toleranceType: $scope.cutoffs.toleranceType,
        ionizationMode: ""
      };

    if ($scope.peptide.precursorCharge > 0) {
      $scope.set.settings.ionizationMode = "+";
    } else {
      $scope.set.settings.ionizationMode = "-";
    }

    $scope.set.plotData.x = [ ];
    $scope.set.plotData.y = [ ];
    $scope.set.plotData.color = [ ];
    $scope.set.plotData.label = [ ];
    $scope.set.plotData.labelCharge = [ ];
    $scope.set.plotData.neutralLosses = [ ];
    $scope.set.plotData.barwidth = [ ];
    $scope.set.plotData.massError = [ ];
    $scope.set.plotData.theoMz = [ ];
    $scope.set.plotData.percentBasePeak = [ ];
    $scope.set.plotData.TIC = 0;

    returnedData.peaks.forEach(function(data, i) {
      $scope.set.plotData.x.push(data.mz);
      $scope.set.plotData.y.push(data.intensity);
      $scope.set.plotData.id.push(i);
      $scope.set.plotData.TIC += data.intensity;
      $scope.set.plotData.percentBasePeak.push(data.percentBasePeak);
      if (data.matchedFeatures.length == 0) {
        $scope.set.plotData.color.push($scope.colorArray[9]);
        $scope.set.plotData.label.push("");
        $scope.set.plotData.labelCharge.push(0);
        $scope.set.plotData.neutralLosses.push("");
        $scope.set.plotData.barwidth.push(1);
        $scope.set.plotData.massError.push("");
        $scope.set.plotData.theoMz.push(0);
      } else {
        var peakData = data.matchedFeatures[0];
        var fragment = peakData.feature;
        if (fragment.type == "a") {
          $scope.set.plotData.color.push($scope.colorArray[0]);
        } else if (fragment.type == "b") {
          $scope.set.plotData.color.push($scope.colorArray[1]);
        } else if (fragment.type == "c") {
          $scope.set.plotData.color.push($scope.colorArray[2]);
        } else if (fragment.type == "C") {
          $scope.set.plotData.color.push($scope.colorArray[3]);
        } else if (fragment.type == "x") {
          $scope.set.plotData.color.push($scope.colorArray[4]);
        } else if (fragment.type == "y") {
          $scope.set.plotData.color.push($scope.colorArray[5]);
        } else if (fragment.type == "z") {
          $scope.set.plotData.color.push($scope.colorArray[6]);
        } else if (fragment.type == "Z") {
          $scope.set.plotData.color.push($scope.colorArray[7]);
        } else if (fragment.type == "M") {
          $scope.set.plotData.color.push($scope.colorArray[8]);
        }

        if (fragment.neutralLoss == null) {
          $scope.set.plotData.neutralLosses.push("");
        } else {
          $scope.set.plotData.neutralLosses.push(fragment.neutralLoss);
        }

        $scope.set.plotData.labelCharge.push(fragment.charge);
        // two label types, precursor, or regular label w/wo neutral losses
        if (fragment.hasOwnProperty("isPrecursor")) {
          $scope.set.plotData.label.push("[" + fragment.type + fragment.number + "]");
        } else {
          $scope.set.plotData.label.push(fragment.type + fragment.number);
        }

        $scope.set.plotData.barwidth.push(3);
        $scope.set.plotData.theoMz.push(fragment.mz);
      }
      $scope.set.plotData.massError = returnedError;
      $scope.set.plotData.massErrorX = returnedErrorX;
      $scope.set.plotData.intensityError = intensityError;
      $scope.set.plotData.intensityErrorIdsTop = intensityErrorIdsTop;
      $scope.set.plotData.intensityErrorIdsBottom = intensityErrorIdsBottom;

    });

    //$log.log($scope.set);
  };

  $scope.plotSaData = function(returnedData) {
    $scope.set.saDist.data = returnedData;
  }

  $scope.scoreTop = function(returnedData) {
    $scope.set.scoreTop = returnedData;
  }

  $scope.scoreBottom = function(returnedData) {
    $scope.set.scoreBottom = returnedData;
  }

  $scope.score = function(returnedData) {
    $scope.set.score = returnedData;
  }

  $scope.processReference = function(topSpectrum = true, auto = false) {
    $scope.busy.isProcessing = true;
    let modString = "";
    if(topSpectrum) {
      if ($scope.modObject.selectedMods != undefined) {
        $scope.modObject.selectedMods.sort((x,y) => {return x.index > y.index});
        $scope.modObject.selectedMods.forEach(function(mod) {
          if (modString != ""){
            modString +=",";
          }
          modString += mod.name + "@"+mod.site + (mod.index+1);
        });
      }
    } else {
      if ($scope.modObjectBottom.selectedMods != undefined) {
        $scope.modObjectBottom.selectedMods.sort((x,y) => {return x.index > y.index});
        $scope.modObjectBottom.selectedMods.forEach(function(mod) {
          if (modString != ""){
            modString +=",";
          }
          modString += mod.name + "@"+mod.site + (mod.index+1);
        });
      }
    }

    let ionColors = {
      a: $scope.checkModel.a.color,
      b: $scope.checkModel.b.color,
      c: $scope.checkModel.c.color,
      x: $scope.checkModel.x.color,
      y: $scope.checkModel.y.color,
      z: $scope.checkModel.z.color
    };

    let url = '';
    let query = {};
    let sApi = topSpectrum ? $scope.peptide.api : $scope.peptideBottom.api, 
      sSeq = topSpectrum ? $scope.peptide.sequence : $scope.peptideBottom.sequence,
      iPreCh =  topSpectrum ? $scope.peptide.precursorCharge : $scope.peptideBottom.precursorCharge,
      iCh = topSpectrum ? $scope.peptide.charge : $scope.peptideBottom.charge, 
      iCE = topSpectrum ? $scope.peptide.ce : $scope.peptideBottom.ce;
  
    var reference = topSpectrum ? $scope.promiseTop : $scope.promiseBottom;
    switch (sApi) {
      case 'Prosit':
        query = {"sequence": [sSeq], "charge": [iPreCh], "ce": [iCE], "mods" : [modString]};
        url = "https://www.proteomicsdb.org/logic/api/getFragmentationPrediction.xsjs";
        reference.resolved = $http.post(url, query)
          .then( function(response2) {
            let rv = response2.data[0]
            let maxFragmentIonCharge = iCh;
            rv['ions'] = rv['ions'].filter(x => x.charge <= maxFragmentIonCharge)
            if (topSpectrum) {
              $scope.db.items = rv['ions'].map(
                (x) => {
                  return {mZ: x.mz, intensity: x.intensity};
                }
              );
            } else {
              $scope.dbBottom.items = rv['ions'].map(
                (x) => {
                  return {mZ: x.mz, intensity: x.intensity};
                }
              );
            } 
            if (!auto){
              $scope.openModalConfirmation('The predicted Spectrum was successfully imported into Manual input. Click OK to redirect', topSpectrum);
            }
            $scope.busy.isProcessing = false;
            return (true);
          }, function(response2) {
            // if errors exist, alert user
            $scope.busy.isProcessing = false;
            alert("Prosit: " + response2.data.message);
            return(false);
          });
        break;
      case 'ProteomeTools':
        url = "https://www.proteomicsdb.org/logic/api/getReferenceSpectrum.xsjs?sequence=" + sSeq + "&charge=" + iPreCh + "&mods=" + modString;
        reference.resolved = $http.get(url, "")
          .then( function(response2) {
            var res2 = response2.data;
            var spec = getClosestCESpectrum(res2, parseInt(iCE, 10));
            if (topSpectrum) {
              $scope.peptide.ce = spec.collissionEnergy;
              $scope.db.items = spec.ions.map(
                (x) => {
                  return {mZ: x.mz, intensity: x.intensity};
                }
              );
            } else {
              $scope.peptideBottom.ce = spec.collissionEnergy;
              $scope.dbBottom.items = spec.ions.map(
                (x) => {
                  return {mZ: x.mz, intensity: x.intensity};
                }
              );
            }
            if (!auto) {
              $scope.openModalConfirmation('The reference Spectrum was successfully imported into Manual input. Click OK to redirect', topSpectrum);
            }
            $scope.busy.isProcessing = false;
            return(true);
          }, function(response2) {
            // if errors exist, alert user
            $scope.busy.isProcessing = false;
            alert("ProteomeTools: " + response2.data.message);
            return(false);
          });
        break;
      default: return;
    }
  }

  $scope.processUSI = function(topSpectrum = true, fillBothSequences = false, auto = false) {

    var aUrls = {
      pride: 'https://www.ebi.ac.uk/pride/ws/archive/v2/spectrum?usi=',
      peptideatlas: 'https://www.proteomicsdb.org/proxy_ppc/peptideAtlas?usi=',
      jpost: 'https://www.proteomicsdb.org/proxy_ppc/jPOST?usi=',
    };
    $scope.busy.isProcessing = true;
    var sUsi = topSpectrum ? $scope.peptide.usi : $scope.peptideBottom.usi;
    var reference = topSpectrum ? $scope.promiseTop : $scope.promiseBottom;
    console.log($scope.usiOriginTop);
    console.log($scope.peptide.usiOriginTop);
    var url = (topSpectrum ? aUrls[$scope.peptide.usiOriginTop] : aUrls[$scope.peptideBottom.usiOriginBottom]) + sUsi;
    var abc = $http.get(aUrls["jpost"] + "mzspec:PXD005175:CRC_iTRAQ_06:scan:11803:VEYTLGEESEAPGQR/3");
    var def = $http.get(aUrls["peptideatlas"] + "mzspec:PXD000561:Adult_Frontalcortex_bRP_Elite_85_f09:scan:17555:VLHPLEGAVVIIFK/2");
    usi = new UsiResponse(topSpectrum ? $scope.peptide.usiOriginTop : $scope.peptideBottom.usiOriginBottom);

  //  console.log(abc);
    reference.resolved = $http.get(url)
      .then( function(response) {
        console.log(response.data);
        usi.parseData(response.data);
        var mzs = usi.aMz;
        var ints = usi.aInt;
        var seq = usi.sequence;
        var charge = usi.precursorCharge;
        if (topSpectrum) {
          $scope.peptide.sequence = seq;
          $scope.peptide.precursorCharge = charge;
          $scope.peptide.charge = charge;
          $scope.db.items = mzs.map(
            (x,i) => {
              return {mZ: x, intensity: ints[i]};
            }
          );
        } else {
          $scope.peptideBottom.sequence = seq;
          $scope.peptideBottom.precursorCharge = charge;
          $scope.peptideBottom.charge = charge - 1;
          $scope.dbBottom.items = mzs.map(
            (x,i) => {
              return {mZ: x, intensity: ints[i]};
            }
          );
        }

        if (fillBothSequences) {
          $scope.peptide.sequence = seq;
          $scope.peptideBottom.sequence = seq;
        }

        if (!auto) {
          $scope.openModalConfirmation('The reference Spectrum was successfully imported into Manual input. Click OK to redirect', topSpectrum);
        }
        $scope.busy.isProcessing = false;
        return(true);
      },
      function(response2){
        $scope.busy.isProcessing = false;
        return(false);
      });
  }

  $scope.prepareDataToProcess = function(topSpectrum = true) {

    var url = "https://www.proteomicsdb.org/logic/api/getIPSAannotations.xsjs";
    if ((topSpectrum && $scope.peptide.precursorCharge <= 0) ||
      (!topSpectrum && $scope.peptideBottom.precursorCharge <= 0)) {
      url = "support/php/NegativeModeProcessData.php";
    }

    let submitData;
    // format data before sending it out for processing

    // map data from handsontable to new object for submitData
    submitData = topSpectrum ? $scope.db.items.map(({ mZ, intensity }) => ({ mZ, intensity })) :
      $scope.dbBottom.items.map(({ mZ, intensity }) => ({ mZ, intensity })) ;

    // filter out invalid entries from handsontable
    var newArray = [];

    for (var i = 0; i < submitData.length; i++) {
      let value = submitData[i];
      if (!isNaN(value.mZ) && !isNaN(value.intensity) && value.mZ !=="" && value.intensity !== "") {
        newArray.push(value);
      }
    }
    submitData = newArray;
    //$log.log(newArray);

    // make charge compatible with processing scripts
    var charge = 0;
    if(topSpectrum){
      if ($scope.peptide.precursorCharge > 0) {
        charge = $scope.peptide.charge + 1;
      } else {
        charge = $scope.peptide.charge;
      }
    } else {
      if ($scope.peptideBottom.precursorCharge > 0) {
        charge = $scope.peptideBottom.charge + 1;
      } else {
        charge = $scope.peptideBottom.charge;
      }
    }

    // bind all data in froms to data
    var data = {
      "sequence" : topSpectrum ? $scope.peptide.sequence : $scope.peptideBottom.sequence,
      "precursorCharge": topSpectrum ? $scope.peptide.precursorCharge : $scope.peptideBottom.precursorCharge,
      "charge" : charge,
      "fragmentTypes" : $scope.checkModel,
      "peakData" : submitData,
      "mods" : topSpectrum ? $scope.modObject.selectedMods : $scope.modObjectBottom.selectedMods,
      "toleranceType" : $scope.cutoffs.toleranceType,
      "tolerance" : $scope.cutoffs.tolerance,
      "matchingType": $scope.cutoffs.matchingType,
      "cutoff": $scope.cutoffs.matchingCutoff
    };
    return {url: url, data: data};
  }

  $scope.mergeSpectra = function(sp1,sp2) {

    var binarySpectrum_1 = binary_search_spectrum(sp1, sp2);
    console.log(binarySpectrum_1);
    var binarySpectrum_2 = binary_search_spectrum(sp2, sp1);
    binarySpectrum_1 = selectMostIntensePeak(binarySpectrum_1);
    console.log(binarySpectrum_1);
    binarySpectrum_2 = selectMostIntensePeak(binarySpectrum_2);
    result = full_merge(binarySpectrum_1, binarySpectrum_2);
    console.log(result);
    return result;
  }

  $scope.calculateScores = function(sp1, sp2, contains = true){

    result = $scope.mergeSpectra(sp1,sp2);
    binarySpectrum = {};
    binarySpectrum["intensity_1"] = result.map(function(x){
      return x.intensity_1
    });
    binarySpectrum["intensity_2"] = result.map(function(x){
      return x.intensity_2
    });


    var spectral_angle = ipsa_helper["comparison"]["spectral_angle"](binarySpectrum["intensity_1"], binarySpectrum["intensity_2"]);
    var pearson_correlation = ipsa_helper["comparison"]["pearson_correlation"](binarySpectrum["intensity_1"], binarySpectrum["intensity_2"]);

    return (
      {
        sa : Math.round(spectral_angle * 100)/100,
        corr: Math.round(pearson_correlation * 100)/100
      }
    );
  }

  $scope.getScores = function(spec1, spec2){

    $scope.scoreBottom($scope.calculateScores(spec1, spec2, true));
    $scope.scoreTop($scope.calculateScores(spec2, spec1, true));

    $scope.score($scope.calculateScores(spec1, spec2, false));

  }

  $scope.getPromise1 = function(ina){
    // should return a promise
    return $http.post($scope.submittedDataTop.url, $scope.submittedDataTop.data)
  }
  $scope.getA = function(a){
    return $http.get("/")
      .then(function(res){
        return(3);
      })
      .catch();
  }

  $scope.processData = function() {
    $scope.busy.isProcessing = true;
    if ($scope.invalidColors()) {

    } else {
      let ionColors = {
        a: $scope.checkModel.a.color,
        b: $scope.checkModel.b.color,
        c: $scope.checkModel.c.color,
        x: $scope.checkModel.x.color,
        y: $scope.checkModel.y.color,
        z: $scope.checkModel.z.color
      };

      $scope.submittedDataTop = $scope.prepareDataToProcess();
      $scope.submittedDataBottom = $scope.prepareDataToProcess(false);

      // httpRequest to submit data to processing script.
      $http.post($scope.submittedDataTop.url, $scope.submittedDataTop.data)
        .then( function(response) {
          delete response.data.fragments;

          $scope.annotatedResults = response.data;
          const annotation1 = new Annotation($scope.submittedDataTop.data);
          console.log(annotation1.fakeAPI());
          $scope.annotatedResults = annotation1.fakeAPI();

          $http.post($scope.submittedDataBottom.url, $scope.submittedDataBottom.data)
            .then( function(responseBottom) {

              $scope.annotatedResultsBottom = responseBottom.data;
              console.log(responseBottom.data);
              console.log($scope.submittedDataBottom.data);
              const annotation = new Annotation($scope.submittedDataBottom.data);
              console.log(annotation);
              $scope.annotatedResultsBottom = annotation.fakeAPI();

              console.log($scope.annotatedResultsBottom);
              check = function(spectrum){
              if (typeof spectrum == 'undefined') {
                return [{"mz":"", "intensity":"", "percentBasePeak": 0, "sn": null, "matchedFeatures": []}]
              }else{
                return spectrum;
              }
              }
              response.data.peaks = check(response.data.peaks);
              responseBottom.data.peaks = check(responseBottom.data.peaks);
              // linear regression
              var mergedForRegression = $scope.mergeSpectra(response.data.peaks, responseBottom.data.peaks);
              console.log(mergedForRegression); // TODO MAP IDs
              var originalData = $scope.mergeSpectra(response.data.peaks, responseBottom.data.peaks);
              console.log(originalData);

              // remove non matches for linear fit
              mergedForRegression = mergedForRegression.filter((x) =>{return x.mz_1 !==-1 && x.mz_2!== -1});
              var int1 = mergedForRegression.map((x) =>{return x.intensity_1});
              var int2 = mergedForRegression.map((x) =>{return x.intensity_2});
              if (int1.length ===0 && int2.length ===0){
                beta_hat = 1;
              }else{
               beta_hat = regressionThroughZero(int1, int2);
              }
              

              // data is max scaled if no merged peaks are found
              var int1Scaling = d3.max(mergedForRegression.map((x) => {return x.intensity_1}));
              int1Scaling = isNaN(int1Scaling) ?  d3.max(originalData, (x) => {return x.intensity_1}) : int1Scaling;
              var int2Scaling = d3.max(mergedForRegression.map((x) => {return x.intensity_2}));
              int2Scaling = isNaN(int2Scaling) ?  d3.max(originalData, (x) => {return x.intensity_2}) : int2Scaling;

              var intensityerror = originalData.map((x) => {
                if(x.mz_1 === -1 || x.mz_2 === -1){
                  return 0;
                }
                var delta = x.mz_1 - x.mz_2;
                var avg = (x.mz_1 + x.mz_2) / 2;
                return delta / avg * Math.pow(10, 6);
              })
              var intensityerrorx = originalData.map((x) =>{if(x.mz_1 <0){return x.mz_2}else if(x.mz_2 <0){return x.mz_1}return (x.mz_1 + x.mz_2) / 2});
              // size of bubble
              console.log(int2Scaling);
              console.log(originalData);
              var intensityDifference = originalData.map((x) => {
                if(x.mz_1 === -1){
                  return Math.abs(x.intensity_2 / int2Scaling);
                }
                if(x.mz_2 === -1){
                  return Math.abs(beta_hat * (x.intensity_1 / int1Scaling));
                }
              // return(Math.abs( beta_hat * (x.intensity_1/int1Scaling) - x.intensity_2/int2Scaling) *100)
              return Math.abs(beta_hat * (x.intensity_1/int1Scaling) - (x.intensity_2/int2Scaling))
              });
              console.log(intensityDifference);

              $scope.plotData($scope.annotatedResults, intensityerror, intensityerrorx, intensityDifference,
                originalData.map(x => {return x.id_1}),
                originalData.map(x => {return x.id_2})
                );
              $scope.plotDataBottom($scope.annotatedResultsBottom);

              $scope.getScores(response.data.peaks, responseBottom.data.peaks);
              $scope.busy.isProcessing = false;
            }, function (response) {
              // if errors exist, alert user
              $scope.busy.isProcessing = false;
              alert(response.data.message);
            });
        }, function (response) {
          // if errors exist, alert user
          $scope.busy.isProcessing = false;
          alert(response.data.message);
        });
    }
  };

  $scope.invalidColors = function() {
    $scope.colorArray = [];

    // Add colors to array if selected and valid
    angular.forEach($scope.checkModel, function (value, key) {
      if (key !== "H2O" && key !== "NH3" && key !== "HPO3" && key !== "CO2") {
        if (!$scope.checkHex(value.color)) {
          alert("Invalid color HEX code for selected fragment: " + key);
          return true;
        } else {
          if (value.selected) {
            $scope.colorArray.push(value.color);
          } else {
            $scope.colorArray.push("");
          }
        }
      }
    });

    return false;
  }

  $scope.checkHex = function(value) {
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value)
  }

  $scope.downloadData = function() {
    var csvRows = [];

    // write CV peptide sequence header
    csvRows.push("Sequence, Theoretical Mz, Charge, Modifications <Name;Index;Mass Change>, # Matched Fragments, # Bonds Broken, % TIC Explained");
    csvRows.push($scope.set.peptide.sequence + "," + d3.format("0.4f")($scope.set.peptide.precursorMz) + "," + $scope.set.peptide.precursorCharge + "," +
      $scope.formatModsForDownload() + "," + $scope.getNumberFragments() + "," + $scope.getFragmentedBonds() + "," + $scope.getPercentTicExplained());

    csvRows.push("");

    // matched fragments headers
    csvRows.push("Fragment Type, Fragmented Bond Number, Attached Modifications <Name;Index;Mass Change>, Neutral Loss, Fragment Charge, Intensity, Experimental Mz, Theoretical Mz, " +
      "Mass Error (" + $scope.cutoffs.toleranceType + "), % Base Peak, % TIC");

    var fragments = $scope.formatMatchedFragmentRow();

    fragments.forEach(function(fragment) {
      csvRows.push(fragment);
    });


    // write CV peptide sequence header
    csvRows.push("Sequence, Theoretical Mz, Charge, Modifications <Name;Index;Mass Change>, # Matched Fragments, # Bonds Broken, % TIC Explained");
    csvRows.push($scope.set.peptideBottom.sequence + "," + d3.format("0.4f")($scope.set.peptideBottom.precursorMz) + "," + $scope.set.peptideBottom.precursorCharge + "," +
      $scope.formatModsForDownload(false) + "," + $scope.getNumberFragments(false) + "," + $scope.getFragmentedBonds(false) + "," + $scope.getPercentTicExplained(false));

    csvRows.push("");

    // matched fragments headers
    csvRows.push("Fragment Type, Fragmented Bond Number, Attached Modifications <Name;Index;Mass Change>, Neutral Loss, Fragment Charge, Intensity, Experimental Mz, Theoretical Mz, " +
      "Mass Error (" + $scope.cutoffs.toleranceType + "), % Base Peak, % TIC");

    var fragmentsBottom = $scope.formatMatchedFragmentRow(false);

    fragmentsBottom.forEach(function(fragment) {
      csvRows.push(fragment);
    });

    var outputString = csvRows.join("\n");
    var a = document.createElement('a');

    a.href = 'data:attachment/csv,' +  encodeURIComponent(outputString);
    a.download = "USE_Data.csv";
    document.body.appendChild(a);

    a.click();
    a.remove();
  }

  $scope.getNumberFragments = function(topSpectrum = true) {
    var numFragments = 0;
    if(topSpectrum) {
      $scope.set.plotData.label.forEach(function(label) {
        if (label) {
          numFragments++;
        }
      });
    } else {
      $scope.set.plotDataBottom.label.forEach(function(label) {
        if (label) {
          numFragments++;
        }
      });
    }

    return numFragments;
  };

  $scope.getFragmentedBonds = function(topSpectrum = true) {

    var numBonds = (topSpectrum ? $scope.set.peptide.sequence.length : $scope.set.peptideBottom.sequence.length) - 1;
    var bondArray = new Array(numBonds).fill(0);

    var aPlotData = topSpectrum ? $scope.set.plotData.label : $scope.set.plotDataBottom.label ;
    aPlotData.forEach(function(label) {
      var text = label.charAt(0);
      var location = label.slice(1);

      if (text == "a" || text == "b" || text == "c" || text == "C") {
        bondArray[location - 1] = 1;
      } else  if (text == "x" || text == "y" || text == "z" || text == "Z") {
        bondArray[-(location - numBonds)] = 1;
      }
    });

    var uniqueBondsBroken = bondArray.reduce(function(a, b) { return a + b; }, 0);
    return uniqueBondsBroken;
  };

  $scope.formatModsForDownload = function(topSpectrum = true) {
    var returnString = "\"";
    var aMods = topSpectrum ? $scope.modObject.selectedMods : $scope.modObjectBottom.selectedMods;

    if (typeof aMods !== 'undefined') {
      aMods.forEach(function(mod) {
        var modString = "<";
        var index = mod.index + 1;

        if (index == 0) {
          index = "N-terminus";
        } else if (( topSpectrum && index == $scope.set.peptide.sequence.length + 1) || (!topSpectrum && index == $scope.set.peptideBottom.sequence.length + 1))  {
          index = "C-terminus";
        }

        modString += mod.name + ";" + (index) + ";" + ( topSpectrum ?  d3.format("0.4f")($scope.annotatedResults.modifications[mod.index + 1].deltaMass) :  d3.format("0.4f")($scope.annotatedResultsBottom.modifications[mod.index + 1].deltaMass)) + ">";
        returnString += modString;
      });
    }

    if (returnString != "\"") {
      returnString += "\"";
    } else {
      return "";
    }

    return returnString;
  };

  $scope.formatReturnedModsForDownload = function(mods, topSpectrum = true) {
    var returnString = "";

    if (mods.length > 0) {
      returnString += "\"";

      mods.forEach(function(mod) {
        var modString = "<";
        var index = mod.site + 1;
        var name = "";

        var aMods = topSpectrum ? $scope.modObject.selectedMods : $scope.modObjectBottom.selectedMods;

        aMods.forEach(function(selectedMod) {
          if (mod.site == selectedMod.index && mod.deltaElement == selectedMod.elementChange) {
            name = selectedMod.name;
          }
        });

        if (index == 0) {
          index = "N-terminus";
        } else if ((topSpectrum && index == $scope.set.peptide.sequence.length + 1) || (!topSpectrum && index == $scope.set.peptideBottom.sequence.length + 1)) {
          index = "C-terminus";
        }

        modString += name + ";" + (index) + ";" + d3.format("0.4f")(mod.deltaMass) + ">";
        returnString += modString;
      });

      returnString += "\"";
    }

    return returnString;
  };

  $scope.getPercentTicExplained = function(topSpectrum = true) {
    var count = topSpectrum ? $scope.set.plotData.label.length : $scope.set.plotDataBottom.label.length;
    var fragmentIntensity = 0;
    var aPlotData = topSpectrum ? $scope.set.plotData : $scope.set.plotDataBottom;
    for (var i = 0; i < count; i++) {
      if (aPlotData.label[i]) {
        fragmentIntensity += aPlotData.y[i];
      }
    }

    return d3.format("0.2%")(fragmentIntensity / aPlotData.TIC);
  };

  $scope.formatMatchedFragmentRow = function(topSpectrum = true) {
    var aPlotData = topSpectrum ? $scope.set.plotData : $scope.set.plotDataBottom;
    var sSettings = topSpectrum ? $scope.set.settings.ionizationMode : $scope.set.settingsBottom.ionizationMode;
    var fragmentRows = [];
    var count = aPlotData.x.length;
    for (var i = 0; i < count; i++) {
      var row = "";

      var label = aPlotData.label[i];

      if (label) {
        var type = $scope.getFragmentType(label);
        var number = $scope.getFragmentNumber(label);
        var mods = $scope.getFragmentModifications(type, number, topSpectrum);
        mods = $scope.formatReturnedModsForDownload(mods, topSpectrum);
        var neutralLoss = aPlotData.neutralLosses[i];
        var mz = aPlotData.x[i];
        var charge = "";
        if (sSettings == "+") {
          charge = aPlotData.labelCharge[i];
        } else if (sSettings == "-") {
          charge = "-" + aPlotData.labelCharge[i];
        }
        var intensity = aPlotData.y[i];
        var theoMz =  aPlotData.theoMz[i];
        var error = aPlotData.massError[i];
        var percentBasePeak = aPlotData.percentBasePeak[i];
        var percentTIC = intensity / aPlotData.TIC;

        row += type + "," + number + "," + mods + ", " + neutralLoss + "," + charge + "," + intensity + "," +  d3.format("0.4f")(mz) + "," +  d3.format("0.4f")(theoMz) + "," +
          d3.format("0.4f")(error) + "," + d3.format("0.2f")(percentBasePeak) + "%," + d3.format("0.2%")(percentTIC);
        fragmentRows.push(row);
      }
    };

    return fragmentRows;
  };

  $scope.getFragmentType = function(label) {
    var char = label.charAt(0);

    if (char == "[") {
      return label.slice(1, -1);
    } else if (char == "C") {
      return "[c-1]";
    } else if (char == "Z") {
      return "[z+1]";
    } else {
      return char;
    }
  };

  $scope.getFragmentNumber = function(label) {
    var char = label.charAt(0);

    if (char == "[") {
      return "";
    } else {
      return parseInt(label.slice(1));
    }
  }

  $scope.getFragmentModifications = function(type, number, topSpectrum = true) {
    var returnArray = [];
    var possibleMods = [];
    if (type == "a" || type == "b" || type == "c" || type == "[c-1]") {
      possibleMods = topSpectrum ? $scope.annotatedResults.modifications.slice(0, number + 1) : $scope.annotatedResultsBottom.modifications.slice(0, number + 1);
    } else if (type == "x" || type == "y" || type == "z" || type == "[z+1]") {
      possibleMods =  topSpectrum ? $scope.annotatedResults.modifications.slice(-number - 1) : $scope.annotatedResultsBottom.modifications.slice(-number - 1); 
    }

    possibleMods.forEach(function(mod) {
      if (mod.deltaMass) {
        returnArray.push(mod);
      }
    });

    return returnArray;
  };

  $scope.toggleBusy = function() {
    if ($scope.busy.isProcessing) {
      //$scope.openModalLoading();      
    } else {
      //$uibModalInstance.close();
    }
  };
  
  $scope.$watch('busy.isProcessing', $scope.toggleBusy, true);

  var USIsInitialCount = "none";

  if ( typeof $scope.peptide.usi !== 'undefined' && $scope.peptide.usi.length !== 0){ USIsInitialCount = "top"; }
  if ( typeof $scope.peptideBottom.usi !== 'undefined' && $scope.peptideBottom.usi.length !== 0){ 
    if( USIsInitialCount !== "top") {
      USIsInitialCount = "bottom";
    } else {
      USIsInitialCount = "both";
    }
  }
  

  switch(USIsInitialCount) {
    case "top":
      $scope.processUSI(true,true, true);
      $scope.peptideBottom.api = 'Prosit';
      $scope.peptideBottom.hideCE=false;

      $scope.abc = Promise.all([$scope.promiseTop.resolved])
        .then((values) => {
          if ( values[0] ){
            $scope.processReference(false, true);
          }
        });
      break;
    case "bottom":
      $scope.processUSI(false,true);
      setTimeout(function(){
        $scope.peptide.api = 'Prosit';
        $scope.peptide.hideCE=false;
      },2000);
      setTimeout( function () {$scope.processReference(true, true)},3000);
      break;
    case "both":
      $scope.processUSI(true,false,true);
      $scope.processUSI(false,false,true);
      break;
    default:
      break;
  }
  
  setTimeout((xxxx) => {
  let abc2 = Promise.all([$scope.promiseTop.resolved, $scope.promiseBottom.resolved])
    .then( (values) => {
      if(d3.sum(values) === 2) {
        console.log("Generating plots");
        $scope.processData();
      }
    } , function(response2) {
    } 
    );
  }, 3000);
}]);
