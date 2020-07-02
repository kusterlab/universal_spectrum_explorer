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
      mods: populateMods()
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
    }
  };

  $scope.n = 150;


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
    console.log( returnedData.modifications)

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

    returnedData.peaks.forEach(function(data) {
      $scope.set.plotDataBottom.x.push(data.mz);
      $scope.set.plotDataBottom.y.push(data.intensity);
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
  $scope.plotData = function(returnedData) {
    $scope.set.peptide =
      {
        sequence: returnedData.sequence,
        precursorMz: returnedData.precursorMz,
        precursorCharge: $scope.peptide.precursorCharge,
        mods: returnedData.modifications
      };
    console.log( returnedData.modifications)

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

    returnedData.peaks.forEach(function(data) {
      $scope.set.plotData.x.push(data.mz);
      $scope.set.plotData.y.push(data.intensity);
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
        $scope.set.plotData.massError.push(peakData.massError);
        $scope.set.plotData.theoMz.push(fragment.mz);
      }
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

  $scope.processReference = function(topSpectrum = true) {
    let modString = "";
    if ($scope.modObject.selectedMods != undefined) {
      $scope.modObject.selectedMods.sort((x,y) => {return x.index > y.index});
      $scope.modObject.selectedMods.forEach(function(mod) {
        if (modString != ""){
          modString +=",";
        }
        modString += mod.name + "@"+mod.site + (mod.index+1);
      });
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

    switch (sApi) {
      case 'Prosit':
        query = {"sequence": [sSeq], "charge": [iPreCh], "ce": [iCE], "mods" : [modString]};
        url = "https://www.proteomicsdb.org/logic/api/getFragmentationPrediction.xsjs";
        $http.post(url, query)
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

          }, function(response2) {
            // if errors exist, alert user
            alert("Prosit: " + response2.data.message);
          });
        break;
      case 'ProteomeTools':
        url = "https://www.proteomicsdb.org/logic/api/getReferenceSpectrum.xsjs?sequence=" + sSeq + "&charge=" + iPreCh + "&mods=" + modString;
        $http.get(url, "")
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

          }, function(response2) {
            // if errors exist, alert user
            alert("ProteomeTools: " + response2.data.message);
          });
        break;
      default: return;
    }
  }

  $scope.processUSI = function(topSpectrum = true, fillBothSequences = false) {
    var sUsi = topSpectrum ? $scope.peptide.usi : $scope.peptideBottom.usi;
    var url = "https://www.ebi.ac.uk/pride/ws/archive/v2/spectrum?usi=" + sUsi;
    $http.get(url)
      .then( function(response) {
        var mzs = response.data.mzs;
        var ints = response.data.intensities;
        var seq = response.data.peptideSequence;
        var charge = response.data.charge;
        if (topSpectrum) {
          $scope.peptide.sequence = seq;
          $scope.peptide.precursorCharge = charge;
          $scope.peptide.charge = charge - 1;
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
      if (!isNaN(value.mZ) && !isNaN(value.intensity)) {
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
      "mods" : $scope.modObject.selectedMods,
      "toleranceType" : $scope.cutoffs.toleranceType,
      "tolerance" : $scope.cutoffs.tolerance,
      "matchingType": $scope.cutoffs.matchingType,
      "cutoff": $scope.cutoffs.matchingCutoff
    };
    return {url: url, data: data};
  }

  $scope.calculateScores = function(sp1, sp2, contains = true){
      var binarySpectrum = binary_search_spectrum(sp1, sp2, contains);
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

  $scope.processData = function() {
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

          $scope.annotatedResults = response.data;
          $scope.plotData($scope.annotatedResults);

          $http.post($scope.submittedDataBottom.url, $scope.submittedDataBottom.data)
            .then( function(responseBottom) {

              $scope.annotatedResultsBottom = responseBottom.data;
              $scope.plotDataBottom($scope.annotatedResultsBottom);

              $scope.getScores(response.data.peaks, responseBottom.data.peaks);
            }, function (response) {
              // if errors exist, alert user
              alert(response.data.message);
            });
        }, function (response) {
          // if errors exist, alert user
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

    var outputString = csvRows.join("\n");
    var a = document.createElement('a');

    a.href = 'data:attachment/csv,' +  encodeURIComponent(outputString);
    a.download = $scope.set.peptide.sequence + "_Data.csv";
    document.body.appendChild(a);

    a.click();
    a.remove();
  }

  $scope.getNumberFragments = function() {
    var numFragments = 0;
    $scope.set.plotData.label.forEach(function(label) {
      if (label) {
        numFragments++;
      }
    });

    return numFragments;
  };

  $scope.getFragmentedBonds = function() {

    var numBonds = $scope.set.peptide.sequence.length - 1;
    var bondArray = new Array(numBonds).fill(0);

    $scope.set.plotData.label.forEach(function(label) {
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

  $scope.formatModsForDownload = function() {
    var returnString = "\"";

    if (typeof $scope.modObject.selectedMods !== 'undefined') {
      $scope.modObject.selectedMods.forEach(function(mod) {
        var modString = "<";
        var index = mod.index + 1;

        if (index == 0) {
          index = "N-terminus";
        } else if (index == $scope.set.peptide.sequence.length + 1) {
          index = "C-terminus";
        }

        modString += mod.name + ";" + (index) + ";" + d3.format("0.4f")($scope.annotatedResults.modifications[mod.index + 1].deltaMass) + ">";
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

  $scope.formatReturnedModsForDownload = function(mods) {
    var returnString = "";

    if (mods.length > 0) {
      returnString += "\"";

      mods.forEach(function(mod) {
        var modString = "<";
        var index = mod.site + 1;
        var name = "";

        $scope.modObject.selectedMods.forEach(function(selectedMod) {
          if (mod.site == selectedMod.index && mod.deltaElement == selectedMod.elementChange) {
            name = selectedMod.name;
          }
        });

        if (index == 0) {
          index = "N-terminus";
        } else if (index == $scope.set.peptide.sequence.length + 1) {
          index = "C-terminus";
        }

        modString += name + ";" + (index) + ";" + d3.format("0.4f")(mod.deltaMass) + ">";
        returnString += modString;
      });

      returnString += "\"";
    }

    return returnString;
  };

  $scope.getPercentTicExplained = function() {
    var count = $scope.set.plotData.label.length;
    var fragmentIntensity = 0;

    for (var i = 0; i < count; i++) {
      if ($scope.set.plotData.label[i]) {
        fragmentIntensity += $scope.set.plotData.y[i];
      }
    }

    return d3.format("0.2%")(fragmentIntensity / $scope.set.plotData.TIC);
  };

  $scope.formatMatchedFragmentRow = function() {
    var fragmentRows = [];
    var count = $scope.set.plotData.x.length;
    for (var i = 0; i < count; i++) {
      var row = "";

      var label = $scope.set.plotData.label[i];

      if (label) {
        var type = $scope.getFragmentType(label);
        var number = $scope.getFragmentNumber(label);
        var mods = $scope.getFragmentModifications(type, number);
        mods = $scope.formatReturnedModsForDownload(mods);
        var neutralLoss = $scope.set.plotData.neutralLosses[i];
        var mz = $scope.set.plotData.x[i];
        var charge = "";
        if ($scope.set.settings.ionizationMode == "+") {
          charge = $scope.set.plotData.labelCharge[i];
        } else if ($scope.set.settings.ionizationMode == "-") {
          charge = "-" + $scope.set.plotData.labelCharge[i];
        }
        var intensity = $scope.set.plotData.y[i];
        var theoMz =  $scope.set.plotData.theoMz[i];
        var error = $scope.set.plotData.massError[i];
        var percentBasePeak = $scope.set.plotData.percentBasePeak[i];
        var percentTIC = intensity / $scope.set.plotData.TIC;

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

  $scope.getFragmentModifications = function(type, number) {
    var returnArray = [];
    var possibleMods = [];
    if (type == "a" || type == "b" || type == "c" || type == "[c-1]") {
      possibleMods = $scope.annotatedResults.modifications.slice(0, number + 1);
    } else if (type == "x" || type == "y" || type == "z" || type == "[z+1]") {
      possibleMods =  $scope.annotatedResults.modifications.slice(-number - 1);
    }

    possibleMods.forEach(function(mod) {
      if (mod.deltaMass) {
        returnArray.push(mod);
      }
    });

    return returnArray;
  };


  if ( typeof $scope.peptide.usi !== 'undefined' && $scope.peptide.usi.length !== 0){
    $scope.processUSI(true,true);

    setTimeout(function(){
      $scope.checkModel.b.selected = true;
      $scope.checkModel.y.selected = true;
      $scope.peptideBottom.api = 'Prosit';
      $scope.peptideBottom.hideCE=false;
    },2000);
      setTimeout( function () {$scope.processReference(false)},3000);
      setTimeout( function () {$scope.processData();},4000);
  }
}]);
