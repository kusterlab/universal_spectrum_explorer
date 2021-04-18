angular.module("IPSA.spectrum.controller", []);
angular.module("IPSA.directive", []);
angular.module("IPSA.directive2", []);

var myApp = angular.module('IPSA', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.select', 'ngHandsontable', "IPSA.spectrum.controller",
  "IPSA.directive", "IPSA.directive2", "hc.downloader", 'minicolors', 'ngStorage']);

myApp.config(function(uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
});

/* master controller to carry similar functionality to $rootScope */
myApp.controller('MasterCtrl', function($scope, $uibModal, $log, $localStorage, $http, $element, $attrs, $transclude) {

  $scope.getUrlVars = function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;
  };

  $scope.setUrlVars = function(mappedProperties) {
    // schema
    // https://www.proteomicsdb.org/use_dev/?usi=mzspec:PXD005175:CRC_iTRAQ_06:scan:11803:VEYTLGEESEAPGQR/3&usi_origin=jpost
    // or
    //
    // usi 
    // usi_origin
    // usibottom
    // usibottom_origin
    // https://www.proteomicsdb.org/use_dev/?usi=mzspec:PXD000561:Adult_Frontalcortex_bRP_Elite_85_f09:scan:17555:VLHPLEGAVVIIFK/2&usi_origin=peptideatlas&usibottom=mzspec:PXD015890:18May18_Olson_WT2.raw%20(F001551).mzid_18May18_Olson_WT2.raw_(F001551).MGF:index:6913:AEAEAQAEELSFPR/2&usibottom_origin=pride
    string = "?";
    console.log(mappedProperties);
    firstKey = true;
    for (let key in mappedProperties) {
      if (["usi", "usi_origin", "usibottom", "usibottom_origin", "fragment_tol", "fragment_tol_unit", "matching_tol", "matching_tol_unit"].includes(key)){
        if(typeof mappedProperties[key] != "undefined"){
      if (!firstKey){
        string+="&";
      }
      string+=key;
      string+="=";
      string+=mappedProperties[key];
      firstKey = false;
      }}
    }
    window.history.replaceState(null, null, string);
    console.log("called");

  };

  $scope.busy = {
    progress : 100,
    type : "progress-striped active",
    isProcessing : false
  };

  // stores peptide information
  $scope.peptide = {
    sequence: "TESTPEPTIDE",
    precursorCharge: 2,
    charge: 2,
    fragmentMin: 1,
    fragmentMax: 2,
    usi: $scope.getUrlVars().usi,
    usi_origin: $scope.getUrlVars().usi_origin,
    ce: 30,
    api: '',
    hideUSI: true,
    hideCE: true ,
    usiOriginTop: $scope.getUrlVars().usi_origin
  };

  $scope.peptideBottom = {
    sequence: "TESTPEPTIDE",
    precursorCharge: 2,
    charge: 2,
    fragmentMin: 1,
    fragmentMax: 2,
    usi: $scope.getUrlVars().usibottom,
    ce: 30,
    api: '',
    hideUSI: true,
    hideCE: true,
    usibottom_origin: $scope.getUrlVars().usibottom_origin
  };



  // stores the values for selected fragments and colors
  $scope.checkModel = {
    a: { selected: false, color: "#820CAD", label: "a" },
    b: { selected: true, color: "#0D75BC", label: "b" },
    c: { selected: false, color: "#07A14A", label: "c" },
    C: { selected: false, color: "#035729", label: "c-1" },
    x: { selected: false, color: "#D1E02D", label: "x" },
    y: { selected: true, color: "#BE202D", label: "y" },
    z: { selected: false, color: "#F79420", label: "z\u2022" },
    Z: { selected: false, color: "#A16016", label: "z+1" },
    H2O: { selected: false },
    NH3: { selected: false },
    HPO3: { selected: false },
    CO2: { selected: false },
    precursor: { selected: true, color: "#666666"},
    unassigned: { selected: true, color: "#A6A6A6"}
  };

  $scope.accordionTop = {
    manual : true,
    usi : false,
    reference : false
  };

  $scope.accordionBottom = {
    manual : true,
    usi : false,
    reference : false
  };

  $scope.checkResults = { 
    string: "unmatched", 
    colors: "#A6A6A6",
    colorArray: []
  };

  $scope.tableColumns = [
    {id: 1, name: 'M/Z, Intensity'}
  ];

  $scope.db = {};
  $scope.dbBottom = {};

  $scope.db.columns = [
    {
      data:"mZ", 
      title :"Mass To Charge", 
      type: "numeric", 
      format: "0,0,0.0000" 
    },
    {
      data:"intensity", 
      title :"Intensity", 
      type: "numeric", 
      format: "0,0,0.0000" 
    }
  ];

  $scope.dbBottom.columns = [
    {
      data:"mZ", 
      title :"Mass To Charge", 
      type: "numeric", 
      format: "0,0,0.0000" 
    },
    {
      data:"intensity", 
      title :"Intensity", 
      type: "numeric", 
      format: "0,0,0.0000" 
    }
  ];

  $scope.db.items = [];
  $scope.dbBottom.items = [];

  $scope.annotatedResults;

  $scope.predeterminedMods = [];
  $scope.userMods = [];
  $scope.potentialMods = [];
  $scope.potentialModsBottom = [];

  $scope.$watchCollection('peptide.sequence', function () {
    $scope.loadMods();
  });

  $scope.$watchCollection('peptideBottom.sequence', function () {
    $scope.loadMods(false);
  });

  $scope.$watchCollection('userMods', function () {
    $scope.loadMods();
  });

  var contains = function(a, scopeMods) {
    var isIn = false;
    for (var i = 0; i < scopeMods.length; i++) {
      var listMod = scopeMods[i];
      if (a.name == listMod.name) {
        if (a.site == listMod.site) {
          if (a.index == listMod.index) {
            if (a.hasOwnProperty("elementChange") && listMod.hasOwnProperty("elementChange")) {
              if (a.elementChange == listMod.elementChange) {
                isIn = true;
              }
            } else if (a.hasOwnProperty("deltaMass") && listMod.hasOwnProperty("deltaMass")) {
              if (a.deltaMass == listMod.deltaMass) {
                isIn = true;
              }
            }
          }
        }
      }
    }
    return isIn;
  }

  $scope.loadMods = function(topSpectrum = true) {
    // get potential mods from text file
    if ($scope.predeterminedMods.length == 0) {
      var text = 'Mods not yet loaded.';
      $http.get('support/mods/Modifications.txt') 
        .then(function (data) {
          text = data.data.split("\r\n");
          var tempArray = [];

          for (var i = 0; i < text.length; i++) {
            var line = text[i].split(';');

            tempArray.push(
              {
                name: line[0],
                site: line[1],
                elementChange: line[2]
              }
            );
          }
          $scope.predeterminedMods = tempArray;

          // now that we have predetermined mods, get user mods
          $scope.userMods = $localStorage.userMods;
          if (typeof $scope.userMods === "undefined") {
            $scope.userMods = [];
          }

          if(topSpectrum) {
            $scope.potentialMods = $scope.userMods.concat($scope.predeterminedMods);
            $scope.mods = [];
          } else{
            $scope.potentialModsBottom = $scope.userMods.concat($scope.predeterminedMods);
            $scope.modsBottom = [];
          }

          var sSeq = topSpectrum ? $scope.peptide.sequence : $scope.peptideBottom.sequence;

          var aTempPotMods = topSpectrum ? $scope.potentialMods : $scope.potentialModsBottom;
          var aMods = topSpectrum ? $scope.mods : $scope.modsBottom;
          for (var i = 0; i < sSeq.length; i++) {
            var char = sSeq.charAt(i).toUpperCase();
            for (var j = 0; j < aTempPotMods.length; j++) {
              var mod = aTempPotMods[j];
              var addMod = {};
              if (mod.site.charAt(0) == char && mod.site != "N-terminus" && mod.site != "C-terminus") {

                if (mod.hasOwnProperty("deltaMass")) {
                  addMod = 
                    {
                      name: mod.name,
                      site: mod.site,
                      index: i,
                      deltaMass: mod.deltaMass
                    };
                } else {
                  addMod = 
                    {
                      name: mod.name,
                      site: mod.site,
                      index: i,
                      elementChange: mod.elementChange
                    };
                }

                if (!contains(addMod, aMods)) {
                  if(topSpectrum){
                    $scope.mods.push(addMod);
                  } else {
                    $scope.modsBottom.push(addMod);
                  }
                }
              } else if (mod.site == "N-terminus") {
                if (mod.hasOwnProperty("deltaMass")) {
                  addMod = 
                    {
                      name: mod.name,
                      site: mod.site,
                      index: -1,
                      deltaMass: mod.deltaMass
                    };
                } else {
                  addMod = 
                    {
                      name: mod.name,
                      site: mod.site,
                      index: -1,
                      elementChange: mod.elementChange
                    };
                }
                if (!contains(addMod, aMods)) {
                  if(topSpectrum){
                    $scope.mods.push(addMod);
                  } else {
                    $scope.modsBottom.push(addMod);
                  }
                }
              } else if (mod.site == "C-terminus") {
                if (mod.hasOwnProperty("deltaMass")) {
                  addMod = 
                    {
                      name: mod.name,
                      site: mod.site,
                      index: sSeq.length,
                      deltaMass: mod.deltaMass
                    };
                } else {
                  addMod = 
                    {
                      name: mod.name,
                      site: mod.site,
                      index: sSeq.length,
                      elementChange: mod.elementChange
                    };
                }
                if (!contains(addMod, aMods)) {
                  if(topSpectrum){
                    $scope.mods.push(addMod);
                  } else {
                    $scope.modsBottom.push(addMod);
                  }
                }
              }
            }
          }
        }, function (error) {
          alert('Error: Modification file not found');
        });
    } else {
      // now that we have predetermined mods, get user mods
      $scope.userMods = $localStorage.userMods;
      if (typeof $scope.userMods === "undefined") {
        $scope.userMods = [];
      }
      if(topSpectrum) {
        $scope.potentialMods = $scope.userMods.concat($scope.predeterminedMods);
        $scope.mods = [];
      } else{
        $scope.potentialModsBottom = $scope.userMods.concat($scope.predeterminedMods);
        $scope.modsBottom = [];
      }

      var sSeq = topSpectrum ? $scope.peptide.sequence : $scope.peptideBottom.sequence;

      var aTempPotMods = topSpectrum ? $scope.potentialMods : $scope.potentialModsBottom;
      var aMods = topSpectrum ? $scope.mods : $scope.modsBottom;
      for (var i = 0; i < sSeq.length; i++) {
        var char = sSeq.charAt(i).toUpperCase();
        for (var j = 0; j < aTempPotMods.length; j++) {
          var mod = aTempPotMods[j];
          var addMod = {};
          if (mod.site.charAt(0) == char && mod.site != "N-terminus" && mod.site != "C-terminus") {

            if (mod.hasOwnProperty("deltaMass")) {
              addMod = 
                {
                  name: mod.name,
                  site: mod.site,
                  index: i,
                  deltaMass: mod.deltaMass
                };
            } else {
              addMod = 
                {
                  name: mod.name,
                  site: mod.site,
                  index: i,
                  elementChange: mod.elementChange
                };
            }

            if (!contains(addMod, aMods)) {
              if(topSpectrum){
                $scope.mods.push(addMod);
              } else {
                $scope.modsBottom.push(addMod);
              }
            }
          } else if (mod.site == "N-terminus") {
            if (mod.hasOwnProperty("deltaMass")) {
              addMod = 
                {
                  name: mod.name,
                  site: mod.site,
                  index: -1,
                  deltaMass: mod.deltaMass
                };
            } else {
              addMod = 
                {
                  name: mod.name,
                  site: mod.site,
                  index: -1,
                  elementChange: mod.elementChange
                };
            }
            if (!contains(addMod, aMods)) {
              if(topSpectrum){
                $scope.mods.push(addMod);
              } else {
                $scope.modsBottom.push(addMod);
              }
            }
          } else if (mod.site == "C-terminus") {
            if (mod.hasOwnProperty("deltaMass")) {
              addMod = 
                {
                  name: mod.name,
                  site: mod.site,
                  index: sSeq.length,
                  deltaMass: mod.deltaMass
                };
            } else {
              addMod = 
                {
                  name: mod.name,
                  site: mod.site,
                  index: sSeq.length,
                  elementChange: mod.elementChange
                };
            }
            if (!contains(addMod, aMods)) {
              if(topSpectrum){
                $scope.mods.push(addMod);
              } else {
                $scope.modsBottom.push(addMod);
              }
            }
          }
        }
      }
    }
  }

  $scope.mods = [];

  $scope.modObject = {};
  $scope.modObjectBottom = {};

  $scope.renderTable = function (topSpectrum = true) {
    if(topSpectrum) {
      //setTimeout(function(x) {$scope.handsonTableInstance.render(); console.log("Render Top")}, 100);
    } else {
      //setTimeout(function(x) {$scope.handsonTableInstanceBottom.render();}, 100);
    }
  }

  $scope.openModalLoading = function () {
    $uibModal.open({
      templateUrl: 'support/html/ModalTemplateLoading.html',
      scope: $scope,
      controller: function ($scope, $uibModalInstance, $localStorage) {
        $scope.closeModalLoading = function () {
          $uibModalInstance.close();
        };
      }
      //Squash unhandled rejection on backdrop click that's thrown
      //TODO
      //Sorry future debugger
    }).result.then(function(){}, function(result){})
  };

  $scope.openModalConfirmation = function ( message, topSpectrum = true ) {
    $uibModal.open({
      templateUrl: 'support/html/ModalTemplateConfirmation.html',
      scope: $scope,
      controller: function ($scope, $uibModalInstance, $localStorage) {
        $scope.confMessage = message;
        $scope.closePopUp = function () {
          let acrd = topSpectrum ? $scope.accordionTop : $scope.accordionBottom ;
          acrd.manual = true;
          acrd.usi = false;
          acrd.reference = false;

          $uibModalInstance.close();
        };

      }
      //Squash unhandled rejection on backdrop click that's thrown
      //TODO
      //Sorry future debugger
    }).result.then(function(){}, function(result){})
  };

  $scope.openModal = function () {
    $uibModal.open({
      templateUrl: 'support/html/ModalTemplateNew.html',
      scope: $scope,
      controller: function ($scope, $uibModalInstance, $localStorage) {
        // add the mod to potential mods

        $scope.ok = function () {
          // validate input. if okay, then add to potential mods. save to web storage
          // is a name filled out in the modal
          if ($scope.potentialUserMod.name) {
            if ($scope.userModSites.selected.length > 0) {
              if ($scope.potentialUserMod.deltaMass != 0) {

                $scope.userModSites.selected.forEach(function(site) {
                  $scope.userMods.push({
                    name: $scope.potentialUserMod.name,
                    site: site,
                    deltaMass: $scope.potentialUserMod.deltaMass
                  });
                });

                $localStorage.userMods = $scope.userMods;
                $uibModalInstance.close();
              } else {
                alert("Please enter a modification mass shift. This can be positive or negative");
              }
            } else {
              alert("Please select at least one modification site");
            }
          } else {
            alert("Please give your modification a name.");
          }

        };

        $scope.clearMods = function() {
          if (confirm("Are you sure you want to clear all user mods from your history? This cannot be undone.")) {
            $localStorage.userMods = [];
            $scope.loadMods();
          }
        };

        // clear all user mod fields
        $scope.cancel = function () {
          $scope.potentialUserMod.name = "";
          $scope.potentialUserMod.site = "";
          $scope.potentialUserMod.deltaMass = 0;

          $uibModalInstance.dismiss('cancel');
        };


      }
      //Squash unhandled rejection on backdrop click that's thrown
      //TODO
      //Sorry future debugger
    }).result.then(function(){}, function(result){})
  };

  $scope.potentialUserMod = 
    {
      name: "",
      site: "",
      deltaMass: 0
    }

  $scope.cutoffs = {
    matchingCutoff: 0,
    matchingType: "% Base Peak",
    toleranceType: ["ppm", "Da"].includes($scope.getUrlVars().fragment_tol_unit) ? $scope.getUrlVars().fragment_tol_unit : "ppm",
    tolerance: parseInt($scope.getUrlVars().fragment_tol) || 10,
    compToleranceType:["ppm", "Da"].includes($scope.getUrlVars().matching_tol_unit) ? $scope.getUrlVars().matching_tol_unit : "ppm",
    compTolerance: parseInt($scope.getUrlVars().matching_tol) || 10
  };

  $scope.searchUSI = function(topSpectrum = true) {
m1
    $scope.processUSI(topSpectrum);
  }

  $scope.processPredicted = function(topSpectrum) {
    if (topSpectrum) {
      switch ($scope.peptide.api) {
        case 'Prosit':
        case 'ProteomeTools':
          $scope.peptide.hideUSI=true;
          $scope.peptide.hideCE=false;
          break;
        case 'USI':
          $scope.peptide.hideCE=true;
          $scope.peptide.hideUSI=false;
          break;
        default:
          $scope.peptide.hideCE=true;
          $scope.peptide.hideUSI=true;
          break;
      }
    } else {
      switch ($scope.peptide.api) {
        case 'Prosit':
        case 'ProteomeTools':
          $scope.peptideBottom.hideUSI=true;
          $scope.peptideBottom.hideCE=false;
          break;
        case 'USI':
          $scope.peptideBottom.hideCE=true;
          $scope.peptideBottom.hideUSI=false;
          break;
        default:
          $scope.peptideBottom.hideCE=true;
          $scope.peptideBottom.hideUSI=true;
          break;
      }
    }
  }
  
  $scope.validateSequence = function(topSpectrum = true) {
    var regex = new RegExp("[AC-IK-NP-TVWY]", "i");
    var sSequence = topSpectrum ? $scope.peptide.sequence : $scope.peptideBottom.sequence;
    for (var i = 0; i < sSequence.length; i++) {

      var character = sSequence[i];

      if (!regex.exec(character)) {
        i--;
          sSequence = sSequence.replace(character, "");
        if (topSpectrum) {
          $scope.peptide.sequence = sSequence;
        } else {
          $scope.peptideBottom.sequence = sSequence;
        }
        alert(character + " aaa is not a valid amino acid. Only the 20 canonical amino acids are supported.");
      }
        
    }
  }

  $scope.swapCompToleranceType = function() {
    if ($scope.cutoffs.compToleranceType === "Da") {
      $scope.cutoffs.compToleranceType = "ppm";
      $scope.cutoffs.compTolerance *= 1000
    } else {
      $scope.cutoffs.compToleranceType = "Da";
      $scope.cutoffs.compTolerance /= 1000
    }
  }

  $scope.swapToleranceType = function() {
    if ($scope.cutoffs.toleranceType === "Da") {
      $scope.cutoffs.toleranceType = "ppm";
      $scope.cutoffs.tolerance *= 1000
    } else {
      $scope.cutoffs.toleranceType = "Da";
      $scope.cutoffs.tolerance /= 1000
    }
  }

  $scope.swapMatchingType = function() {
    $scope.cutoffs.matchingType = "% Base Peak";/*
    if ($scope.cutoffs.matchingType === "Intensity") {
      $scope.cutoffs.matchingType = "% Base Peak";
      $scope.cutoffs.matchingCutoff = 0;
    } else if ($scope.cutoffs.matchingType === "% Base Peak") {
      $scope.cutoffs.matchingType = "S/N";
      $scope.cutoffs.matchingCutoff = 0;
    } else {
      $scope.cutoffs.matchingType = "Intensity";
      $scope.cutoffs.matchingCutoff = 0;
    }*/
  }

  $scope.swapCE = function() {
    $scope.cutoffs.matchingType = "% Base Peak";
  }

  // precursor charge
  $scope.validateCharge = function(topSpectrum = true) {
    if (topSpectrum) {
      if (!$scope.peptide.precursorCharge) {
        $scope.peptide.precursorCharge = 2;
      }

      $scope.peptide.precursorCharge = Math.round($scope.peptide.precursorCharge);

      // Check to make sure charge is set
      if (typeof $scope.peptide.charge == "undefined") {
        $scope.peptide.precursorCharge = 2;
        $scope.peptide.charge = 1;
        // positive mode
      }

      // check to make sure precursor charge is a valid value (not -1, 0, 1) 
      if ($scope.peptide.precursorCharge == 0 ) {
        $scope.peptide.precursorCharge = 1;
        $scope.peptide.charge = 1;
      } else if ($scope.peptide.precursorCharge == -1) {
        $scope.peptide.precursorCharge = -2;
        $scope.peptide.charge = -1;
      }

      // set fragment charge min and max from the precursor charge
      if ($scope.peptide.precursorCharge > 0) {
        $scope.peptide.fragmentMax = $scope.peptide.precursorCharge; // TODO: check with mathias
        $scope.peptide.fragmentMin = 1;
        $scope.checkModel.a.label = "a";
      } else {
        $scope.peptide.fragmentMax = -1;
        $scope.peptide.fragmentMin = $scope.peptide.precursorCharge + 1;
        $scope.checkModel.a.label = "a\u2022";
      }
      $log.log($scope.peptide.precursorCharge);
    } else {
      if (!$scope.peptideBottom.precursorCharge) {
        $scope.peptideBottom.precursorCharge = 2;
      }

      $scope.peptideBottom.precursorCharge = Math.round($scope.peptideBottom.precursorCharge);

      // Check to make sure charge is set
      if (typeof $scope.peptideBottom.charge == "undefined") {
        $scope.peptideBottom.precursorCharge = 2;
        $scope.peptideBottom.charge = 1;
        // positive mode
      }

      // check to make sure precursor charge is a valid value (not -1, 0, 1) 
      if ($scope.peptideBottom.precursorCharge == 0 ) { // TODO: check
        $scope.peptideBottom.precursorCharge = 1;
        $scope.peptideBottom.charge = 1;
      } else if ($scope.peptideBottom.precursorCharge == -1) {
        $scope.peptideBottom.precursorCharge = -2;
        $scope.peptideBottom.charge = -1;
      }

      // set fragment charge min and max from the precursor charge
      if ($scope.peptideBottom.precursorCharge > 0) {
        $scope.peptideBottom.fragmentMax = $scope.peptideBottom.precursorCharge ; // TODO: check
        $scope.peptideBottom.fragmentMin = 1;
        $scope.checkModel.a.label = "a";
      } else {
        $scope.peptideBottom.fragmentMax = -1;
        $scope.peptideBottom.fragmentMin = $scope.peptideBottom.precursorCharge + 1;
        $scope.checkModel.a.label = "a\u2022";
      }
      $log.log($scope.peptideBottom.precursorCharge);
    }

    // validate fragment charge
    $scope.validateFragmentCharge(topSpectrum);
  }

  // fragment charge validator
  $scope.validateFragmentCharge = function(topSpectrum = true) {
    if (topSpectrum) {
      if (!$scope.peptide.charge) {
        $scope.peptide.charge = 1;
      }

      $scope.peptide.charge = Math.round($scope.peptide.charge);

      // Check to make sure charge is set
      if (typeof $scope.peptide.charge == "undefined") {
        if ($scope.peptide.precursorCharge > 0) {
          $scope.peptide.charge = 1;
        } else {
          $scope.peptide.charge = -1;
        }
      }

      // make sure fragment charge is within max and min depending on precursor charge
      if ($scope.peptide.charge < $scope.peptide.fragmentMin) {
        $scope.peptide.charge = $scope.peptide.fragmentMin;
      } else if ($scope.peptide.charge > $scope.peptide.fragmentMax) {
        $scope.peptide.charge = $scope.peptide.fragmentMax;
      }
      $log.log($scope.peptide.charge);
    } else {
      if (!$scope.peptideBottom.charge) {
        $scope.peptideBottom.charge = 1;
      }

      $scope.peptideBottom.charge = Math.round($scope.peptideBottom.charge);

      // Check to make sure charge is set
      if (typeof $scope.peptideBottom.charge == "undefined") {
        if ($scope.peptideBottom.precursorCharge > 0) {
          $scope.peptideBottom.charge = 1;
        } else {
          $scope.peptideBottom.charge = -1;
        }
      }

      // make sure fragment charge is within max and min depending on precursor charge
      if ($scope.peptideBottom.charge < $scope.peptideBottom.fragmentMin) {
        $scope.peptideBottom.charge = $scope.peptideBottom.fragmentMin;
      } else if ($scope.peptideBottom.charge > $scope.peptideBottom.fragmentMax) {
        $scope.peptideBottom.charge = $scope.peptideBottom.fragmentMax;
      }
      $log.log($scope.peptideBottom.charge);
    }
  }

  $scope.checkAlpha = function(string) {
    return /^[AC-IK-NP-TVWY]+$/i.test(string);
  }

  $scope.userModSites = {
    selected: [],
    sites: [
      "N-terminus",
      "A",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "K",
      "L",
      "M",
      "N",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "V",
      "W",
      "Y",
      "C-terminus"
    ]
  };
});

myApp.controller('PeptideCtrl', function ($scope) {

  $scope.decrementCharge = function() {
    $scope.peptide.charge--;
  }

  $scope.incrementCharge = function() {
    $scope.peptide.charge++;
  }

});

myApp.controller('HotCtrlTop', function ($scope) {
      $scope.afterInit = function() {
        $scope.handsonTableInstance = this;
      };

      $scope.handsonTableInstance = this;
      $scope.handleFormat = function(item) {
      };

      $scope.reset = function() {
        $scope.db.items = [];
      };
});

myApp.controller('HotCtrlBottom', function ($scope) {


      $scope.afterInitBottom = function() {
        setTimeout(function(x){$scope.handsonTableInstanceBottom = this;}, 1000);
      };

      $scope.handleFormatBottom = function(item) {
      };

      $scope.resetBottom = function() {
        $scope.dbBottom.items = [];
      };
});

//controller for generating data paste dropdown and handsonTable
myApp.directive("handsontabletest", function() {

  return{
    templateUrl: 'support/html/HotTableTemplate.html' /*,
    controller: function($scope, $element, $attrs, $transclude, $log) {

      $scope.afterInit = function() {
        $scope.handsonTableInstance = this;
      };

      $scope.handleFormat = function(item) {
      };

      $scope.reset = function() {
        $scope.db.items = [];
      };
    }*/
  };
});

myApp.controller('DataCtrl', ['$scope', function ($scope) {
  $scope.selectedFormat = $scope.tableColumns[0];      
}]);

myApp.controller('ModCtrl', ['$scope', '$log', function ($scope, $log) {
  $scope.modSelectOption = function(mod, topSpectrum = true) {
    var returnString = mod.name + ": " + mod.site;

    if (mod.index != -1 && (topSpectrum && mod.index != $scope.peptide.sequence.length) || (!topSpectrum && mod.index != $scope.peptideBottom.sequence.length)) {
      returnString += mod.index + 1 
    }

    returnString += " (";

    if (mod.hasOwnProperty("deltaMass")) {
      if (mod.deltaMass > 0) {
        returnString += "+";
      }
      returnString += mod.deltaMass + ")";
    } else {
      returnString += mod.elementChange + ")";
    }

    return returnString;
  };
}]);

myApp.controller('ColorCtrl', function ($scope) {
  $scope.wheelsettings = {
    control: 'wheel',
    position: 'bottom left'
  };
});
