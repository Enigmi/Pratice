trigger SiteTrigger on Site__c (after update) {
	
	SiteTriggerHandler sitetriggerhandler = new SiteTriggerHandler();
    if(trigger.isAfter){
        if(trigger.isUpdate){
            sitetriggerhandler.afterupdate(trigger.newMap,trigger.oldMap);
        }
        
    }    
}