'use strict';

var uxSignupApp = angular.module('uxSignupApp', [ 'ngRemote', 'ngAnimate']);

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
	  verifyCaptchaUserResponse : function(userResponse) {		  
		  var deferred = $q.defer();
		  EventsController.verifyCaptchaUserResponse(userResponse, function(result, event){
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;
	  }
    }
})

uxSignupApp.controller('EventsController', ['$scope', 'ContactService', 'serverData',
  function($scope, ContactService, serverData) {
    $scope.fields = {};
    $scope.data = {};
  
    $scope.loadPanel = 'default';
	
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
	
	$scope.fetchFields = function(){		
		return $scope.fields; 
	};
	//reCAPTCHA V2 - End
	
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
           if(field.type == 'multipicklist')
		   { 
				var fullDomId = '#fDynPickDyn'+field.name;
				if($(fullDomId).length > 0)
				{
					var multiListDataALJS = [];
					var domIdToPicklistVal = {};
				   var selectedItems = [];
				   field.picklistValues.forEach(function(picklist){ 
					// problem here is, pikclist value is applied as multiselect's li domId. Salesforce picklist value is can't be used as dom Id.
					//So, we need to replace all the special characters + space and maintaining seperate map to store domId to PickVal 
					var multiPickEachDomId = picklist.value.replace(/_/g, ''); 
					multiPickEachDomId = multiPickEachDomId.replace(/[^\w]/gi, '');
					multiListDataALJS.push({'id' : multiPickEachDomId, 'label' : picklist.label});
					 domIdToPicklistVal[multiPickEachDomId] = picklist.value;
				   });  
				   field.domIdToPicklistVal = domIdToPicklistVal;     
					 
				   $(fullDomId).multiSelect({  
					unselectedItems: multiListDataALJS  
					}); 
				} 
			   
		   }			     
        }
		
		if(field.type == 'date') {  
			var fullDomId = '#fDynDt'+field.name;
			if($(fullDomId).length > 0)
			{
			   $(fullDomId).datepicker({
					numYearsBefore: 100,
					numYearsAfter: 50,
					format: 'MM/DD/YYYY' 
				}); 
			}  
		}
        fields[field.name] = field;
  
      }); 
		
		
      // set the field metadata in scope
      $scope.fields = fields;
    }, function(error) {
	  //reCAPTCHA V2				
		if(error["foundError"]) {
			$scope.verifyCaptchaErrorMsg = error["foundError"];
		} 
    });
     
	
  $scope.fEmployeeInvalid = false;
  $scope.fNameInvalid = false;
  $scope.fCompanyInvalid = false;
  $scope.fTitleInvalid = false;
  $scope.fWorkEmailInvalid = false;

  $scope.submitData = function(eventNumber) {
  submitDataToSFDC(eventNumber);
  }
  
  function submitDataToSFDC(eventNumber) {
    var validFirstPage = true;
    var movedToSecondPage = false; 

	for (var key in $scope.fields){
		if (typeof $scope.fields[key] !== 'function') { 
			var field = $scope.fields[key]; 
			if(field.type == 'multipicklist') {   
				var fullDomId = '#fDynPickDyn'+field.name;				
				if($(fullDomId).length > 0)
				{
					var selectedItems = $(fullDomId).multiSelect('getSelectedItems'); 
					var mData = ''; 
					for(var aIndex=0; aIndex < selectedItems.length; aIndex++)
					{
						mData +=  field.domIdToPicklistVal[selectedItems[aIndex].id] + ';';
					}   
					
					if(mData != '')  
					{
						mData = mData.substring(0, mData.length - 1);
					}  
					$scope.data[field.name] = mData;     
			   }			   
			}
			if(field.type == 'date') 
			{  
				var fullDomId = '#fDynDt'+field.name;
				if($(fullDomId).length > 0) 
				{
				   var dateVal = $(fullDomId).datepicker('getDate'); 
				   var actualDate;;
				   
				   if(dateVal._isAMomentObject == true)
				   {
					    actualDate = moment(dateVal._d).format('DD/MM/YYYY');
				   }
				   else 
				   {
					   actualDate = "";
				   }
				   
				   // When you load the events page and immediately click on submit without filling anything, dateVal appears as dom element instead of moment 
				   // Actual blank value should be just blank 
				   // When date is present, moment is returned 
				   $scope.data[field.name] = actualDate;     
				}  
			}
		}
	}
  
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
	
	if($('#fTitle').val() === '' || $('#fTitle').val() === 'Please enter your title'){
      $scope.fTitleInvalid = true;
      if(validFirstPage) window.scrollTo(0,$("#fTitle").offset().top - 10);
      validFirstPage = false;
    } else{
      $scope.fTitleInvalid = false;
    }
	
    if($('#fWorkEmail').val() === '' || $('#fWorkEmail').val() === 'johndoe@company.com' || !isValidEmailAddress($('#fWorkEmail').val())){
      $scope.fWorkEmailInvalid = true;
      if(validFirstPage) window.scrollTo(0,$("#fWorkEmail").offset().top - 10);
      validFirstPage = false;
    } else{
      $scope.fWorkEmailInvalid = false;
    }
    /* START - Validation for the fieldset fields - Added by Endiem offshore */
	$('[id^="fDyntrue"]').each(function( index ) {
	  var isBlank = false;
	  //console.log( index + ": " + $( this ).attr('id') );
	  var inputId = $( this ).attr('id');
	  var apiNamePicklist = '', apiNameChk = '', apiNameNonPicklist = '', apiNameForInvalidFlag = '';
	  if(inputId.indexOf("fDyntruePickDyn") != -1)
	  {   
		apiNamePicklist = inputId.substring(inputId.indexOf("fDyntruePickDyn") + 15);
	  }
	  if(inputId.indexOf("fDyntrueChk") != -1)
	  {   
		apiNameChk = inputId.substring(inputId.indexOf("fDyntrueChk") + 11);
	  }
	  apiNameNonPicklist = inputId.substring(inputId.indexOf("fDyntrue") + 8);
	    
	  // picklist
	  if(apiNamePicklist != '')  
	  {
		  if($(this).val() === '?' || $(this).val() == null){  
			 isBlank = true;
		  }
		  apiNameForInvalidFlag = apiNamePicklist;
	  }
	  else if(apiNameChk != '')  
	  {
		  if($(this).prop("checked") != true){  
			 isBlank = true;
		  }
		  apiNameForInvalidFlag = apiNameChk;
	  }
	  else if(apiNameNonPicklist != '')
	  {
		  if($(this).val() === '')   
	      { 
			  isBlank = true;    
		  }
		  apiNameForInvalidFlag = apiNameNonPicklist; 
	  }
	  var errFlag = 'fDyn' + apiNameForInvalidFlag + 'Invalid';
	  
		if(isBlank) 
		{
		  $scope[errFlag] = true;
		  window.scrollTo(0,$(this).offset().top - 10); 
		  validFirstPage = false;
		} else{ 
		  $scope[errFlag] = false;  
		}
	});
	
	$('[data-req-mpick-id^="fDyntrue"]').each(function( index ) {
		var inputId = $( this ).attr('data-req-mpick-id'); 
		var apiNameMPicklist = inputId.substring(inputId.indexOf("fDyntrue") + 8);
		if(apiNameMPicklist != '')
		{
			var errFlag = 'fDyn' + apiNameMPicklist + 'Invalid';
			
			if($scope.data[apiNameMPicklist] == "") 
			{ 
			  $scope[errFlag] = true; 
			  window.scrollTo(0,$(this).offset().top - 10); 
			  validFirstPage = false;
			} else{ 
			  $scope[errFlag] = false;  
			}
		}	
		
	});
	
	$('[data-req-dtpick-id^="fDyntrue"]').each(function( index ) {
		var inputId = $( this ).attr('data-req-dtpick-id'); 
		var apiNameDtPick = inputId.substring(inputId.indexOf("fDyntrue") + 8);   
		if(apiNameDtPick != '')
		{
			var errFlag = 'fDyn' + apiNameDtPick + 'Invalid';
			
			if($scope.data[apiNameDtPick] == "") 
			{ 
			  $scope[errFlag] = true; 
			  window.scrollTo(0,$(this).offset().top - 10); 
			  validFirstPage = false;
			} else{ 
			  $scope[errFlag] = false;     
			}
		}	
		
	});
	
	/* END - Validation for the fieldset fields - Added by Endiem offshore */
	
    if(validFirstPage) {

      $scope.isSaving = true;
	  if (typeof eventNumber != 'undefined') {
		  $scope.data['eventNumber'] = eventNumber;
	  }
	  else {
		  $scope.data['eventNumber'] = '';
	  }
	  
      
      ContactService.create($scope.data)
        .then(function(data) {
          redirect_thankyou();     
        }, function(error) {
          redirect_thankyou();
        });
    }
  }

  function isValidEmailAddress(emailAddress) {
      var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
      return pattern.test(emailAddress);
  };

  function redirect_thankyou(){
    $scope.isSaving = true;
    window.location.assign($scope.thankyou);
    window.location.href = $scope.thankyou;
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
   
      return picklistValue;
    }

}]);