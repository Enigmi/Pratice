({
    forceedit: function (component, event) {

        setTimeout(() => {

            $A.get("e.force:closeQuickAction").fire();
        }, 10);
    }

})