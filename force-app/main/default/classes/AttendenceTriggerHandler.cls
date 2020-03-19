public class AttendenceTriggerHandler {

    public void AttendenceTriggerHandler(){}
    public void afterupdate(Map <Id,Attendence__c> mapOfAttendance){
        Map<Id,Decimal> mapOfJobNewApplicationDetail = new Map<Id,Decimal>();
        Set<Id> setOfAttendence = new Set<Id>();
        List<JobNewApplication__c> lstOfJobNewApplication = new List<JobNewApplication__c>();
        for(JobNewApplication__c objOfNewJobApplication : [	SELECT NumberOfDaysPresent__c
                                            				FROM JobNewApplication__c]){
			
			
                mapOfJobNewApplicationDetail.put(objOfNewJobApplication.Id,objOfNewJobApplication.NumberOfDaysPresent__c);
			            
        }
        for(Attendence__c objOfAttendence : mapOfAttendance.values()){
            if(objOfAttendence.Available__c=='Present'){
            	if(mapOfJobNewApplicationDetail.containsKey(objOfAttendence.JobNewApplication__c)){
               		Decimal temp;
                	temp=mapOfJobNewApplicationDetail.get(objOfAttendence.JobNewApplication__c);
                    temp=temp+1;
                    mapOfJobNewApplicationDetail.put(objOfAttendence.JobNewApplication__c,temp);
            	} 
            }
            setOfAttendence.add(objOfAttendence.JobNewApplication__c);
        }
      	
        for(JobNewApplication__c objOfJobNewApplication : [	SELECT Id,LabourLookup__c,SiteLookup__c,Name
                                                          	FROM JobNewApplication__c
                                                          	WHERE Id IN : setOfAttendence]){
			       	                                                         
            lstOfJobNewApplication.add(new JobNewApplication__c(Id=objOfJobNewApplication.Id ,LabourLookup__c=objOfJobNewApplication.LabourLookup__c,SiteLookup__c=objOfJobNewApplication.SiteLookup__c,Name=objOfJobNewApplication.Name,NumberOfDaysPresent__c=mapOfJobNewApplicationDetail.get(objOfJobNewApplication.Id)));
        }
        update lstOfJobNewApplication;
    }    

}