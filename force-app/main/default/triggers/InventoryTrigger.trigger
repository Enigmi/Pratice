trigger InventoryTrigger on Product__c (after insert, after update, after delete) {
    
    NewProductHandler objNewProductHandler = new NewProductHandler();
    
    if(Trigger.isAfter) {
        
        if(Trigger.isInsert) {
            
            objNewProductHandler.afterInsert(Trigger.newMap,
                Trigger.oldMap);
        } else if(Trigger.isUpdate) {
            
            objNewProductHandler.afterUpdate(Trigger.newMap,
                Trigger.oldMap);
        } else if(Trigger.isDelete) {
            
            objNewProductHandler.afterDelete(Trigger.oldMap);
        }
    }
}