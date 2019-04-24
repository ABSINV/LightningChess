({
	doInit : function(component, event, helper) {
		//call Server Side method
		var challenges = [];
		component.set('v.challenges',challenges);
       
	}, 

	handleStreamingEvent: function(component,event,helper)
    {
        switch(event.getParam('eventType')){
            case 'UserGameChallenge':
                console.log('new challenge arrived');
                
                helper.handleNewChallenge(component,event);

        }
    },

    acceptChallenge: function(component,event,helper)
    {
        
        var challengeId = event.currentTarget.id;
        helper.handleChallengeResponse(component,challengeId,true);
    },

    rejectChallenge: function(cmp,event,helper)
    {
        var challengeId = event.currentTarget.id;
        helper.handleChallengeResponse(cmp,challengeId,false);
    }
})