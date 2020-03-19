trigger OpportunityTrigger on Opportunity (after update, after insert) {
	
    if(Trigger.isAfter){

        if(Trigger.isUpdate){
            System.debug('I am in Trigger');
			List<Id> lstOfAccountId = new List<Id>();

            for(Opportunity objOfopportunity : Trigger.new){
			
                if(objOfopportunity.AccountId!=null && objOfopportunity.StageName=='Closed Won' ){

					lstOfAccountId.add(objOfopportunity.AccountId);                    
                }	                
            }
			            
			OpportunityTriggerHandler opportunitytriggerhandler = new OpportunityTriggerHandler();
            opportunitytriggerhandler.afterupdate(lstOfAccountId);
          
        }

        if (Trigger.isInsert) {

            System.debug('Hiii I am Trigger');
            List<Id> lstOfAccountId = new List<Id>();

            for(Opportunity objOfopportunity : Trigger.new){
			
                if(objOfopportunity.AccountId!=null && objOfopportunity.StageName=='Closed Won' ){

					lstOfAccountId.add(objOfopportunity.AccountId);                    
                }	                
            }
			            
			OpportunityTriggerHandler opportunitytriggerhandler = new OpportunityTriggerHandler();
            opportunitytriggerhandler.afterinsert(lstOfAccountId);        

        }            
    }    
}