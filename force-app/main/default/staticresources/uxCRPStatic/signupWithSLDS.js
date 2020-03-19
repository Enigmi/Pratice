'use strict';

/** 
 * Angular App 
 */
var uxSignupApp = angular.module('uxSignupApp', ['ngRemote', 'ngAnimate','ui.bootstrap']);

uxSignupApp.factory('serverData', function($q){  
    var sfRemoteActionHelper = function(deferred, result, event) {
        if(event.status) {
            deferred.resolve(result);
        }
        else if (event.type === 'exception') {
            deferred.reject(event.message);
        }
        else {
            deferred.reject(event.message); 
        }
    };  

    return {
      getLocations : function(str) {
          var deferred = $q.defer();
		  console.log('====str==', str);
          UXCRPSignupController.fetchLocation(str, function(result, event){
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;
      }
	  ,
	  getIsCustom : function() {
		  var deferred = $q.defer();
		  UXCRPSignupController.getIsCustom(function(result, event){
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;
	  }
	  ,
	  verifyCaptchaUserResponse : function(userResponse) {		  
		  var deferred = $q.defer();
		  UXCRPSignupController.verifyCaptchaUserResponse(userResponse, function(result, event){
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;
	  },  
	  //@profile Update
	  verifyEmailInSFDatabase : function(emailToVerify) {		  
		  var deferred = $q.defer();
		  UXCRPSignupController.verifyEmailInSFDatabase(emailToVerify, function(result, event){
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;
	  }, 
	  fecthContextInfo : function(idParam) {		  
		  var deferred = $q.defer();		  
		  UXCRPSignupController.initializeProfileUpdateInfo(idParam, function(result, event){     
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;
	  }, 
	  //@profile Update
	  
	  //Audit Org
	  getContactDescribe : function() {
		  var deferred = $q.defer();  
		  UXCRPSignupController.describeContact(function(result, event){     
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;		  
	  },  
	  //Audit Org
    }
}) 
uxSignupApp.controller('UXCRPSignupController', ['$scope', 'ContactService','serverData','$http', '$location',
  function($scope, ContactService,serverData,$http, $location) {
    $scope.fields = {};
	//profile update - Start
	$scope.profileUpdateInfoObj = {"isContextFromEmail": false, "isExpired": false, "isURLChanged": false, "isVerified" : false, "emailAssociated": '', "profileUpdateInvitationEmail" : ''};
     
    $scope.data = {
    
      Data_com_Connect_User__c: false,
      AnalyticsToolsOther: false,
	  MarketingToolsOther: false,
      PardotUsingBeforeOther: false, 
      MobileDevicesWorkOther: false,
      Marketing_Cloud_Measure_Success__c: [],
      Service_Cloud_Communication__c: [],
	  Analytics_Other_Prep_Tool__c: [],
      Communities_Community_Types__c: [],
      Wave_Advanced_Analytics_Tools__c: [],
      Wave_Data_Integration_Tools__c: [],
      Wave_Data_Preperation_Tools__c: [],
      Marketing_Interact_with_Mktg_Cloud__c: [],
      Pardot_Using_Before_Pardot__c:[] 	  
    };
	//validateEmail: ''
	$scope.pardotOtherCheckboxesArray ={};
	$scope.anayticsCheckboxesArray = {}; 
	$scope.anayticsCheckboxesArray1 = {}; 
	$scope.anayticsCheckboxesArray2 = {};
	$scope.anayticsCheckboxesArray3 = {};
	$scope.customerServiceCheckboxesArray = {};
	$scope.communityTypeCheckboxesArray = {};
	$scope.AnalyticsOtherCheckboxesArray = {};
	
	$scope.isMobile = false;
	$scope.inFirstPage = 'True';
	
	//reCAPTCHA V2 - Start
	$scope.isUserCaptchaVerified = false;
	$scope.verifyCaptchaErrorMsg = '';		
	$scope.verifyCaptcha = function(userResponse){		
		return serverData.verifyCaptchaUserResponse(userResponse)
		.then(function(result){
			// success code goes here
			result = JSON.parse(result.replace(/&quot;/g, '"'));			
			if(result["success"]) {
				//Used for server-side validation
				$scope.data["isCaptchaVerified"] = true;
				
				//Show form button to submit
				$scope.isUserCaptchaVerified = true;
			}else {
				$scope.data["isCaptchaVerified"] = false;
			} 
			
		}, function(err){
			//error code goes here			 
			$scope.data["isCaptchaVerified"] = false;
		});
	};
	//reCAPTCHA V2 - End
	
	//Audit Org - Changes
	$scope.OptionsSelectedMktgCloud = 0;
	$scope.MaxOptionsSelectableMktgCloud = 3;

	//profile update - Start
	//$scope.profileUpdateInfoObj = {"isContextFromEmail": false, "isExpired": false, "isURLChanged": false, "isVerified" : false, "emailAssociated": '', "profileUpdateInvitationEmail" : ''};							
	$scope.verificationMsg = '';
	$scope.showBlockUI = true;
	$scope.isExpireFlow = false;
	$scope.fillProfileUpdateInfoObj = function(){		
		//Adding javascript method as this version of angular is having issues  with $location
		var urlToParse = location.search;  
		var paramResult = $scope.parseQueryString(urlToParse);  		        	  	
		//Adding javascript method as this version of angular is having issues  with $location
		
		var idParam = paramResult.hasOwnProperty('id') ? decodeURIComponent(paramResult["id"]) : '';     				
		if(paramResult["id"]) {
			return serverData.fecthContextInfo(idParam)
			.then(function(result){
				// success code goes here			
				result = JSON.parse(result.replace(/&quot;/g, '"'));				
				$scope.profileUpdateInfoObj = result;
				$scope.data["Email"] = $scope.profileUpdateInfoObj["emailAssociated"]; 
				$scope.data["associatedContactId"] = $scope.profileUpdateInfoObj["associatedContactId"];    				
				if($scope.profileUpdateInfoObj["isURLChanged"]) {
					//In case of broken link i.e. either used or changed url, initialize "enter email flow"					    
					redirect_signup(false);
				}else if($scope.profileUpdateInfoObj["isExpired"]) {
					//In case of expired link "enter email flow" with expired message					 
					redirect_signup(true);					
				}
				$scope.showBlockUI = false;
			}, function(err){
				//error code goes here				
				$scope.showBlockUI = false;    
			});			
		}else {
			$scope.profileUpdateInfoObj = {"isContextFromEmail": false, "isExpired": false, "isURLChanged": false, "isVerified" : false,
											"emailAssociated": '', "profileUpdateInvitationEmail" : '', "associatedContactId" : ''};
			if(paramResult["flow"] === 'expired') {
				$scope.isExpireFlow = true; 
			}			
			$scope.showBlockUI = false;  
		}    
	};
	
	var testProfileUpdateInfo = $scope.profileUpdateInfoObj["isExpired"] ? ($scope.profileUpdateInfoObj["isExpired"] || $scope.profileUpdateInfoObj["isURLChanged"]) : ($scope.profileUpdateInfoObj["isVerified"] ? $scope.profileUpdateInfoObj["isUserExist"] : true);
	
	console.log('=====$scope.profileUpdateInfoObj====', $scope.profileUpdateInfoObj);
	console.log('=====testProfileUpdateInfo====', testProfileUpdateInfo);
	


	$scope.parseQueryString = function(url) {
	  var urlParams = {};
	  url.replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"),
		function($0, $1, $2, $3) {
		  urlParams[$1] = $3;
		}
	  );
	  
	  return urlParams;
	};
	
	$scope.fillProfileUpdateInfoObj();
	
	$scope.validateEmailInvalid = false;
	$scope.isValidating = false;
	$scope.validateEmail = function() {
		$scope.isValidating = true;
		$scope.checkEmailValidations();
		if(! $scope.validateEmailInvalid) {  
			$scope.validateEmailFromDB($('#validateEmail').val());
			$scope.fUserInvalid = false;
		}else {
			$scope.isValidating = false;
		}
		//console.log('====$scope.isValidating===', $scope.isValidating);
		//console.log('====$scope.profileUpdateInfoObj==final=', $scope.profileUpdateInfoObj);
		//console.log('====$scope.fUserInvalid===', $scope.fUserInvalid);
	};	
	$scope.checkEmailValidations = function() {
		var emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if($('#validateEmail').val() === '' || !emailFormat.test($('#validateEmail').val())){
          $scope.validateEmailInvalid = true;
          window.scrollTo(0,$("#validateEmail").offset().top - 10);          
        } else{
          $scope.validateEmailInvalid = false;
        }
	};
	
	$scope.validateEmailFromDB = function(emailToVerify) {		
		return serverData.verifyEmailInSFDatabase(emailToVerify)
		.then(function(result){
			// success code goes here			
			result = JSON.parse(result.replace(/&quot;/g, '"'));	   
			$scope.profileUpdateInfoObj["isVerified"] = true;
			$scope.profileUpdateInfoObj["isUserExist"] = result["isUserExist"];    
			if(result["emailSentSuccess"]) {								    
				//Show email sent message successfully, please check email - User exist								
				$scope.verificationMsg = "Welcome back! Thanks for taking the time to update your profile details. We've sent an email to you with a link you can use to update your profile.";  
			}else if(result["isUserExist"] && result["emailAlreadySent"]) { 				
				$scope.verificationMsg = "Wonderful! We've already sent you an email. Please check your inbox for next steps.";  
			}else if(result["isUserExist"] && !result["emailSentSuccess"]){				
				//Show some error occurred, please try again   				
				$scope.verificationMsg = "Some error occurred, please try again later!";
			}else if(!result["isUserExist"]) {  				
				$scope.data["Email"] = $scope.data["validateEmail"]; 
				//$scope.profileUpdateInfoObj["isVerified"] = false;
			}
			$scope.isValidating = false;
		}, function(err){
			//error code goes here		
			$scope.isValidating = false;
		});	
		//console.log('====$scope.isValidating===', $scope.isValidating);
		
	};
	console.log('====$scope.profileUpdateInfoObj===', $scope.profileUpdateInfoObj);
	$scope.populateEmailFieldForEmailContext = function() {
		if($scope.profileUpdateInfoObj["isContextFromEmail"]) {
			$scope.data["Email"] = $scope.data["validateEmail"]; 
		}
	}
	//profile update - End 
	
	//Audit Org -
	$scope.picklistFields = {};
	$scope.fetchContactDescribe = function() {		
		return serverData.getContactDescribe()
		.then(function(result){
			// success code goes here			
			result = JSON.parse(result.replace(/&quot;/g, '"'));	   			
			  var fields = {};        			  
			  for (var key in result)  {
				if(result.hasOwnProperty(key)) {  					
					result[key].picklistValues.forEach(function(picklist){
					  picklist.label = replaceSpecialChar(picklist.label);        
					  picklist.value = replaceSpecialChar(picklist.value);    
					});  
					fields[key] = result[key];
				}
			  }
			  $scope.picklistFields = fields;       
		}, function(err){
			//error code goes here  					  
		});			
	};	  
	$scope.fetchContactDescribe();  
	
	$scope.checkUserAdmin = function() {		    
		if($scope.data.Salesforce_User_Type__c == 'System Admin' || $scope.data.Salesforce_User_Type__c == 'End User + Admin') {
			$scope.loadPanel = 'platform';
			$scope.data.UX_Platform_Cloud__c = true;
		}else {   
			$scope.loadPanel = 'default';
			$scope.data.UX_Platform_Cloud__c = false;      
		}
	}
	//Audit Org			
	
    var referralCode = getQueryVariable("rc");
	var lsCode = getQueryVariable("ls");
    $scope.returnedItems =[];
	$scope.returnedCustomItems =[];
	$scope.isAPI;
    if(referralCode != undefined) {
      
      $scope.data.rc = referralCode;
    }
	
	if(lsCode != undefined) {
		
		$scope.data.ls = lsCode;
	}	

    $scope.data.OperatingSystem = navigator.platform;
    $scope.data.BrowserVersion = navigator.userAgent;
	if(window.innerWidth <= 800 && window.innerHeight <= 600) {
		
		$scope.isMobile = true;
	}
	
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    
    var isFirefox = typeof InstallTrigger !== 'undefined';
        
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isChrome = !!window.chrome && !!window.chrome.webstore;
	//var IpAddressFromResponce;
    $scope.data.Browser = isOpera ? 'Opera' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isIE ? 'Internet Explorer' : isChrome ? 'Chrome' : '';
	
/*	console.log('## Called');
	//console.log('DataIP',$scope.data.IpAddress);
	$http.get('https://api.ipify.org').then(function(response) {  

		//console.log('## DataIP : ',$scope.data);
		console.log	('## response',response);
	 });
	 */
	 /*
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "";
	document.getElementsByTagName("head")[0].appendChild(script);

	function DisplayIP(response) {
		
		console.log('## DataIP : ',$scope.data);
		console.log	('## response',response);		
	}

	$scope.callIPAddress = function() {		    
		
		console.log('callIPAddress');
		
	};

	$scope.callIPAddress();
	*/
	/*
	$Scope.callIPAddress = function(){ 		 
		console.log('callIPAddress');
						var ip 
						var script = document.createElement("script");
						script.type = "text/javascript";
						script.src = "https://api.ipify.org?format=jsonp&callback=DisplayIP";
						document.getElementsByTagName("head")[0].appendChild(script);

						function DisplayIP(response) {
							console.log	('response',response);
							IpAddressFromResponce= response.ip;			
			}

		    return	(setTimeout(function DisplayIP() {
				console.log('IPS',IpAddressFromResponce);
					return IpAddressFromResponce;
				}, 1000));
		
		};
		*/

    if((navigator.platform == 'iPad' || navigator.platform == 'iPhone') && navigator.userAgent.indexOf('CriOS') != -1) {

      $scope.data.Browser = 'Chrome';
    }

    $scope.mars = {
      "Marketing_Cloud_Measure_Success__c": [],
	  "Analytics_Other_Prep_Tool__c": [],
      "Service_Cloud_Communication__c": [],
      "Communities_Community_Types__c": [],
      "Wave_Advanced_Analytics_Tools__c": [],
      "Pardot_Using_Before_Pardot__c":[],
      "Wave_Data_Integration_Tools__c": [],
      "Wave_Data_Preperation_Tools__c": [],
      "Marketing_Interact_with_Mktg_Cloud__c":[]
    };

    $scope.config = {
      location: {
        options: {
          types: '(cities)'
        }
      }
    };

    $scope.smartSettings = {
      selectionLimit: 0,
      idProp: "value",
      smartButtonMaxItems: 2,
      smartButtonTextConverter: function(itemText, originalItem) {
        return itemText;
      },
      buttonClasses: "btn btn-default btn-block btn-secondary",
      showCheckAll: false,
      showUncheckAll: false
    }

    $scope.communitiesPlaceholder = {buttonDefaultText: 'Select options'};
    $scope.marketingPlaceholder = {buttonDefaultText: 'Select options'};
    $scope.servicePlaceholder = {buttonDefaultText: 'Select options'};
    $scope.analyticsPlaceholder = {buttonDefaultText: 'Select options'};  
    $scope.pardotPlaceholder = {buttonDefaultText: 'Select options'};
    $scope.toolsPlaceholder = {buttonDefaultText: 'Select options'};

    var prod_panel_map = {
      "UX_Sales_Cloud__c" : "sales",
      "UX_Service_Cloud__c" : "service",
      "UX_Marketing_Cloud__c" : "marketing",
      "UX_Pardot__c" :"pardot",
      "UX_Chatter__c" : "chatter",
      "UX_Community_Cloud__c" : "communities",
      "UX_Platform_Cloud__c" : "platform",
      "Wave_Analytics_Cloud__c" : "analytics",
      "UX_IoT_Cloud__c" :"IoT",
	  "UX_Commerce_Cloud__c" : "commerce",
	  "UX_Essentials__c" : "essentials",
	  "UX_Einstein__c" : "sEinstein", 
      "UX_Heroku__c" : "heroku",
	  "UX_Mulesoft__c" : "mulesoft",
	  "UX_Salesforce_Mobile_App__c" : "salesforcemobileapp",
	  "UX_Industries__c" : "industries",
	  "UX_Salesforce_org__c" : "salesforceorg"
    }

    var panel_prod_map = {
       "sales" : "UX_Sales_Cloud__c",
       "service" : "UX_Service_Cloud__c",
       "marketing" : "UX_Marketing_Cloud__c",
       "pardot" : "UX_Pardot__c",
       "chatter" : "UX_Chatter__c",
       "communities" : "UX_Community_Cloud__c",
       "platform" : "UX_Platform_Cloud__c",
       "analytics" : "Wave_Analytics_Cloud__c",
       "IoT" : "UX_IoT_Cloud__c",
	   "commerce" : "UX_Commerce_Cloud__c",
	   "essentials" : "UX_Essentials__c",
	   "sEinstein" : "UX_Einstein__c",
	   "heroku" : "UX_Heroku__c",
	   "mulesoft" : "UX_Mulesoft__c",
	   "salesforcemobileapp" : "UX_Salesforce_Mobile_App__c",
	   "industries" : "UX_Industries__c",
	   "salesforceorg" : "UX_Salesforce_org__c"
    }

    for(var x in prod_panel_map){
      $scope.data[x] = false;
    }
	
	$scope.moveToProd = function() {
		
		$('#prodCatalogsContainer').focus();
	}

    $scope.selectProduct = function(prod){

    
      if($scope.data[prod]){
      
        $scope.togglePanel(prod_panel_map[prod]);
      } else{
        
        if($scope.loadPanel == prod_panel_map[prod]){
          $scope.loadPanel = 'default';
        }
      }
	   
    };

    $scope.loadPanel = 'default';

    $scope.togglePanel = function(name){
      if($scope.loadPanel == name){
        $scope.loadPanel = 'default';
      } else{
        $scope.loadPanel = name;
        $scope.data[panel_prod_map[name]] = true;
      }
	  
    }

    
    // get the metadata for fields
    ContactService.describe()
    .then(function(result) {
      var fields = {};        
      result.fields.forEach(function(field) {         
        if(field.type == 'picklist' || field.type == 'multipicklist') {  

           field.picklistValues.forEach(function(picklist){

            
              picklist.label = replaceSpecialChar(picklist.label);
              picklist.value = replaceSpecialChar(picklist.value);    
           });          
        }
        fields[field.name] = field;
  
      });
      $scope.fields = fields;
      

    }, function(error) {
      // TODO: HANDLE THIS
    });     

	    
    $scope.checkForSalesForceUser = function() {

       if($('#isSalesforceUser').is(':checked')) {

           $scope.data.UX_SFDC_User__c = 'Yes';
       }
       else {

           $scope.data.UX_SFDC_User__c = 'No';
       }
       
    }

    if($scope.data.UX_SFDC_User__c == 'No') {

      $scope.IsSFUser = false;
       
    }

    
    $scope.IsSalesForceUser = false;
    $scope.fEmployeeInvalid = false;
    $scope.fRoleInvalid = false;
    $scope.fIndustryInvalid = false;
    $scope.fUserInvalid = false;
	
	/*Audit Org changes */
	$scope.salesPeriodOtherInvalid	= false;
	$scope.salesPeriodInvalid = false;
	$scope.leadsPerSalesPeriodInvalid = false;
	$scope.oppsPerSalesPeriodInvalid = false;
	/*Audit Org Changes */
	
  
    /* Changes by Endiem Offshore*/
    $scope.fNameInvalid = false;
	$scope.fCommereFeature = false;
    $scope.fCompanyInvalid = false;
    $scope.fIndustryOtherInvalid = false;
    $scope.fDepartmentInvalid = false;
    $scope.fTitleInvalid = false;
    $scope.fUserRoleOtherInvalid = false;
    $scope.fWorkEmailInvalid = false;
    $scope.fPhoneInvalid = false;
    $scope.fLocationInvalid = false;
    $scope.fUserTypeOtherInvalid = false;
    $scope.fPardotUsingBeforeOtherInvalid = false;
    $scope.fCommunityInvolvementOtherInvalid = false;
    $scope.fInteractWithMarketingCloudOtherInvalid = false;
    $scope.fcustomAgreementInvalid = false;
    $scope.fLeadSourceInvalid = false;
	$scope.customAgreement = false;
	$scope.fUserTypeInvalid = false;
	$scope.fAdminPersonaInvalid = false;
	$scope.eFrequencyOtherInvalid = false;
	$scope.eRoleOtherInvalid = false;
	$scope.eOtherInvalid = false;
	
	
	$scope.pursueLeads = {
        //radioValue: 'false'
    };

    $scope.selectedSFUserOption = function() {

       
        if($scope.data.UX_SFDC_User__c =='Yes') {

            $scope.IsSalesForceUser = true;
        }
        else {

          $scope.IsSalesForceUser = false;
        }
    }


    $scope.submitData = function() {
      
    
	    submitDataToSFDC();
   
    }
 
	$scope.checkForPardotUsingOther =function(pardotValue){ 		
		if(pardotValue == 'Other'){
			if($scope.data.PardotUsingBeforeOther == true) {				
				$scope.data.PardotUsingBeforeOther = false;  				
			}
			else {				
				$scope.data.PardotUsingBeforeOther = true;  
			}
		}
		
	}
	$scope.checkForAnalyticsUsingOther =function(analticValue){
		if(analticValue =='Other'){
			if($scope.data.AnalyticsToolsOther == true) {
				
				$scope.data.AnalyticsToolsOther = false;
				
			}
			else {
				
				$scope.data.AnalyticsToolsOther = true;
			}
		}   
	
	}
	
	$scope.checkForMarketingOther =function(analticValue){		    
		if(analticValue == 'Other (please specify)'){    			
			if($scope.data.MarketingToolsOther == true) {  				
				$scope.data.MarketingToolsOther = false;	  			
			}   
			else {     				
				$scope.data.MarketingToolsOther = true;
			}
		}
		
		//Max 3 options selectable logic   
		if($scope.anayticsCheckboxesArray3[analticValue]) {  
			$scope.OptionsSelectedMktgCloud++;
		}else {
			$scope.OptionsSelectedMktgCloud--;
		}
		
		var result = document.getElementsByClassName("mktgCloudOptions");
		//var wrappedResult = angular.element(result); removeAttribute
		
		//When 3 selected disable the non selected options
		if($scope.OptionsSelectedMktgCloud == $scope.MaxOptionsSelectableMktgCloud) {
			for(var i = 0; i < result.length; i++) {
				if(!result[i].checked) {
					result[i].setAttribute('disabled', true);      
				}
			}			
		}else {
			for(var i = 0; i < result.length; i++) {				
					result[i].removeAttribute('disabled');
			}			
		}	    
	}
	
  $scope.getLocation = function(val) {

   
     return $http.get('LocationJSONGenerator?Key='+val).
                success(function(data, status) {
                  
                  $scope.states = data;
                  $scope.ajaxClass = '';
                  
                  return $scope.states;
            
    }) ;  

  }
   
  $scope.getLocation3 = function(val) {
  
    return $http.get('LocationJSONGenerator', {
      params: {
        Key: val
        
      }
    }).then(function(response){
		

     var arr=[];
           for(var key in response.data){
            arr[key] = response.data[key];
      }

      return arr;
    });
  };
    
	$scope.getLocation = function(val) {
		var isCustom;
		$scope.isAPI ='';
		return serverData.getIsCustom()
		.then(function(result){  
				
			isCustom = result;
			
			if(isCustom == false) {
				return $http.get('//maps.googleapis.com/maps/api/geocode/json',{
			
					params: {
						address: val
					}
			
				}).then(function(response){
					
					
					$scope.returnedItems =[];
					return response.data.results.map(function(item){
					 
					
					$scope.returnedItems.push(item);
					
					$scope.isAPI = 'true';
					return item.formatted_address;
					 });
					
				},function(err){	
					console.log('--err--->', err);
					return serverData.getLocations(val)
					.then(function(result){  
					  
					  var arr=[];
					   for(var key in result){
						arr[key] = result[key];
						}
			  
					  
					   $scope.returnedCustomItems = arr;
					 
					   $scope.isAPI = 'false';
					   return arr; 

					

					}, function(err){
					console.log('--err--->', err);
					});
				});
			}
			else if(isCustom == true) {
				
				return serverData.getLocations(val)
					.then(function(result){  
					
					  var arr=[];
					   for(var key in result){
						arr[key] = result[key];
						}  
			  
					   $scope.returnedCustomItems = arr;
					 
					   $scope.isAPI = 'false';
					   return arr; 

				}, function(err){
				console.log('--err--->', err);
				});
			}
		});
	}
 
   function submitDataToSFDC() {
		var validFirstPage = true; 
		var validSecondPage = true;
		var movedToSecondPage = false;
		var emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		$scope.data.Service_Cloud_Communication__c = '';
		$scope.data.Analytics_Other_Prep_Tool__c = '';
		$scope.data.Marketing_Cloud_Measure_Success__c = '';
		$scope.data.Communities_Community_Types__c = '';
		$scope.data.Wave_Advanced_Analytics_Tools__c = '';
		$scope.data.Pardot_Using_Before_Pardot__c = '';
		$scope.data.Wave_Data_Integration_Tools__c = '';
		$scope.data.Wave_Data_Preperation_Tools__c = '';
    	$scope.data.Marketing_Interact_with_Mktg_Cloud__c = '';

		//console.log('===IN submitDataToSFDC===', $scope.fUserInvalid); 
		if($('#fUserSalesforce').val() === '?' || $('#fUserSalesforce').val() == null){         
		  $scope.fUserInvalid = true;
		  if(validFirstPage) window.scrollTo(0,$("#fUserSalesforce").offset().top - 10);
		  validFirstPage = false;
		} else{
		  $scope.fUserInvalid = false; 
		}
		//console.log('===fUserInvalid===', $scope.fUserInvalid);
	  
	  
      //Perform some form validations on the first page, or if this isn't a Salesforce User
      if ($scope.data.UX_SFDC_User__c == 'Yes' && $('#firstPageMenu').hasClass('slds-is-active') || $scope.data.UX_SFDC_User__c == 'No') {
       
		/* Changes by Endiem Offshore*/
		if($('#fName').val() === '' || $('#fName').val() === 'First' || $('#lName').val() === '' || $('#lName').val() === 'Last'){
          $scope.fNameInvalid = true;
          window.scrollTo(0,$("#fName").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fNameInvalid = false;
        }
    
		if($('#fCompany').val() === '' || $('#fCompany').val() === 'Please enter your company name'){
          $scope.fCompanyInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fCompany").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fCompanyInvalid = false;
        }
    
		if($('#fIndustry').val() === '?'){
          $scope.fIndustryInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fIndustry").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fIndustryInvalid = false;
        }
		
		if($scope.data.Industry__c == 'Other' && ($('#fIndustryOther').val() === '' || $('#fIndustryOther').val() === 'Please describe your Company\'s Industry')){
          $scope.fIndustryOtherInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fIndustryOther").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fIndustryOtherInvalid = false;
        }
		
		if($('#bModel').val() === '?'){
          $scope.bModelInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#bModel").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.bModelInvalid = false;
        }
		
		if($scope.data.Business_Model__c == 'Other' && ($('#bModelOther').val() === '' || $('#bModelOther').val() === 'Please describe your Company\'s business model')){
          $scope.bModelOtherInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#bModelOther").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.bModelOtherInvalid = false;
        }
		
		
    
		if($('#fEmployees').val() === '?'){
          $scope.fEmployeeInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fEmployees").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fEmployeeInvalid = false;
        }
    
		if($('#IsSalesForcePartner').val() === 'Yes'){
			if($('#SalesForcePartnerType').val() === '') {
				$scope.fpartnerInvalid = true;
				if(validFirstPage) window.scrollTo(0,$("#IsSalesForcePartner").offset().top - 10);
				validFirstPage = false;
			}
			else {
				$scope.fpartnerInvalid = false;
			}
        } else{
          $scope.fpartnerInvalid = false;
        }
    
    
		if($('#fTitle').val() === '' || $('#fTitle').val() === 'Please enter your work title'){
          $scope.fTitleInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fTitle").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fTitleInvalid = false;
        }
    
		if($('#fRole').val() === '?'){
          $scope.fRoleInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fRole").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fRoleInvalid = false;
        }
    
		if($scope.data.User_Role__c == 'Other' && ($('#fUserRoleOther').val() === '' || $('#fUserRoleOther').val() === 'Please describe your role')){
          $scope.fUserRoleOtherInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fUserRoleOther").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fUserRoleOtherInvalid = false;
        }
    
		if($('#fWorkEmail').val() === '' || !emailFormat.test($('#fWorkEmail').val())){//$('#fWorkEmail').val() === 'johndoe@company.com'){
          $scope.fWorkEmailInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#fWorkEmail").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fWorkEmailInvalid = false;
        }
    
		
		
		if( $("#fLocation").val() == null || $("#fLocation").val() =='' || $("#fLocation").val() == undefined){
			
          $scope.fLocationInvalid = true;
		  
          if(validFirstPage) window.scrollTo(0,$("#fLocation").offset().top - 10);
          validFirstPage = false;
        } else{
			
		  
          $scope.fLocationInvalid = false;
        }
    		if($scope.customAgreement == false || $scope.customAgreement == null){
         
          $scope.fcustomAgreementInvalid = true;
          if(validFirstPage) window.scrollTo(0,$("#agreement").offset().top - 10);
          validFirstPage = false;
        } else{
          $scope.fcustomAgreementInvalid = false; 
		}
  
  
     }
	 
	  if ($scope.data.UX_SFDC_User__c == 'Yes' && $('#secondPageMenu').hasClass('slds-is-active')) {
		
		if($('#fInteract').val() === '?' || $('#fInteract').val() === null ||  $('#fInteract').val() === '? undefined:undefined ?'){
          $scope.fUserTypeInvalid = true;
          if(validSecondPage) window.scrollTo(0,$("#fInteract").offset().top - 10);
          validSecondPage = false;
        } else{
          $scope.fUserTypeInvalid = false;
		}
   
		if($scope.data.Salesforce_User_Type__c === 'Other' && ($('#fSalesforceUserTypeOther').val() === '' || $('#fSalesforceUserTypeOther').val() === 'Please describe the way you interact with Salesforce')){
          $scope.fUserTypeOtherInvalid = true;
         
          if(validSecondPage)window.scrollTo(0,$("#fSalesforceUserTypeOther").offset().top - 10);
          validSecondPage = false;
        } else{
    
          $scope.fUserTypeOtherInvalid = false;
        
		}
		
		if($scope.data.Einstein_Interaction_Frequency__c === 'Other' && ($('#eFrequencyOther').val() === '' || $('#eFrequencyOther').val() === 'Please specify other value')){
          $scope.eFrequencyOtherInvalid = true;
          $("#eFrequencyOtherError").removeClass('hideErrorOnLoad');
          if(validSecondPage)window.scrollTo(0,$("#eFrequencyOther").offset().top - 10);
          validSecondPage = false;
        } else{
	      $("#eFrequencyOtherError").addClass('hideErrorOnLoad');
          $scope.eFrequencyOtherInvalid = false;
        
		}
		
		if($scope.data.Essentials_Other__c && ($('#eOther').val() === '' || $('#eOther').val() === 'Please describe other Essentials')){
          $scope.eRoleOtherInvalid = true;
          $("#eOtherError").removeClass('hideErrorOnLoad');
          if(validSecondPage)window.scrollTo(0,$("#eOther").offset().top - 10);
          validSecondPage = false;
        } else{
		  $("#eOtherError").addClass('hideErrorOnLoad');
          $scope.eRoleOtherInvalid = false;
        
		}
		
		if($scope.data.Einstein_Role_with_Einstein__c === 'Other' && ($('#eRoleOther').val() === '' || $('#eRoleOther').val() === 'Please specify other role')){
          $scope.eRoleOtherInvalid = true;
          $("#eRoleOtherError").removeClass('hideErrorOnLoad');
          if(validSecondPage)window.scrollTo(0,$("#eRoleOther").offset().top - 10);
          validSecondPage = false;
        } else{
		  $("#eRoleOtherError").addClass('hideErrorOnLoad');
          $scope.eRoleOtherInvalid = false;
        
		}
		
		
		
		/* How Long is your sales period*/
/*		if($('#salesPeriod').val() === '?' || $('#salesPeriod').val() === null ||  $('#salesPeriod').val() === '? undefined:undefined ?'){
          $scope.salesPeriodInvalid = true;
          if(validSecondPage) window.scrollTo(0,$("#salesPeriod").offset().top - 10);
          validSecondPage = false;
        } else{
          $scope.salesPeriodInvalid = false;
		}
		
		
*/		
		

		if($scope.data.Sales_Period__c === 'Other' && ($('#salesPeriodOther').val() === '' || $('#salesPeriodOther').val() === 'Please describe your sales period')){
          $scope.salesPeriodOtherInvalid = true;
         
          if(validSecondPage)window.scrollTo(0,$("#salesPeriodOther").offset().top - 10);
          validSecondPage = false; 
        } else{
    
          $scope.salesPeriodOtherInvalid = false;
        
		}	

		
		/* How Long is your sales period*/
		 
		/* How many leads in your sales period*/		
/*		if($('#leadsPerSalesPeriod').val() === '?' || $('#leadsPerSalesPeriod').val() === null ||  $('#leadsPerSalesPeriod').val() === '? undefined:undefined ?'){
          $scope.leadsPerSalesPeriodInvalid = true;
          if(validSecondPage) window.scrollTo(0,$("#leadsPerSalesPeriod").offset().top - 10);
          validSecondPage = false;       
        } else{
          $scope.leadsPerSalesPeriodInvalid = false;
		}	
*/		
		/* How many leads in your sales period*/
		  
		/* How many opps in your sales period*/		
/*		if($('#oppsPerSalesPeriod').val() === '?' || $('#oppsPerSalesPeriod').val() === null ||  $('#oppsPerSalesPeriod').val() === '? undefined:undefined ?'){
          $scope.oppsPerSalesPeriodInvalid = true;
          if(validSecondPage) window.scrollTo(0,$("#oppsPerSalesPeriod").offset().top - 10); 
          validSecondPage = false;       
        } else{
          $scope.oppsPerSalesPeriodInvalid = false;    
		}	  
		
		/* How many opps in your sales period*/		
		
		if($scope.data.Admin_Persona_Custom_Fields__c != null) {
			
			if($scope.data.Admin_Persona_Page_Layouts__c == null || $scope.data.Admin_Persona_Workflow_rules__c == null || $scope.data.Admin_Persona_Formula_Fields__c == null || $scope.data.Admin_Persona_AppExchange__c == null|| $scope.data.Admin_Persona_Approval_Processes__c == null || $scope.data.Admin_Persona_Visualforce__c == null) {
				
				$scope.fAdminPersonaInvalid = true;
				if(validSecondPage)window.scrollTo(0,$("#adminTable").offset().top - 10);
					validSecondPage = false;
				
			}
		}
		else if($scope.data.Admin_Persona_Page_Layouts__c != null) {
			
			if($scope.data.Admin_Persona_Custom_Fields__c == null || $scope.data.Admin_Persona_Workflow_rules__c == null|| $scope.data.Admin_Persona_Formula_Fields__c == null || $scope.data.Admin_Persona_AppExchange__c == null|| $scope.data.Admin_Persona_Approval_Processes__c == null || $scope.data.Admin_Persona_Visualforce__c == null) {
				
				$scope.fAdminPersonaInvalid = true;
				if(validSecondPage)window.scrollTo(0,$("#adminTable").offset().top - 10);
					validSecondPage = false;
			}
		}
		else if($scope.data.Admin_Persona_Workflow_rules__c != null) {
			
			if($scope.data.Admin_Persona_Custom_Fields__c == null || $scope.data.Admin_Persona_Page_Layouts__c == null || $scope.data.Admin_Persona_Formula_Fields__c == null || $scope.data.Admin_Persona_AppExchange__c == null || $scope.data.Admin_Persona_Approval_Processes__c == null || $scope.data.Admin_Persona_Visualforce__c == null) {
				
				
				$scope.fAdminPersonaInvalid = true;
			    if(validSecondPage)window.scrollTo(0,$("#adminTable").offset().top - 10);
					validSecondPage = false;
			}
		}
		else if($scope.data.Admin_Persona_Formula_Fields__c != null) {
			if($scope.data.Admin_Persona_Custom_Fields__c == null || $scope.data.Admin_Persona_Page_Layouts__c == null || $scope.data.Admin_Persona_Workflow_rules__c == null || $scope.data.Admin_Persona_AppExchange__c == null || $scope.data.Admin_Persona_Approval_Processes__c == null || $scope.data.Admin_Persona_Visualforce__c == null) {
				
					
				$scope.fAdminPersonaInvalid = true;
				if(validSecondPage)window.scrollTo(0,$("#adminTable").offset().top - 10);
					validSecondPage = false;
			}
		}
		else if($scope.data.Admin_Persona_AppExchange__c != null) {
			if($scope.data.Admin_Persona_Custom_Fields__c == null || $scope.data.Admin_Persona_Page_Layouts__c == null || $scope.data.Admin_Persona_Workflow_rules__c == null || $scope.data.Admin_Persona_Formula_Fields__c == null || $scope.data.Admin_Persona_Approval_Processes__c == null || $scope.data.Admin_Persona_Visualforce__c == null) {
				
					
				$scope.fAdminPersonaInvalid = true;
				if(validSecondPage)window.scrollTo(0,$("#adminTable").offset().top - 10);
					validSecondPage = false;
			}
		}
		else if($scope.data.Admin_Persona_Approval_Processes__c != null) {
			if($scope.data.Admin_Persona_Custom_Fields__c == null || $scope.data.Admin_Persona_Page_Layouts__c == null || $scope.data.Admin_Persona_Workflow_rules__c == null || $scope.data.Admin_Persona_Formula_Fields__c == null || $scope.data.Admin_Persona_AppExchange__c == null || $scope.data.Admin_Persona_Visualforce__c == null) {
				
					
				$scope.fAdminPersonaInvalid = true;
				if(validSecondPage)window.scrollTo(0,$("#adminTable").offset().top - 10);
					validSecondPage = false;
			}
		}
		else if($scope.data.Admin_Persona_Visualforce__c != null) {
			if($scope.data.Admin_Persona_Custom_Fields__c == null || $scope.data.Admin_Persona_Page_Layouts__c == null || $scope.data.Admin_Persona_Workflow_rules__c == null || $scope.data.Admin_Persona_Formula_Fields__c == null || $scope.data.Admin_Persona_AppExchange__c == null || $scope.data.Admin_Persona_Approval_Processes__c == null) {
				
					
				$scope.fAdminPersonaInvalid = true;
				if(validSecondPage)window.scrollTo(0,$("#adminTable").offset().top - 10);
					validSecondPage = false;
			}
		}
		else {
			
			$scope.fAdminPersonaInvalid = false;
		}
		
		if($scope.pursueLeads.radioValue == 'true') {
			
			$scope.data.Sales_Cloud_Pursue_Leads__c = true;
			
		}
		
		var cusid_ele = document.getElementsByClassName('custmerServiceCheckboxesFrMultiPicklist');
		
		
		var inLoopVar = '';
		
		angular.forEach($scope.pardotOtherCheckboxesArray, function(value, key) {
			
			if(value == true)
				$scope.data.Pardot_Using_Before_Pardot__c+= key+';';
		});
		
		angular.forEach($scope.anayticsCheckboxesArray, function(value, key) {
			
			if(value == true)
				$scope.data.Wave_Advanced_Analytics_Tools__c += key+';';
		}); 
		
		angular.forEach($scope.anayticsCheckboxesArray1, function(value, key) {
			
			if(value == true)
				$scope.data.Wave_Data_Integration_Tools__c += key+';'; 
		});	 
     
		angular.forEach($scope.anayticsCheckboxesArray2, function(value, key) {  
			
			if(value == true)   
				$scope.data.Wave_Data_Preperation_Tools__c += key+';';   
		}); 

		angular.forEach($scope.anayticsCheckboxesArray3, function(value, key) {			  
			if(value == true)
				$scope.data.Marketing_Interact_with_Mktg_Cloud__c += key+';';      
		});
		
		angular.forEach($scope.communityTypeCheckboxesArray, function(value, key) {
		
			if(value == true)
				$scope.data.Communities_Community_Types__c += key+';';
		});
		
		angular.forEach($scope.AnalyticsOtherCheckboxesArray, function(value, key) {
		
			if(value == true)
				$scope.data.Analytics_Other_Prep_Tool__c += key+';';
		});
		
		angular.forEach($scope.customerServiceCheckboxesArray, function(value, key) {
			
			if(value == true)
				$scope.data.Service_Cloud_Communication__c += key+';';
		});
		
		
    }
      
	 //If this is a Salesforce User and we're on the first page, and it's valid, then show the second page
     if($scope.data.UX_SFDC_User__c == 'Yes' && $('#firstPageMenu').hasClass('slds-is-active') && validFirstPage){
        $('#secondPageMenu').addClass('slds-is-active');
		$('#firstPageMenu').removeClass('slds-is-active');
		$('#form1Container').addClass('slds-hide');
		$('#form2Container').removeClass('slds-hide');
		
        window.scrollTo(0,0);
        movedToSecondPage = true; //Prevents the next IF statement from executing so we only do the redirect, not the full submission
    }
    
   
     
      //If either this is a Salesforce User on the second page, or a non-Salesforce user and the first page is valid, do the submission
    if(($scope.data.UX_SFDC_User__c == 'Yes' && $('#secondPageMenu').hasClass('slds-is-active') && movedToSecondPage == false && validSecondPage== true) || ($scope.data.UX_SFDC_User__c == 'No' && validFirstPage)) {

        $scope.isSaving = true;
		
		console.log('===$scope.isAPI==',$scope.isAPI);
		console.log('===address==',address);

		if($scope.isAPI  == 'true') {
			
		  //Changes by Endiem Offshore
			
			var city = $(".locality").text();
			var state = $(".region").text();
			var country = $(".country-name").text();
			var address;
			
			console.log('======city-===', city);
			console.log('======state-===', state);
			console.log('======country-===', country);
			console.log('======$scope.returnedItems-===', $scope.returnedItems);
			
			for(var i=0; i<$scope.returnedItems.length; i++) {
				
				if($scope.returnedItems[i].formatted_address ==  $scope.location)
				  address = $scope.returnedItems[i].address_components;
			}
			
			for(var i=0; i<address.length; i++) {
			  
			  if(address[i].types[0] == 'locality') {
				
				$scope.data.City_Long = address[i].long_name;
				$scope.data.City_Short = address[i].short_name;
			  }
			  if(address[i].types[0] == 'administrative_area_level_1') {
				
				$scope.data.State_Long = address[i].long_name;
				$scope.data.State_Short = address[i].short_name;
			  }
			  if(address[i].types[0] == 'country') {
			  
				$scope.data.Country_Long = address[i].long_name;
				$scope.data.Country_Short = address[i].short_name;
			  }
			}
      
			if($scope.data.Country_Long == null || $scope.data.Country_Short == null) {
			
				$scope.data.Country_Long = country;
			}
      

		
		}
		else if($scope.isAPI =='false') {
			var address;
			
			console.log('======$scope.location======',$scope.location);
			address =  $scope.location.split(",");
			console.log('===address====',address);
			$scope.data.City_Long = address[0];
			$scope.data.State_Long = address[1];
			$scope.data.Country_Long = address[2];
		
			console.log('=====$scope.data.City_Long=====', $scope.data.City_Long);
			console.log('=====$scope.data.State_Long=====', $scope.data.State_Long);
			console.log('=====$scope.data.Country_Long=====', $scope.data.Country_Long);
			
		}
      
        /* Referral stuff went here */
		
        ContactService.create($scope.data)
        .then(function(data) {			
           redirect_thankyou();   
        }, function(error) {			
			//reCAPTCHA V2   
			if(error["foundError"] && error["foundError"] == 'Please verify captcha first' ) {
				$scope.verifyCaptchaErrorMsg = error["foundError"];
			}else {
				redirect_thankyou();
			}            
        });
      }  
  }
  
  function replaceSpecialChar(picklistValue) {

    
    picklistValue = picklistValue.replace(new RegExp('&#39;', 'g'), '\'');
    picklistValue = picklistValue.replace(new RegExp('&#33;', 'g'), '\!');
    picklistValue = picklistValue.replace(new RegExp('&#34;', 'g'), '\"');
    picklistValue = picklistValue.replace(new RegExp('&#35;', 'g'), '\#');
    picklistValue = picklistValue.replace(new RegExp('&#36;', 'g'), '\$');
    picklistValue = picklistValue.replace(new RegExp('&#37;', 'g'), '\%');
    picklistValue = picklistValue.replace(new RegExp('&#38;', 'g'), '\&');
    picklistValue = picklistValue.replace(new RegExp('&#40;', 'g'), '\(');
    picklistValue = picklistValue.replace(new RegExp('&#41;', 'g'), '\)');
    picklistValue = picklistValue.replace(new RegExp('&#42;', 'g'), '\*');
    picklistValue = picklistValue.replace(new RegExp('&#43;', 'g'), '\+');
    picklistValue = picklistValue.replace(new RegExp('&#44;', 'g'), '\,');
    picklistValue = picklistValue.replace(new RegExp('&#45;', 'g'), '\-');
    picklistValue = picklistValue.replace(new RegExp('&#46;', 'g'), '\.');
    picklistValue = picklistValue.replace(new RegExp('&#47;', 'g'), '\/');
    picklistValue = picklistValue.replace(new RegExp('&lt;', 'g'), '\<');
    picklistValue = picklistValue.replace(new RegExp('&gt;', 'g'), '\>');
	picklistValue = picklistValue.replace(new RegExp('&amp;', 'g'), '\&');
   
      return picklistValue;
    }

   function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    
    for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return decodeURIComponent(pair[1]); 
    }
    }
   }
  
    function redirect_thankyou(){
		
      $scope.isSaving = false;
        window.location.assign($scope.thankyou);
        window.location.href = $scope.thankyou; 
    }
	
    function redirect_signup(isExpiredFlow){
	  var flowURL = $scope.signupPage;
	  if(isExpiredFlow) {
		flowURL+='?flow=expired';
	  }
	  window.location.assign(flowURL); 			
	  window.location.href = flowURL;				
    }	

    $scope.multiSelFormatter = function(multiArr){  
     
      var arrString = '';   
      for(var y in multiArr) {
        if(multiArr[y].id != undefined) {
          arrString += multiArr[y].id + ';';
        }
        
      }
     
      return arrString;
    }

    $scope.msehAnalyticsTools = {
      onItemSelect: function(item) {
        for(var x in item) {
          if(item[x] === 'Other') {
            $scope.data.AnalyticsToolsOther = true;
          }
        }
      },
      onItemDeselect: function(item) {
        for(var x in item) {
          if(item[x] === 'Other') {
            $scope.data.AnalyticsToolsOther = false;
          }
        }
      }
    };
  
     $scope.pardotBefore = {
      onItemSelect: function(item) {
        for(var x in item) {
          if(item[x] === 'Other') {
            $scope.data.PardotUsingBeforeOther = true;
          }
        }
      },
      onItemDeselect: function(item) {
        for(var x in item) {
          if(item[x] === 'Other') {
            $scope.data.PardotUsingBeforeOther = false;
          }
        }
      }
    };
    
}]);