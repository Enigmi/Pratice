trigger Checkprimaryistrue on Contact (after insert,after update) {
    PrimaryInsertHandler primaryinserthandler = new PrimaryInsertHandler();
    if(Trigger.isAfter){
        if(Trigger.isInsert){
           System.debug('asda');
            primaryinserthandler.afterinsert(Trigger.newMap);
        }
        if(Trigger.isUpdate){
            
            primaryinserthandler.afterUpdate(Trigger.newMap,Trigger.OldMap);
            
        }
        
    }
}