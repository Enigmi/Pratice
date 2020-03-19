public class GetParentRole {
    public GetParentRole(){
        system.debug('## In cont');
        try {
            for(Integer index = 0; index < 101 ; index++) {
       			
                if(Limits.getQueries() == 99) break;
              User u = [select Id from User where Id =: UserInfo.getUserId()];
              System.debug('Quary Count '+Limits.getQueries());        
          }
        } catch(Exception e) {
            
            system.debug('## Handling exception?');
        }
        
    }
    
/*    
    public void checklimit(Id u){
		UserRole ur = new UserRole(id=u);
		System.debug('Quary Count '+Limits.getQueries());        
        
        for(Integer index = 1; index < 100 ; index++) {
            
            System.debug('Second'+Limits.getQueries());
            checklimit(ur.ParentRoleId);
        }
        
        /*if(Limits.getQueries()<3){
			ur = [select ur.Id, ur.Name, ur.ParentRoleId from UserRole ur where ur.Id =: u];
			//System.debug('User Name'+ur.Name);            
			//System.debug('Second'+Limits.getQueries());            
			checklimit(ur.ParentRoleId);            
        }else{
            System.debug('Final Count '+Limits.getQueries());
        }     
    }    
*/
}