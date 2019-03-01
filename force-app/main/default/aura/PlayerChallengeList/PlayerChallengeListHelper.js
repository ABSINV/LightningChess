({
	handleNewChallenge : function(cmp,event) {

		var obj = event.getParam('sObject');
		var e = event.getParam('event');
		if(e.type == 'created')
		{
			var currentUser = cmp.get('v.currentUser');
			if(obj.Challenged_User__c == currentUser)
			{
				var challenges = cmp.get('v.challenges');
				challenges.push(obj);
				cmp.set('v.challenges',challenges);
			}
		}
		else if (e.type == 'deleted')
		{
			var challenges = cmp.get('v.challenges');
			for(var i = 0; i < challenges.length;i++)
			{
				if(challenges[i].Id == obj.Id)
				{
					challenges.splice(i,1);
					break;
				}
			}
			cmp.set('v.challenges',challenges)
		}
		

	},

	handleChallengeResponse : function(cmp,id,status)
	{
		var action = cmp.get('c.handePlayerChallenge');
        action.setParams({status:status,challengeId:id});
        action.setCallback(this,function(response){    
            
            if(response.status == 'SUCCESS')
            {
                cmp.set('challenges',[]);
            }
        });
        $A.enqueueAction(action);

	}
})