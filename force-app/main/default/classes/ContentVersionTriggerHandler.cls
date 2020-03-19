public class ContentVersionTriggerHandler {
    
    public ContentVersionTriggerHandler(){}
    
    public void publishEvent(List<ContentVersion> lstContentVersion){
        List<Database.SaveResult> results;
        
        List<Id> lstContentDocumentLinkId = new List<Id>();
             
      
         for(ContentVersion objContentVersion : lstContentVersion){
             System.debug('@@@objContentVersion'+objContentVersion.ContentDocumentId);
             lstContentDocumentLinkId.add(objContentVersion.ContentDocumentId);
         
         }
        
        for(ContentDocumentLink objContentDocumentLink :  [SELECT ContentDocumentId,ContentDocument.FileType,ContentDocument.Title,LinkedEntityId FROM ContentDocumentLink where ContentDocumentId In : lstContentDocumentLinkId]){
            
            if(objContentDocumentLink.ContentDocument.FileType=='MP4'|| objContentDocumentLink.ContentDocument.FileType=='WAV'|| objContentDocumentLink.ContentDocument.FileType=='MP3'){
                
                List<RefershAudioComponent__e> lstRefershAudioComponent = new List<RefershAudioComponent__e>();
                lstRefershAudioComponent.add(new RefershAudioComponent__e(CheckIfTrggerWorking__c = true,RecordId__c=objContentDocumentLink.LinkedEntityId));
                results = EventBus.publish(lstRefershAudioComponent);
                
            }         
            
        }
        
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                                 err.getStatusCode() +
                                 ' - ' +
                                 err.getMessage());
                }
            }
            
        }
    }
}