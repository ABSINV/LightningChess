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
    
    acceptChallenge: function(component,event,helper)
    {
        var challenge = component.get('v.challenge');
        var action = component.get('c.handleChallenge');
        action.setParams({status:true});
        action.setCallback(this,function(response){
            component.set('v.challenge',null);
        });
        $A.enqueueAction(action);
    },
    
    declineChallenge: function(component,event,helper)
    {
        var challenge = component.get('v.challenge');
        var action = component.get('c.handleChallenge');
        action.setParams({status:false});
        action.setCallback(this,function(response){
            component.set('v.challenge',null);

        });
        $A.enqueueAction(action);
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