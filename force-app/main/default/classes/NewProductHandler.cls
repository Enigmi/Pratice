public class NewProductHandler {
    
    Id machineRecordType = Schema.SObjectType.Product__c.getRecordTypeInfosByName().get('Machine').getRecordTypeId();
    Id partRecordType = Schema.SObjectType.Product__c.getRecordTypeInfosByName().get('Part').getRecordTypeId();
    
    Set<String> setMachineIdPartId = new Set<String>();
    
    public NewProductHandler(){}
    
    public void afterInsert(Map<Id,Product__c> mapNewProduct,
        Map<Id,Product__c> mapOldProduct) {
        
        linkMachinesAndParts(mapNewProduct);
    }
    
    public void afterUpdate(Map<Id,Product__c> mapNewProduct,
        Map<Id,Product__c> mapOldProduct) {
        
        verifyProductUpdates(mapNewProduct, mapOldProduct);
    }
    
    public void afterDelete(Map<Id,Product__c> mapOldProduct) {
        
        deleteExistingOptions();
    }
    
    private void deleteExistingOptions() {
        
        delete new List<	ProductOption__c>([SELECT Id
            FROM 	ProductOption__c
            WHERE Machine_Product__c = null
            OR Part_Option__c = null]);
    }
    
    private void verifyProductUpdates(Map<Id,Product__c> mapNewProduct,
        Map<Id,Product__c> mapOldProduct) {
        
        Set<Id> setMachineIds = new Set<Id>();
        Set<Id> setPartIds = new Set<Id>();
        
        Map<Id,Product__c> mapUpdatedProduct = new Map<Id,Product__c>();
        
        for(Product__c objNewProduct : mapNewProduct.values()) {
            
            Product__c objOldProduct = mapOldProduct.get(objNewProduct.Id);
            
            if(objNewProduct.Brand__c != objOldProduct.Brand__c
                || objNewProduct.ModleNumber__c != objOldProduct.ModleNumber__c) {
                    
                if(objNewProduct.RecordTypeId == machineRecordType) {
                    
                    setMachineIds.add(objNewProduct.Id);
                } else if(objNewProduct.RecordTypeId == partRecordType) {
                    
                    setPartIds.add(objNewProduct.Id);
                }
                
                mapUpdatedProduct.put(objNewProduct.Id,objNewProduct);
            }
        }
        
        if(!mapUpdatedProduct.isEmpty()) {
            
            delete new List<ProductOption__c>([SELECT Id
                FROM ProductOption__c
                WHERE Machine_Product__c IN : setMachineIds
                OR Part_Option__c IN : setPartIds]);
                
            linkMachinesAndParts(mapUpdatedProduct);
        }
    }
    
    private void linkMachinesAndParts(Map<Id,Product__c> mapNewProduct) {
        
        Boolean hasNewGenericPart = false;
        
        Set<String> setMachineModal = new Set<String>();
        Set<String> setMachineBrand = new Set<String>();
        Set<String> setPartModal = new Set<String>();
        Set<String> setPartBrand = new Set<String>();
        
        List<Product__c> lstGenericParts = new List<Product__c>();
        List<Product__c> lstAllMachines = new List<Product__c>();
        List<	ProductOption__c> lstProductOptionToInsert = new List<	ProductOption__c>();
        
        Map<String, List<Product__c>> mapBrandToParts = new Map<String, List<Product__c>>();
        Map<String, List<Product__c>> mapModalToParts = new Map<String, List<Product__c>>();
        Map<String, List<Product__c>> mapBrandToMachines = new Map<String, List<Product__c>>();
        Map<String, List<Product__c>> mapModalToMachines = new Map<String, List<Product__c>>();
        
        for(Product__c objProduct : mapNewProduct.values()) {
            
            if(objProduct.RecordTypeId == machineRecordType) {
                
                setMachineBrand.add(objProduct.Brand__c);
                setMachineModal.add(objProduct.ModleNumber__c);
            } else if(objProduct.RecordTypeId == partRecordType) {
                
                if(objProduct.Brand__c != null) {
                    
                    setPartBrand.add(objProduct.Brand__c);
                } else if(objProduct.ModleNumber__c != null) {
                    
                    setPartModal.add(objProduct.ModleNumber__c);   
                } else {
                    
                    hasNewGenericPart = true;
                }
            }
        }
        
        for(Product__c objParts : [SELECT Id, Brand__c, ModleNumber__c
            FROM Product__c
            WHERE RecordTypeId = : partRecordType
            AND (Brand__c IN : setMachineBrand
            OR ModleNumber__c IN : setMachineModal
            OR PartCheck__c = 'By Genric')]) {
            
            List<Product__c> lstPartsTemp = new List<Product__c>();
            
            if(objParts.Brand__c != null) {
                
                if(mapBrandToParts.containsKey(objParts.Brand__c)) {
                    
                    lstPartsTemp.addAll(mapBrandToParts.get(objParts.Brand__c));
                }
                
                lstPartsTemp.add(objParts);
                
                mapBrandToParts.put(objParts.Brand__c, lstPartsTemp);
                
            } else if(objParts.ModleNumber__c != null) {
                
                if(mapModalToParts.containsKey(objParts.ModleNumber__c)) {
                    
                    lstPartsTemp.addAll(mapModalToParts.get(objParts.ModleNumber__c));
                }
                
                lstPartsTemp.add(objParts);
                
                mapModalToParts.put(objParts.ModleNumber__c, lstPartsTemp);
            } else {
                
                lstGenericParts.add(objParts);
            }
        }
        
        system.debug('## setMachineBrand '+setPartBrand);
        system.debug('## setMachineModal '+setPartModal);
        
        for(Product__c objMachine : [SELECT Id, Brand__c, ModleNumber__c
            FROM Product__c
            WHERE RecordTypeId = : machineRecordType
            AND (Brand__c IN : setPartBrand
            OR ModleNumber__c IN : setPartModal)]) {
            
            List<Product__c> lstMachinesTemp = new List<Product__c>();
            
            system.debug('## objMachine : '+objMachine);
            
            if(objMachine.Brand__c != null) {
                
                if(mapBrandToMachines.containsKey(objMachine.Brand__c)) {
                    
                    lstMachinesTemp.addAll(mapBrandToMachines.get(objMachine.Brand__c));
                }
                
                lstMachinesTemp.add(objMachine);
                
                mapBrandToMachines.put(objMachine.Brand__c, lstMachinesTemp);
                
            }
            
            if(objMachine.ModleNumber__c != null) {
                
                if(mapModalToMachines.containsKey(objMachine.ModleNumber__c)) {
                    
                    lstMachinesTemp.addAll(mapModalToMachines.get(objMachine.ModleNumber__c));
                }
                
                lstMachinesTemp.add(objMachine);
                
                mapModalToMachines.put(objMachine.ModleNumber__c, lstMachinesTemp);
            }
        }
        
        system.debug('## mapBrandToMachines : '+mapBrandToMachines);
        system.debug('## mapModalToMachines : '+mapModalToMachines);
        
        if(hasNewGenericPart) {
            
            lstAllMachines = [SELECT Id, Brand__c, ModleNumber__c
                FROM Product__c
                WHERE RecordTypeId = : machineRecordType];
        }
        
        for(Product__c objProduct : mapNewProduct.values()) {
            
            if(objProduct.RecordTypeId == machineRecordType) {
                
                if(mapBrandToParts.get(objProduct.Brand__c) != null) {
                    
                    for(Product__c objBrandSpecificPart : mapBrandToParts.get(objProduct.Brand__c)) {
                        
                        if(!isDuplicate(objProduct.Id + '' + objBrandSpecificPart.Id)) {
                            
                            lstProductOptionToInsert.add(new 	ProductOption__c(
                                Machine_Product__c = objProduct.Id,
                                Part_Option__c = objBrandSpecificPart.Id));   
                        }
                    }
                }
                
                if(mapModalToParts.get(objProduct.ModleNumber__c) != null) {
                    
                    for(Product__c objModalSpecificPart : mapModalToParts.get(objProduct.ModleNumber__c)) {
                        
                        if(!isDuplicate(objProduct.Id + '' + objModalSpecificPart.Id)) {
                            
                            lstProductOptionToInsert.add(new 	ProductOption__c(
                                Machine_Product__c = objProduct.Id,
                                Part_Option__c = objModalSpecificPart.Id));
                        }
                    }      
                }
                
                for(Product__c objGenericPart : lstGenericParts) {
                    
                    if(!isDuplicate(objProduct.Id + '' + objGenericPart.Id)) {
                        
                        lstProductOptionToInsert.add(new 	ProductOption__c(
                            Machine_Product__c = objProduct.Id,
                            Part_Option__c = objGenericPart.Id));
                    }
                }
            } else if(objProduct.RecordTypeId == partRecordType) { 
                
                if(mapBrandToMachines.get(objProduct.Brand__c) != null) {
                    
                    for(Product__c objBrandSpecificMachine : mapBrandToMachines.get(objProduct.Brand__c)) {
                    
                        if(!isDuplicate(objBrandSpecificMachine.Id + '' + objProduct.Id)) {
                            
                            lstProductOptionToInsert.add(new 	ProductOption__c(
                                Machine_Product__c = objBrandSpecificMachine.Id,
                                Part_Option__c = objProduct.Id));
                        }
                    }
                }
                
                if(mapModalToMachines.get(objProduct.ModleNumber__c) != null) {
                    
                    for(Product__c objModalSpecificMachine : mapModalToMachines.get(objProduct.ModleNumber__c)) {
                        
                        if(!isDuplicate(objModalSpecificMachine.Id + '' + objProduct.Id)) {
                         
                            lstProductOptionToInsert.add(new 	ProductOption__c(
                                Machine_Product__c = objModalSpecificMachine.Id,
                                Part_Option__c = objProduct.Id));   
                        }
                    }   
                }
                
                if(objProduct.PartCheck__c == 'By Genric') {
                    
                    for(Product__c objMachine : lstAllMachines) {
                        
                        if(!isDuplicate(objMachine.Id + '' + objProduct.Id)) {
                         
                            lstProductOptionToInsert.add(new 	ProductOption__c(
                                Machine_Product__c = objMachine.Id,
                                Part_Option__c = objProduct.Id));      
                        }
                    }
                }
            }
        }
        
        system.debug('## lstProductOptionToInsert : '+lstProductOptionToInsert);
        
        insert lstProductOptionToInsert;
    }
    
    private boolean isDuplicate(String uniqueId) {
        
        if(setMachineIdPartId.contains(uniqueId)) return true;
        
        setMachineIdPartId.add(uniqueId);
        
        return false;
    }
}