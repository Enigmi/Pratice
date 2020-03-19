public class ZipHandler {
    public Integer randomInt{get;set;}
    //Constructor
    public ZipHandler(){
        randomInt = getRandomNumber(10000);
    }
    
    @RemoteAction
    public static List<AttachmentWrapper> getAttachments(String sAttachmentIdCSV){
        List<String> attachmentIds = sAttachmentIdCSV.split(',');
        return wrapAttachments([SELECT Id,Name,Body FROM Attachment WHERE Id IN:attachmentIds]);
    }    
    
    private static List<AttachmentWrapper> wrapAttachments(List<Attachment> attachments){
        List<AttachmentWrapper> wrappers = new List<AttachmentWrapper>();
        for(Attachment att : attachments){
            wrappers.add(new AttachmentWrapper(att));
        }        
        return wrappers;
    }
    
    public class AttachmentWrapper{
        public Attachment AttachmentObj;
        public String base64Body;        
        public AttachmentWrapper(Attachment AttachmentObj){
            this.AttachmentObj  = AttachmentObj;
            this.base64Body = EncodingUtil.base64Encode(AttachmentObj.Body);
            this.AttachmentObj.Body = NULL;
        }
    }
    
    /*
    *Random number generator to change the js function name if multiple components used
    */
    private Integer getRandomNumber(Integer size){
        Double d = Math.random() * size;
        return d.intValue();
    }
 }