public class MyYash { 
 
    public void method()
    {
      List <integer> lists=new List<integer>();
      List <integer> lis =new List<integer>();
      Set  <integer> s =new Set<integer>();
      List <Student__c> st =new List<Student__c>();       
        
        s.add(2);
        s.add(3);
        s.add(4);
       lis.add(1);
       lis.add(2);
       lis.add(3);
      lists=lis.clone(); 
      
       For(integer l : lists)
       {
           if(lists.iterator().hasNext())
           {
               System.debug(lists);
           }
       }
       
       
        
      System.debug(lists);
    }
}