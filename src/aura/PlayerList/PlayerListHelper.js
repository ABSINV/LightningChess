({
    handleLoggedInPlayer: function(component, sobject, event, helper) {
        var u = component.get('v.currentUser');
        var p = component.get('v.players');

        if (event.type == 'created') {
            //Add the new user
            if (u != sobject.User__c) {
                p.push(sobject);
                component.set('v.players', p);
            }
        } else if (event.type == 'deleted') {
            //remove the user
            var index = helper.findIndexOfObjectInList(p, sobject, 'Id');
            if (index != -1) {
                p.splice(index, 1);
                component.set('v.players', p);
            }

        } else if (event.type == 'updated') {

            var index = helper.findIndexOfObjectInList(p, sobject, 'Id');
            if (index != -1) {
                p.splice(index, 1, sobject);
                component.set('v.players', p);
            }
        }
    },

    findIndexOfObjectInList: function(list, object, identifier) {
        for (var i = 0; i < list.length; i++) {
            if (object[identifier] == list[i][identifier])
                return i;
        }
        return -1;
    },

    keepAlive: function(cmp, event, helper) {
        window.setTimeout(
            //Use this to make sure the function is executed in the aura rendering cycle
            $A.getCallback(function() {
                //Do extra check to see if the cmp still exists. Invalid when navigated somewhere else or component was destroyed
                ;
                if (cmp.isValid()) {
                    var action = cmp.get('c.keepSessionAlive');
                    action.setCallback(this, function(response) {
                        cmp.set('v.players', response.getReturnValue());
                        helper.keepAlive(cmp, event, helper);
                    })
                    $A.enqueueAction(action);
                }
            }),
            10000
        )
    },
})