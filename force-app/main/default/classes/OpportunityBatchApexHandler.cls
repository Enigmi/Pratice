public class OpportunityBatchApexHandler implements Database.Batchable<sObject>,Database.Stateful {
    
    private String query;
    private List<Id> lstOfAddNewOpportunity = new List<Id>();
    private Map<Id,Decimal> mapOfOpportunity = new Map<Id,Decimal>();
    
    public OpportunityBatchApexHandler(List<Id> lstOfAccountId){

        System.debug('Start ');
        lstOfAddNewOpportunity.addAll(lstOfAccountId);
        query='SELECT Id,AccountId,Amount FROM Opportunity WHERE AccountId IN :lstOfAddNewOpportunity';                    
    }

    public Database.QueryLocator start(Database.BatchableContext Bc){
        
        return Database.getQueryLocator(query);
    }

    public void execute(Database.BatchableContext Bc , List<SObject> lstOfRecord){

        Map<Id,Account> mapOfUpdateAccount = new Map<Id,Account>();
        System.debug('lstOfRecord '+lstOfRecord);
            
        List<Opportunity> lstOfOpportunity =(List<Opportunity>)lstOfRecord;
            
        for(Opportunity objOfOpportunity : lstOfOpportunity){
                
            Decimal totalAmount = 0;
                
            if(mapOfOpportunity.containsKey(objOfOpportunity.AccountId)){
                    
                totalAmount = mapOfOpportunity.get(objOfOpportunity.AccountId);
                mapOfOpportunity.put(objOfOpportunity.AccountId,totalAmount+objOfOpportunity.Amount);       
            }else{
                    
                mapOfOpportunity.put(objOfOpportunity.AccountId,objOfOpportunity.Amount);        
            }
            System.debug('totalAmount '+mapOfOpportunity);
            totalAmount = mapOfOpportunity.get(objOfOpportunity.AccountId);
            mapOfUpdateAccount.put(objOfOpportunity.AccountId,new Account(Id=objOfOpportunity.AccountId,Total_Amount__c=totalAmount));      
            }
            System.debug('Update Map '+mapOfUpdateAccount);
            update mapOfUpdateAccount.values();   
    }

    public void finish(Database.BatchableContext Bc){} 
    
}