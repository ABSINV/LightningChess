({
	doInit : function(component, event, helper) {
		//call Server Side method
		var action = component.get('c.initialize');
        action.setCallback(this,function(response){
            component.set('v.players',response.getReturnValue());
            helper.keepAlive(component,event,helper);
            ;
        })
        $A.enqueueAction(action);
       
	}, 
        
    handleStreamingEvent: function(component,event,helper)
    {
        
        switch(event.getParam('eventType')){
            case 'LoggedInPlayer':
                ;
				helper.handleLoggedInPlayer(component,event.getParam('sObject'),event.getParam('event'),helper);              
                break;
        }
    },
    
    challengeUser : function(component, event, helper) {
        debugger;
        var target = event.currentTarget;
        var dataset = target.dataset;
        
        
        var action = component.get('c.challengePlayer');
        action.setParams({userId:dataset.user});
        action.setCallback(this,function(response){
            if(!component.isValid())
                return;
            if(response.getState() != 'SUCCESS')
            {
                alert('Error challengeUser');
            }
        })
        $A.enqueueAction(action);
        
    },
})