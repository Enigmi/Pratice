public with sharing class ListViewGetContactList {
    public ListViewGetContactList() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(String input){

        input = input + '%';
        List<Contact> lstContact = [SELECT Owner.Name,Account.Name,Name FROM Contact WHERE Name LIKE :input];
        return lstContact;

    }

}