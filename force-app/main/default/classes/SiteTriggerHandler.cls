public class SiteTriggerHandler {
    
    public void SiteTriggerHandler(){}
    
    public void afterupdate(Map<Id,Site__c> mapOfNewSite,Map<Id,Site__c> mapOfOldSite){
        
        Set<Id> setOfSiteId = new Set<Id>();
        Set<Id> setOfJobNewApplicationId = new Set<Id>();
        Set<Id> setOfJobNewApllicationIdPresent = new Set<Id>();
        Set<Id> setOfUpdateJobNewApplicationId = new Set<Id>();
        Map<Id,DateTime> mapOfAttendanceLastModifyDate = new Map<Id,DateTime>();
        Map<Id,Date> MapOfSiteEndDate = new Map<Id,Date>();
        Map<Id,Date> MapOfSiteStartDate = new Map<Id,Date>();
        Set<Id> setOfNotPresentJobNewApplication = new Set<Id>();
        Map<Id,JobNewApplication__c> mapOfNotPrsentJobNewApplication = new Map<Id,JobNewApplication__c>();
        Map<Id,Date> mapContainJobIdAndStartDate = new Map<Id,Date>();
        Map<Id,Date> mapContainJobIdAndEndDate = new Map<Id,Date>();
        Set<Id> setOfAttendenceId = new Set<Id>();
        Map<Id,JobNewApplication__c> mapOfUpdateValueJobApplication = new Map<Id,JobNewApplication__c>();
        for(Site__c objOfSite : mapOfNewSite.values()){
                
                setOfSiteId.add(objOfSite.Id);
                MapOfSiteEndDate.put(objOfSite.Id,objOfSite.End_Date__c);
                MapOfSiteStartDate.put(objOfSite.Id, objOfSite.Start_Date__c);
                System.debug('#');                  
            
        }
        for(JobNewApplication__c objOfJobNewApplicaion : [  SELECT Id,SiteLookup__c,LabourLookup__c,CreatedById,Name,LastModifiedById,NumberOfDaysPresent__c,OwnerId,CreatedDate  
                                                            FROM JobNewApplication__c
                                                            WHERE SiteLookup__c IN : setOfSiteId]){
            System.debug('##$'); 
            setOfJobNewApplicationId.add(objOfJobNewApplicaion.Id);                                                          
            if(MapOfSiteEndDate.ContainsKey(objOfJobNewApplicaion.SiteLookup__c) && MapOfSiteStartDate.containsKey(objOfJobNewApplicaion.SiteLookup__c)){
                mapContainJobIdAndStartDate.put(objOfJobNewApplicaion.Id,MapOfSiteStartDate.get(objOfJobNewApplicaion.SiteLookup__c));
                mapContainJobIdAndEndDate.put(objOfJobNewApplicaion.Id, MapOfSiteEndDate.get(objOfJobNewApplicaion.SiteLookup__c));
            }                                                                
        }
        for(Attendence__c objAttendance : [ SELECT Id,JobNewApplication__c,LastModifiedDate 
                                            FROM Attendence__c
                                            WHERE JobNewApplication__c IN : setOfJobNewApplicationId AND Available__c=:'Present']){                                  
            setOfJobNewApllicationIdPresent.add(objAttendance.JobNewApplication__c);
            mapOfAttendanceLastModifyDate.put(objAttendance.JobNewApplication__c,objAttendance.LastModifiedDate);                                                
            System.debug('##');                 
                                                                    
        }
        for(Attendence__c objAttendence : [SELECT Id,JobNewApplication__c,LastModifiedDate 
                                           FROM Attendence__c
                                           WHERE JobNewApplication__c NOT IN : setOfJobNewApllicationIdPresent AND JobNewApplication__c IN : setOfJobNewApplicationId]){                                               
				
            System.debug('##@');                                    
			setOfNotPresentJobNewApplication.add(objAttendence.JobNewApplication__c);                                               
		}
        for(JobNewApplication__c objOfJobNewApplicaton : [	SELECT Id,SiteLookup__c,LabourLookup__c,CreatedById,Name,LastModifiedById,NumberOfDaysPresent__c,OwnerId,CreatedDate 
                                                         	FROM JobNewApplication__c
                                                         	WHERE Id IN : setOfNotPresentJobNewApplication]){
			
			mapOfNotPrsentJobNewApplication.put(objOfJobNewApplicaton.Id,objOfJobNewApplicaton);            
        }
        for(Id objOfAttendenceLastModifyDate : mapOfAttendanceLastModifyDate.keySet()){
         
            if(mapOfAttendanceLastModifyDate.get(objOfAttendenceLastModifyDate)>mapContainJobIdAndStartDate.get(objOfAttendenceLastModifyDate) && mapOfAttendanceLastModifyDate.get(objOfAttendenceLastModifyDate)<mapContainJobIdAndEndDate.get(objOfAttendenceLastModifyDate)){
                setOfUpdateJobNewApplicationId.add(objOfAttendenceLastModifyDate);
            }else{
					            
            }
            
        }
        for(JobNewApplication__c objOfNewJobApplication : [SELECT Id,SiteLookup__c,LabourLookup__c,CreatedById,Name,LastModifiedById,NumberOfDaysPresent__c,OwnerId,CreatedDate  
                                                            FROM JobNewApplication__c
                                                            WHERE Id IN : setOfUpdateJobNewApplicationId]){
                                                                  
                mapOfUpdateValueJobApplication.put(objOfNewJobApplication.Id,objOfNewJobApplication);
                System.debug('AS'+mapOfUpdateValueJobApplication);
                System.debug('##%');                                                 
                                                                
        }
        for(Attendence__c objAttendance : [ SELECT Id,JobNewApplication__c
                                            FROM Attendence__c
                                            WHERE JobNewApplication__c IN : setOfUpdateJobNewApplicationId]){
                                                
            setOfAttendenceId.add(objAttendance.Id); 
            System.debug('##^');                                     
        }
        
            delete[ SELECT Id 
                FROM Attendence__c
                WHERE Id IN : setOfAttendenceId OR JobNewApplication__c IN : setOfNotPresentJobNewApplication];
        
        JobNewApplicationTriggerHandler jobnewapplicationtriggerhandler = new JobNewApplicationTriggerHandler();
        jobnewapplicationtriggerhandler.afterinsert(mapOfUpdateValueJobApplication);
        jobnewapplicationtriggerhandler.afterinsert(mapOfNotPrsentJobNewApplication);
        System.debug(''+mapOfNotPrsentJobNewApplication);
        System.debug('####'+mapOfUpdateValueJobApplication);
    }
}