public class SendEmail {

    public void SendEmail(){} 

    public void sendemailtoprimaryandlabour(Map <Id,JobNewApplication__c> mapOfNewJobApplication){
    
        List <String> lstOfPrimaryContactEmail = new List<String>();
        Map<Id,Date> mapOfEndDate = new Map<Id,Date>();
        Map<Id,Date> mapOfCreatedDate = new Map<Id,Date>();
        Map<Id,Date> mapOfStartDate = new Map<Id,Date>();
        Map <Id,String> mapOfLabourEmail = new Map<Id,String>();
        Map <Id,String> mapOfLabourName = new Map<Id,String>();
        List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
        Set<Id> setOfContactId = new Set<Id>();
        Set<Id> setOfJobNewApplicationId = new Set<Id>();
        Set<Id> setOfLabourId = new Set<Id>();
        Set<Id> setOfSiteId = new Set<Id>();
          for(JobNewApplication__c objOfJobNewApplication : mapOfNewJobApplication.values()){
        
            Date tempDateVariable = Date.newInstance(objOfJobNewApplication.CreatedDate.year(), objOfJobNewApplication.CreatedDate.month(),objOfJobNewApplication.CreatedDate.day());
            mapOfCreatedDate.put(objOfJobNewApplication.SiteLookup__c,tempDateVariable);
            //setOfContactId.add(objOfJobNewApplication.Contact__c);
            setOfJobNewApplicationId.add(objOfJobNewApplication.Id);
            setOfLabourId.add(objOfJobNewApplication.LabourLookup__c);
            setOfSiteId.add(objOfJobNewApplication.SiteLookup__c);
        }
        /*for(Contact objOfContact : [SELECT Primary__c,Email 
                                FROM Contact
                                WHERE Primary__c =:true AND JobNewApplication__c IN : setOfJobNewApplicationId AND ID IN : setOfContactId]){
                                    
            lstOfPrimaryContactEmail.add(objOfContact.Email);                                        
        }*/
        for(Labour__c objOFLabour : [	SELECT Id,Labour_Email__c,Name
                                    FROM Labour__c
                                    WHERE Id IN : setOfLabourId]){
            mapOfLabourEmail.put(objOFLabour.Id,objOFLabour.Labour_Email__c);
            mapOfLabourName.put(objOFLabour.Id, objOFLabour.Name);                                          
        }
        for(Site__c objOfSite : [	SELECT Id,Start_Date__c,End_Date__c
                                FROM Site__c
                                WHERE Id IN : setOfSiteId]){
        
            System.debug('End Date'+objOfSite.End_Date__c);                                        
            mapOfEndDate.put(objOfSite.Id,objOfSite.End_Date__c);
            if(objOfSite.Start_Date__c < mapOfCreatedDate.get(objOfSite.Id)){
            mapOfStartDate.put(objOfSite.Id,objOfSite.Start_Date__c);
            }else{
              mapOfStartDate.put(objOfSite.Id,mapOfCreatedDate.get(objOfSite.Id));
            }                                        
        }

        for(JobNewApplication__c objJobNewApplication : mapOfNewJobApplication.values()){   
            List<String> sendTo = new List<String>(); 
            Messaging.SingleEmailMessage mail =  new Messaging.SingleEmailMessage();
            sendTo.add(mapOfLabourEmail.get(objJobNewApplication.LabourLookup__c));
            mail.setToAddresses(sendTo);
            mail.setReplyTo('yashgupta304@gmail.com');
            mail.setSenderDisplayName('YASH');
            //mail.setCcAddresses(lstOfPrimaryContactEmail);
            mail.setSubject('Registration Conformation');
            String body = 'Dear,'+mapOfLabourName.get(objJobNewApplication.LabourLookup__c)+'<br/>'+'Your Work Start From'+mapOfStartDate.get(objJobNewApplication.SiteLookup__c)+'Your Work End at'+mapOfEndDate.get(objJobNewApplication.SiteLookup__c); 
            mail.setHtmlBody(body);
            mails.add(mail);
            Messaging.sendEmail(mails);
        }
    
    }    
}