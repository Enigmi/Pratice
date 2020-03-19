public class HandleDefaultContact {
    
  public void  HandleDefaultContact ()
        {
            
        }
    public void afterinsert(List <Account> lstnewaccount)
    {    
         makedefaultcontact(lstnewaccount);
        
    }
    
    public void makedefaultcontact(List <Account> lstnewaccount)
    {
       List<contact> cons =new List<contact>();
                
        for(Account a : lstnewaccount )
        {
             contact c =new contact();
             c.AccountId = a.id;
             c.LastName ='Yash';
             cons.add(c);
             
        }
       insert cons;
    }

}