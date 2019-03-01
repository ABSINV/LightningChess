({
	doInit: function (cmp, event, helper) {
        var location = cmp.get('v.location');
        //Assign an initial piece to the location. If none by default then the piece remains empty.
        cmp.set('v.piece',location.piece);
        cmp.set('v.locationHistory',[location.piece]);
    },
    
    handleLocationClick: function(cmp,event,helper)
    {
        if(!cmp.get('v.isSelected'))
            helper.notifyAsSelected(cmp);
        else
            helper.notifyAsTarget(cmp);
    },

    handleDragStart : function(cmp,event,helper)
    {
        helper.notifyAsSelected(cmp);
    },

    handleDrop : function(cmp,event,helper)
    {
        helper.notifyAsTarget(cmp);
    },

    handleDragOver : function(cmp,event,helper)
    {
        if(cmp.get('v.isSelected'))
        {
            event.preventDefault();
        }
    },
    
    handleMoveEvent: function(cmp,event,helper)
    {
        var location = cmp.get('v.location');        

        var move = event.getParam('move');
        var chesspiece = event.getParam('chesspiece');
        var targetPiece = event.getParam('targetPiece');

        var newPiece = location.piece;

        //Save the location state, to be used when going forward and backwards previous moves
        var history = cmp.get('v.locationHistory');
        history.push(newPiece);
        cmp.set('v.locationHistory',history);

        if(location.x == move.X_Origin__c && location.y == move.Y_Origin__c)
        {
            if(!move.Castling__c)
                newPiece = null;
            else
            {
                newPiece = targetPiece;
            }
        }
        else if(location.x == move.X_Destination__c && location.y == move.Y_Destination__c)
        {

            newPiece = chesspiece;

        }
        else if(move.En_Passant__c && location.y == targetPiece.Y_Coord__c && location.x == targetPiece.X_Coord__c)
        {
            newPiece = null;
        }
        location.piece = newPiece;
        cmp.set('v.location',location);
        cmp.set('v.piece',newPiece);
        
    },

    handleSelectionEvent: function(cmp,event,helper)
    {
        var location = cmp.get('v.location');
        var coordinates = event.getParam('coordinates')
        
        if(coordinates.indexOf(""+location.x+location.y) != -1)
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

    },

})