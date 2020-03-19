global class BatchApexHandler implements Database.Batchable<sObject>{
	global string Query;
    String FirstName = 'yasdhjad';
    String SecondName = 'Yash';
    List<Opportunity> lst = new List<Opportunity>();
	global Database.QueryLocator start(Database.BatchableContext Bc){
        
	Query ='select ID , AccountId,Name,CloseDate,StageName from opportunity Where Name =:FirstName';
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