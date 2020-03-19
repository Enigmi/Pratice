trigger DefaultContact on Account (after insert) {
    If(Trigger.isAfter)
    {
        if(Trigger.isInsert)
        {
            HandleDefaultContact handledefaultcontact =new HandleDefaultContact();
            handledefaultcontact.afterinsert(Trigger.new);
        }
        
    }
}