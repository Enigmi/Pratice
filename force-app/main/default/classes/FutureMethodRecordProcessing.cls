global class FutureMethodRecordProcessing
{
    @future
    public static void processRecords(List<ID> recordIds)
    {  
         // Get those records based on the IDs
         List<Account> accts = [SELECT Name FROM Account WHERE Id IN :recordIds];
         // Process records
    }
}