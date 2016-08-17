({
	doInit: function (component, event, helper) {
		var action = component.get('c.getUser');
        action.setCallback(this,function(response){
        	//TODO add status check
            component.set('v.currentUser',response.getReturnValue());
        });
        
        $A.enqueueAction(action);
	}
})