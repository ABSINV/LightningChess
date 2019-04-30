({
    setupStreaming: function(component,event,helper)
    {	var action = component.get('c.getSession');
     	action.setCallback(this,function(response){
            //var sessionId = component.get('v.sessionId');
            var sessionId = response.getReturnValue();
            var listeners = component.get('v.listeners').split(',');
            //check if the url is already set on cometd; if so there is another listener component instantiated and we can skip the following part.
            var url = $.cometd.getURL();
            if(url == undefined)
            {
                $.cometd.init({
                    url: window.location.protocol+'//'+window.location.hostname+'/cometd/35.0/',
                    requestHeaders: { Authorization: 'OAuth '+sessionId},appendMessageTypeToURL : false
                });            
            }            
            
            for(var i = 0; i < listeners.length;i++)
            {
                $.cometd.subscribe('/topic/'+listeners[i],$A.getCallback(function(message) {
                   
                    var event = $A.get('e.c:StreamingEvent');            
                    event.setParams(
                        {
                            "sObject":message.data.sobject,
                            "event":message.data.event,
                            "eventType":message.channel.replace('/topic/','')
                        }
                    );
                    event.fire();
                }));
            }
         
        });
        $A.enqueueAction(action);
     
    },
    
    closeConnections: function(component,event){
        $.cometd.disconnect();
    }
    
    
    
})