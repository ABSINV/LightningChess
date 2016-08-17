({
	doInit: function (cmp, event, helper) {
        var location = cmp.get('v.location');
        //Assign an initial piece to the location. If none by default then the piece remains empty.
        cmp.set('v.piece',location.piece);
	},
    
    handleLocationClick: function(cmp,event,helper)
    {
        var location = cmp.get('v.location');
        var e = cmp.getEvent('click');
        e.setParams({'location':location});
        e.fire();   
    },
    
    handleActionEvent: function(cmp,event,helper)
    {
        var actionType = event.getParam('actionType');
        var location = cmp.get('v.location');
		var payload = event.getParam('payload')
        if(actionType == 'setSelectable')
        {
            var locations = payload.locations;
            if(locations.indexOf(""+location.x+location.y) != -1)
            {
                location.selected = true;
                cmp.set('v.isSelected',true);
            }
            else
            {
                location.selected = false;
                cmp.set('v.isSelected',false);

            }
            cmp.set('v.location',location);
        }
        else if(actionType == 'newMove')
        {
            
            var move = payload.move;
            var newPiece = location.piece;
            if(location.x == move.X_Origin__c && location.y == move.Y_Origin__c)
            {
                if(!move.Castling__c)
                    newPiece = null;
                else
                {
                    newPiece = payload.targetPiece;
                }
            }
            else if(location.x == move.X_Destination__c && location.y == move.Y_Destination__c)
            {
               
                newPiece = payload.chesspiece;
                
            }
            else if(move.En_Passant__c && location.y == payload.targetPiece.Y_Coord__c && location.x == payload.targetPiece.X_Coord__c)
            {
                newPiece = null;
            }
            location.piece = newPiece;
            cmp.set('v.location',location);
            cmp.set('v.piece',newPiece);
        }
    }
})