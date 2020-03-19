trigger LabourTrigger on Labour__c (after update) {
	  LabourTriggerHandler labourtriggerhandler = new LabourTriggerHandler();
    if(Trigger.isAfter){
        if(Trigger.isUpdate){
            labourtriggerhandler.afterupdate(trigger.newMap,trigger.oldMap);
        }
    }    

}