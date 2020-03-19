trigger CheckDomain on Contact (before insert) {
    
    HandlerCheckDomain handlercheckdomain = new HandlerCheckDomain();
        
    if(Trigger.isBefore) {
        
        if(Trigger.isInsert) {
            
          handlercheckdomain.beforeinsert(Trigger.new);
        }
    }
}