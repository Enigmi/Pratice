public class Demo {
    
    public List<Account> memList {get;set;}
    private ApexPages.StandardSetController standardController;
    private Set<Id> memIds = new Set<Id>();
    
    public Demo(ApexPages.StandardSetController standardController){
        this.standardController = standardController;
        memList = new List<Account>();
        for (Account mem : (List<Account>)standardController.getSelected()){ 
            memIds.add(mem.Id);
            System.debug('@@mem'+memIds);
        }
        
        
    }
}