({
    doInit: function (component, event, helper) {
        // var editRecordEvent = $A.get("e.force:editRecord");
        // editRecordEvent.setParams({

        //     "recordId": component.get("v.recordId")
        // });

        // editRecordEvent.fire();
        // helper.forceedit(component, event);


        console.log('###');
        let quickActionClose = $A.get("e.force:closeQuickAction");
        quickActionClose.fire();


        $A.get('e.force:refreshView').fire();

    },


})