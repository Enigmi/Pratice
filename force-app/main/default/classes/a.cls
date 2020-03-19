global class a implements Database.Batchable<sObject>{
	string Query;
    String FirstName = 'yasdhjad';
    List<Opportunity> lst = new List<Opportunity>();
	global Database.QueryLocator start(Database.BatchableContext Bc){
        
	Query ='select ID , AccountId from opportunity ';
    System.debug('start'+Query);    
	return database.getQueryLocator (Query);
	}

	global void execute(Database.BatchableContext Bc, List<sObject> Query){
	List<Opportunity> lstOfOpportunity = (List<Opportunity>)Query;
    List <Opportunity> lst = new List<Opportunity>();    
    System.debug('ListOfQuery'+Query);    
	for(Opportunity objOpportunity: lstOfOpportunity){
	lst.add(new Opportunity(Id = objOpportunity.Id , Name=objOpportunity.AccountId +'-'+objOpportunity.Name,CloseDate=objOpportunity.CloseDate,StageName=objOpportunity.StageName));
	system.debug('####' +lst);
	}
		update lst;
	// if(lstOfNewOpportunityName!=Null){

	// update lstOfNewOpportunityName;
	//}
	}
	global void finish(Database.BatchableContext Bc){

	}
}