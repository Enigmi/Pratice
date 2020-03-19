public class HandlerPrimaryTrigger {
    
    public static boolean recursionCheck = false;
    
	public void HandlerPrimaryTrigger(){
        
	}
    public void beforeupdate(Map<Id,Account> mapOfOldAccount,Map<Id,Account> mapOfNewAccount){
    	List<Account> lstOfAccount = new List<Account>(mapOfNewAccount.Values());
        List<Contact> lstOfContact = new List<Contact>();
        for(Account objAccount : lstOfAccount ){
            if(objAccount.PrimarySecond__c!=mapOfOldAccount.get(objAccount.Id).PrimarySecond__c){
                lstOfContact.add(new Contact(Id = objAccount.PrimarySecond__c , Primary__c = true ) );
            }
            
        }
        HandlerPrimaryTrigger.recursionCheck = true;
        if(!PrimaryInsertHandler.recheck){
            update lstOfContact; 
        }
         
    }
}