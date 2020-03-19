public class PrimaryInsertHandler{
    public static boolean  recheck =false;
	public PrimaryInsertHandler(){
        
	}
    
    
    public void afterInsert(map <Id , Contact> mapNewContact){
        
    	primaryCheck( mapNewContact , null);
        
    }
    
    public void afterUpdate(map <Id , Contact> mapNewContact ,  map<Id ,Contact> mapOldContact){
        
        primaryCheck( mapNewContact ,  mapOldContact);
        
    }
    
    
    public void primaryCheck(map <Id , Contact> mapNewContact , map<Id , Contact> mapOldContact){
        set<Id> accountIds = new set<Id>();
        List<Contact> lstContact = new List<Contact>();
        List<Account> lstAccount = new List<Account>();
        List<Account> removeacct = new List<Account>();
        
        for (Contact objContact : mapNewContact.values()){
            
            if(objContact.primary__c == true){
                
                if(mapOldContact!=null && !mapOldContact.get(objContact.Id).primary__c ){
                    lstAccount.add(new Account(Id = objContact.AccountId , PrimarySecond__c = objContact.Id));
                    System.debug('LIST######'+lstAccount);
                    accountIds.add(objContact.AccountId);
                    
                }else{
                    
                    accountIds.add(objContact.AccountId);
                    lstAccount.add(new Account(Id = objContact.AccountId , PrimarySecond__c = objContact.Id));
                }
            }else{
                removeacct.add(new Account(Id = objContact.AccountId , PrimarySecond__c = null));
                System.debug('REMOVE ACCOUNT####'+removeacct);
                
            }
            
        }
        
        for(Contact objContact : [SELECT Id
                                  FROM Contact
                                  WHERE AccountId IN :accountIds AND
                                  Id NOT IN  :mapNewContact.keySet() AND
                                  primary__c = true]) {
                                      
                                      objContact.primary__c = false;
                                      lstContact.add(objContact);
                                      
                                  }
        
        
        update lstContact;
         PrimaryInsertHandler.recheck=true;
        if(!HandlerPrimaryTrigger.recursionCheck) {
            
         	update lstAccount;
            
            if(removeacct!=null){
                update removeacct;
            }
           
        }
    }
}