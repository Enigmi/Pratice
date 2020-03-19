public class MyFirstClass {
    
    public String firstName{get;set;} 
    public String lastName{get;set;} 
    
    public MyFirstClass(){
            
        firstName='Yash';
        lastName='';
    }
    public void getStudentDetail(String firstName)
    {   
        
   
        Student__c objStudent = new Student__c();
        Student__c objStudent1 = new Student__c();
        List<Student__c> lstStudent =new List<Student__c>([SELECT Name,	Student_Name__c
                                                           FROM Student__c
                                                           WHERE Student_Name__c=: firstName]);
        List<Integer> lists=new List<integer>();
        if(lists.isEmpty())
        {
            lists.add(1);
            lists.add(0,2);
            system.debug(lists);
            system.debug(lists.contains(1));
        }
        if(!lstStudent.isEmpty()) {
		
			objStudent = lstStudent[1];
            objStudent1 = lstStudent[0];
		}
         
        system.debug('## objStudent : '+objStudent); 
        system.debug('## objStudent : '+objStudent1); 
        
    
    }

}