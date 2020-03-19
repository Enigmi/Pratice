trigger AttendenceTrigger on Attendence__c (after update) {
    AttendenceTriggerHandler attendencetriggerhandler = new AttendenceTriggerHandler();
    if(Trigger.isAfter){
        if(Trigger.isUpdate){
			attendencetriggerhandler.afterupdate(Trigger.newMap);            
        }
    }

}