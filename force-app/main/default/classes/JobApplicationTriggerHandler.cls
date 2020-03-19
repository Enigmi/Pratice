public class JobApplicationTriggerHandler {
    
    public void JobApplicationTriggerHandler(){}
    
    public void afterinsert(Map<Id,	Job_Application__c> mapOfJobApplication){

        Set<Id> setOfSiteId = new Set<Id>();
        Set<Id> setOfLaburId = new Set<Id>();
        Map<Id,Site__c> mapOfSite = new Map<Id,Site__c>();
        Map<Id,Labour__c> mapOfLabur = new Map<Id,Labour__c>();
        
        for(Job_Application__c objOfJobApplication : mapOfJobApplication.values()){
            
            setOfSiteId.add(objOfJobApplication.Site_Lookup__c);
            setOfLaburId.add(objOfJobApplication.Labour_Lookup__c);
        }
        
        for(Site__c objOfSite : [   SELECT Id,End_Date__c,Start_Date__c
                                    FROM Site__c 
                                    WHERE Id IN : setOfSiteId]){
        
            mapOfSite.put(objOfSite.Id,objOfSite);        
        }
        
        for(Labour__c objOfLabour : [   SELECT Id,Number_Of_Days_Available__c
                                        FROM Labour__c
                                        WHERE Id IN : setOfLaburId]){
        
            mapOfLabur.put(objOfLabour.Id,objOfLabour);            
        }
        
        for(Job_Application__c objOfJobApplication : mapOfJobApplication.values()){
            Date myDateTime = (Date)objOfJobApplication.CreatedDate;
            String dayOfWeek = myDateTime.format();
            System.debug('LoggingLevel logLevel'+dayOfWeek);
            if(dayOfWeek=='Sun'){
                
            }    
        }
    }
    
}