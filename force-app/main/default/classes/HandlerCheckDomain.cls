public class HandlerCheckDomain {
    
   /* public void HandlerCheckDomain() {
        
    }
    
    public void beforeinsert(List<Contact> lstNewContact) {
        
        String domain,domainwebsite;
        Boolean flag=false;
        Map<String,Id> containwebsiteid = new Map <String,Id>();
        List<Account> lstaccount =new List<Account>();
        Map<String,Contact> accountmap =new Map<String,Contact>(); 
        List<Account> lstofaccount =new List<Account>([SELECT Id, Website FROM Account WHERE Website!=null ORDER BY CreatedDate DESC]);
        
        for(Account objaccount :lstofaccount ){
            
            containwebsiteid.put(objaccount.Website,objaccount.Id);    
        }
        
        for(Contact objcontact : lstNewContact)
        {
            if(objcontact.Email!=null){
                
                domain='www.'+objcontact.Email.Split('@').get(1);
                
                objcontact.AccountId = containwebsiteid.get('www.'+objcontact.Email.Split('@').get(1));
                
                if(objcontact.AccountId == null) {
                    
                    Account newaccount = new Account();
                    newaccount.Name='Accountss';
                    newaccount.Rating='Hot';
                    newaccount.Number__c=11231;
                    newaccount.Website=domain;
                    lstaccount.add(newaccount);
                    accountmap.put(domain,objcontact);
                }
                
            }
        }
        System.debug('LIST####'+lstaccount);
        
        if(lstaccount!=null){
            insert lstaccount;
            System.debug('LIST####'+lstaccount);
            for(Account objAccount :lstaccount){
       
                Contact c=accountmap.get(objAccount.Website);
                c.AccountId=objAccount.Id;
                
            }           
            
        }
    }*/
}