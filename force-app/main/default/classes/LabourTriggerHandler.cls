public class LabourTriggerHandler {
    
    public void LabourTriggerHandler(){}
    public void afterupdate(Map<Id,Labour__c> mapOfNewLabour,Map<Id,Labour__c> mapOfOldLabour){
        
		Set<Id> setOfLabourId = new Set<Id>();
		Set<Id> setOfJobNewApplicationId = new Set<Id>();
		Set<Id> setOfAttendenceId = new Set<Id>();
        Set<Id> setOfSiteId = new Set<Id>();
        Map<Id,Site__c> mapOfSite = new Map<Id,Site__c>();
        Map<Id,Decimal> mapOfLabour = new Map<Id,Decimal>();
      	Map<Id,JobNewApplication__c> mapOfUpdateValueJobApplication = new Map<Id,JobNewApplication__c>();
        for(Labour__c objOfLabour : mapOfNewLabour.values()){
            if(objOfLabour.Number_Of_Days_Available__c!=mapOfOldLabour.get(objOfLabour.Id).Number_Of_Days_Available__c && objOfLabour.Number_Of_Days_Available__c!=NUll){
				
				setOfLabourId.add(objOfLabour.Id);
				mapOfLabour.put(objOfLabour.Id,objOfLabour.Number_Of_Days_Available__c);	                
            }
        }
        for(JobNewApplication__c objOfJobNewApplicaion : [	SELECT Id,SiteLookup__c,LabourLookup__c,CreatedById,Name,LastModifiedById,NumberOfDaysPresent__c,OwnerId,CreatedDate  
                                            				FROM JobNewApplication__c
                                            				WHERE LabourLookup__c IN : setOfLabourId]){
			
			setOfJobNewApplicationId.add(objOfJobNewApplicaion.Id);
            setOfSiteId.add(objOfJobNewApplicaion.Id);                                                    
			mapOfUpdateValueJobApplication.put(objOfJobNewApplicaion.Id,objOfJobNewApplicaion);                                                               	
			            
        }
        for(Attendence__c objAttendance : [	SELECT Id
                                          	FROM Attendence__c
                                          	WHERE JobNewApplication__c IN : setOfJobNewApplicationId ]){
			
			setOfAttendenceId.add(objAttendance.Id);
			       	                                                
        }		
        delete[	SELECT Id 
              	FROM Attendence__c
               WHERE Id IN : setOfAttendenceId];
        
        
        JobNewApplicationTriggerHandler jobnewapplicationtriggerhandler = new JobNewApplicationTriggerHandler();
		jobnewapplicationtriggerhandler.afterinsert(mapOfUpdateValueJobApplication);
        
    }
    

}