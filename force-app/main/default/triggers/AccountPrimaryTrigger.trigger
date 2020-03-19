trigger AccountPrimaryTrigger on Account (before update) {
    if(Trigger.isBefore){
        if(Trigger.isUpdate){
            HandlerPrimaryTrigger handleprimarytrigger = new HandlerPrimaryTrigger();
            handleprimarytrigger.beforeupdate(Trigger.oldmap,Trigger.newmap);
        }
    } 
}