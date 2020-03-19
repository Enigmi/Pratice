'use strict';

/*(function($) {
  $(function() {
    $('#userTypeModal').modal("show");
    $('#tabs>li').click(function(e) { e.preventDefault(); e.stopImmediatePropagation(); });
  });
})(jQuery);*/

/** 
 * Angular App 
 */
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
		  DF15SignupController.verifyCaptchaUserResponse(userResponse, function(result, event){
              sfRemoteActionHelper(deferred, result, event);
          });
          return deferred.promise;
	  }
    }
})

uxSignupApp.controller('DF15SignupController', ['$scope', 'ContactService', 'serverData',
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
  $scope.fWorkEmailInvalid = false;

  $scope.submitData = function() {
  submitDataToSFDC();
  }
  
  function submitDataToSFDC() {
    
    var validFirstPage = true;
    var movedToSecondPage = false;
    
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
    
    if($('#fWorkEmail').val() === '' || $('#fWorkEmail').val() === 'johndoe@company.com' || !isValidEmailAddress($('#fWorkEmail').val())){
      $scope.fWorkEmailInvalid = true;
      if(validFirstPage) window.scrollTo(0,$("#fWorkEmail").offset().top - 10);
      validFirstPage = false;
    } else{
      $scope.fWorkEmailInvalid = false;
    }
    
    if(validFirstPage) {

      $scope.isSaving = true;

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
}]);