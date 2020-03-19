public with sharing class LwcPlayAudio {

    public LwcPlayAudio() {

    }
    @AuraEnabled
    public static List<ContentDocumentLink> getaudio(String recordId ){
        System.debug('record'+recordId);
        List<ContentDocumentLink> ListOfAudio = new List<ContentDocumentLink>();
		
	    for(ContentDocumentLink objOfContentDocumentLink : [SELECT ContentDocumentId,ContentDocument.FileType,ContentDocument.Title FROM ContentDocumentLink where LinkedEntityId =:recordId]){
            if(objOfContentDocumentLink.ContentDocument.FileType=='MP3'|| objOfContentDocumentLink.ContentDocument.FileType=='WAV' || objOfContentDocumentLink.ContentDocument.FileType=='MP4'){           
				ListOfAudio.add(objOfContentDocumentLink);
			}			          
		}	
        System.debug('@@ListOfAudio'+ListOfAudio);
		return ListOfAudio; 

    }            
}