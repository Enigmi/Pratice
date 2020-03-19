global class SheduleAccount implements Schedulable {
    global SheduleAccount (){}
	global void execute(SchedulableContext SC) {
		String query = 'SELECT Id,AccountId FROM Opportunity';
		DemoBatchApex dba = new DemoBatchApex(true,query);
		Database.executeBatch(dba,2);  
   }
	    
}