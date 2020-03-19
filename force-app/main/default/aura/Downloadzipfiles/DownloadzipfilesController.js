({
	doInit : function(component, event, helper) {
		
         var urlEvent = $A.get("e.force:navigateToURL");
    		urlEvent.setParams({
      "url": 'https://yashkumargupta-dev-ed.lightning.force.com/sfc/servlet.shepherd/document/download/'+ids
    });
    urlEvent.fire();
       
	}
})