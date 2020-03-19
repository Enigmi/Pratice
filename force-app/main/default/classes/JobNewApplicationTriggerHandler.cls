public class JobNewApplicationTriggerHandler {
   
    public void JobNewApplicationTriggerHandler(){}
	Set<Id> setOfSiteId = new Set<Id>();
	Set<Id> setOfLaburId = new Set<Id>();
	Boolean recursionCheck = false;
    public void afterinsert(Map<Id,	JobNewApplication__c> mapOfJobApplication){
      if(mapOfJobApplication.values()!=null){
        Integer countdays = 0;
        Map<Id,Integer> mapOfNumberOfBussinessHour = new Map<Id,Integer>();
        Map<Id,Site__c> mapOfSite = new Map<Id,Site__c>();
        Map<Id,Labour__c> mapOfLabur = new Map<Id,Labour__c>();
        List<Attendence__c> listattendence = new List<Attendence__c>();
        
        for(JobNewApplication__c objOfJobApplication : mapOfJobApplication.values()){
            
            setOfSiteId.add(objOfJobApplication.SiteLookup__c);
            setOfLaburId.add(objOfJobApplication.LabourLookup__c);
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
        for(jobNewApplication__c objOfJobApplication : mapOfJobApplication.values()){
            Datetime checkDateVar = objOfJobApplication.CreatedDate;
            Date checkDate = date.newInstance(checkDateVar.year(),checkDateVar.month(),checkDateVar.day()); 
            if(checkDate<mapOfSite.get(objOfJobApplication.SiteLookup__c).Start_Date__c && checkDate<mapOfSite.get(objOfJobApplication.SiteLookup__c).End_Date__c){
                for(Date d=mapOfSite.get(objOfJobApplication.SiteLookup__c).Start_Date__c;d<=mapOfSite.get(objOfJobApplication.SiteLookup__c).End_Date__c;d=d.addDays(1)){
                    countdays++;
                    Datetime datetimevar = DateTime.newInstance(d, time.newInstance(0, 0, 0, 0));
                    String day = datetimevar.format('E');
                    System.debug('SYSTEM'+day);
                    System.debug('DATE'+d);
                    if(day=='Sun')
                    {
                        countdays--;
                        continue;
                    }	                   
                }
                System.debug('CountUpper'+countdays);
                mapOfNumberOfBussinessHour.put(objOfJobApplication.Id,countdays);
                countdays=0;
            }else{         
                for(DateTime d=checkDateVar;d<=mapOfSite.get(objOfJobApplication.SiteLookup__c).End_Date__c;d=d.addDays(1)){
                    countdays++;
                    System.debug('DATE'+d);
                    String day = d.format('E');
                    System.debug('DAY'+day);
                    if(day=='Sun')
                    {
                        countdays--;
                        continue;
                    }	                   
                }
                 System.debug('Count'+countdays);
                mapOfNumberOfBussinessHour.put(objOfJobApplication.Id,countdays-1);
                countdays=0;
            }
            
        }        
        for(JobNewApplication__c objOfJobApplication : mapOfJobApplication.values()){
            Datetime checkDateVar = objOfJobApplication.CreatedDate;
            Date checkDate = date.newInstance(checkDateVar.year(),checkDateVar.month(),checkDateVar.day());
			Integer numberofdaysavailable=(Integer)mapOfLabur.get(objOfJobApplication.LabourLookup__c).Number_Of_Days_Available__c;
            if(checkDate<mapOfSite.get(objOfJobApplication.SiteLookup__c).Start_Date__c && checkDate<mapOfSite.get(objOfJobApplication.SiteLookup__c).End_Date__c){
                Integer i=0; 
                for(Date d=mapOfSite.get(objOfJobApplication.SiteLookup__c).Start_Date__c;d<=mapOfSite.get(objOfJobApplication.SiteLookup__c).End_Date__c&& i<numberofdaysavailable;d=d.addDays(1)){
                	DateTime da = DateTime.newInstance(d, Time.newInstance(0, 0, 0, 0));
                    String day = da.format('E');
                    if(day=='Sun'){
                        continue;
                    }else{
                        	System.debug('OK1');
                        	i++;
                            listattendence.add(new Attendence__c(JobNewApplication__c=objOfJobApplication.Id));                            
                        
                    }
                }                
            }else{
                Integer j=0;
                for(Integer i=0;i<mapOfNumberOfBussinessHour.get(objOfJobApplication.Id)+1&& j<numberofdaysavailable ;i++){
                    System.debug('OK'+i);
                     j++;
					 listattendence.add(new Attendence__c(JobNewApplication__c=objOfJobApplication.Id));                            
                        					                    
                }
            }
            
        }
        if(listattendence!=null){
        //SendEmail sendemail = new SendEmail();
        //sendemail.sendemailtoprimaryandlabour(mapOfJobApplication);
        insert listattendence;
        } 
      }          
    }
}