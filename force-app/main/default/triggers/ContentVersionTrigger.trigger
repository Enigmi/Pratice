trigger ContentVersionTrigger  on ContentVersion (after insert) {
    
    if(Trigger.isAfter){
        
        if(Trigger.isInsert){
            ContentVersionTriggerHandler objContentVersionTriggerHandler = new ContentVersionTriggerHandler();
            objContentVersionTriggerHandler.publishEvent(Trigger.new);
        }    
    }       
}