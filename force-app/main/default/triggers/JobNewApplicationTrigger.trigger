trigger JobNewApplicationTrigger on JobNewApplication__c (after insert) {
    
    JobNewApplicationTriggerHandler jobnewapplicationtriggerhandler = new JobNewApplicationTriggerHandler();
    
    if(trigger.isAfter){
        
        if(trigger.isInsert){
            
            jobnewapplicationtriggerhandler.afterinsert(trigger.newMap);
        }
        if(trigger.isUpdate){
            
        }
    }
}