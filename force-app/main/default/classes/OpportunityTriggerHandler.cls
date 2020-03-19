public class OpportunityTriggerHandler {

    public OpportunityTriggerHandler(){}

    public void afterupdate(List<Id> lstOfAccountId) {

        callbatchapex(lstOfAccountId);
    }
    public void afterinsert(List<Id> lstOfAccountId) {
        System.debug('Hii in after insert');
        callbatchapex(lstOfAccountId);
    }

    private void callbatchapex(List<Id> lstOfAccountId) {
        
        Boolean flag= true;
        for(AsyncApexJob jobInfo : [SELECT Status, NumberOfErrors
            FROM AsyncApexJob
            WHERE ApexClassId  = '01p0o00000Gd0AoAAJ']){
            System.debug('Status'+jobInfo.Status);    
            if(jobInfo.Status !='Completed' || jobInfo.Status!='Aborted' ) {
                flag=false;         
                break;         
            }
            if(flag){
                Database.executeBatch(new OpportunityBatchApexHandler(lstOfAccountId));    
            }
            
        }    
    }       
}