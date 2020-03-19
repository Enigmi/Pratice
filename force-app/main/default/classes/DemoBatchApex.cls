global class DemoBatchApex implements Database.Batchable<sObject>,Database.Stateful{

    global Boolean flag;
    global String query;
    Map<Id,Account> mapOfAccountUpdate = new Map<Id,Account>();
    Map<Id,Integer> mapOfOpportunity = new Map<Id,Integer>();
    Map<Id,Integer> mapOfContact = new Map<Id,Integer>();

    global DemoBatchApex(Boolean flag,String query){
        this.flag = flag;
        this.query = query;         
    }

    global Database.QueryLocator start(Database.BatchableContext Bc){
        
        return Database.getQueryLocator(query);           
    }

    global void execute(Database.BatchableContext Bc , List<SObject> lstOfRecord){
        
        if (flag==true) {
            List<Opportunity> lstOfTypeCastOpportunity = (List<Opportunity>)lstOfRecord;

            for(Opportunity objOfOpportunity : lstOfTypeCastOpportunity){
                 Integer sizeOfList;

                if(mapOfOpportunity.containsKey(objOfOpportunity.AccountId)){
                   sizeOfList = mapOfOpportunity.get(objOfOpportunity.AccountId);
                    mapOfOpportunity.put(objOfOpportunity.AccountId,sizeOfList+1);       
                }else{
                    mapOfOpportunity.put(objOfOpportunity.AccountId,1);        
                }
                sizeOfList = mapOfOpportunity.get(objOfOpportunity.AccountId);
                mapOfAccountUpdate.put(objOfOpportunity.AccountId,new Account(Id=objOfOpportunity.AccountId,NumberOfOpportunities__c=sizeOfList));      
            }
            update mapOfAccountUpdate.values();
        }else{
            List<Contact> lstOfTypeCastContacts = (List<Contact>)lstOfRecord;

            for(Contact objOfContact : lstOfTypeCastContacts){
                List<Contact> lstOfContact = new List<Contact>();
                Integer sizeOfList;

                if(mapOfContact.containsKey(objOfContact.AccountId)){ 
                    sizeOfList=mapOfContact.get(objOfContact.AccountId);
                    mapOfContact.put(objOfContact.AccountId,sizeOfList+1);
                }else{
                     mapOfContact.put(objOfContact.AccountId,1);        
                }
                sizeOfList=mapOfContact.get(objOfContact.AccountId);
                mapOfAccountUpdate.put(objOfContact.AccountId,new Account(Id =objOfContact.AccountId,NumberOfContact__c=sizeOfList));       
            }
            update mapOfAccountUpdate.values();   
        }
    }

    global void finish(Database.BatchableContext Bc){
        System.debug('Heap Size '+Limits.getHeapSize());
        if(flag==true){
            query = 'SELECT Id,AccountId FROM Contact WHERE AccountId!=Null ';    
            DemoBatchApex dba = new DemoBatchApex(false,query);
            Database.executeBatch(dba);     
        }    
	}        
}