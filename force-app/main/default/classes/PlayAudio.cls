//extensions to take care all the lead and activity related attachments and 
public without sharing class PlayAudio {
    
    public List<Attachment> listAttachment {get;set;}
    public Lead lead {get;set;}
    
    //constructor
    public PlayAudio(ApexPages.StandardController controller) {
        
        //get the controller instance
        lead = (Lead)controller.getRecord();
        
        //initialize the attachments list
        listAttachment = new List<Attachment>();
        
        //get all the lead related attachments
        listAttachment = [Select Id, ContentType, Name from Attachment where ParentId = :lead.Id];
        
        //get all the related tasks attachments
        List<Task> listTask = [Select WhatId from Task where WhoId =: lead.Id ];
        listAttachment.addAll([Select Id, ContentType, Name from Attachment where ParentId IN :listTask]);
        
        //get all the related events attachments
        List<Event> listEvent = [Select WhatId from Event where WhoId =: lead.Id ];
        listAttachment.addAll([Select Id, ContentType, Name from Attachment where ParentId IN :listEvent]);
        
    }
    
    @isTest
    private static void testPlayAudio()
        {
            //create a lead record
            Lead lead = new Lead(LastName='test', Company='test');
            insert lead;
            
            //start test from here 
            Test.startTest();
            
            PlayAudio controller = new PlayAudio(new ApexPages.StandardController(lead));
            
            System.assert(lead != null);
            //stop test here
            Test.stopTest();
        }

}