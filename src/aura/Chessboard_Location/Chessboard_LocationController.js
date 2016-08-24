({
    /*
        Method call upon component init.
    */
	doInit: function (cmp, event, helper) {
        var location = cmp.get('v.location');
        //Assign an initial piece to the location. If none by default then the piece remains empty.
        cmp.set('v.piece',location.piece);
        cmp.set('v.locationHistory',[location.piece]);
    },
    
    /*
        Handles the click on the location. 
        If the location is not selected a selection event will be fired.
        If the location was selected a target event is fired
    */
     handleLocationClick: function(cmp,event,helper)
    {
        if(!cmp.get('v.isSelected'))
            helper.notifyAsSelected(cmp);
        else
            helper.notifyAsTarget(cmp);
    },
    
    /*
        Handles a move event. Based on the provided data on the move object the location will update its state.
    */
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

        //Move matches this location as origin
        if(location.x == move.X_Origin__c && location.y == move.Y_Origin__c)
        {
            //No special move, remove the piece currently on this location. This is the piece that moved.
            if(!move.Castling__c)
                newPiece = null;
            else
            {
                //Switch places.
                newPiece = targetPiece;
            }
        }
        // Location matches the destination of the move.
        else if(location.x == move.X_Destination__c && location.y == move.Y_Destination__c)
        {
            //Set chess piece that moved as new piece in this location.
            newPiece = chesspiece;

        }
        //Special move en passent. Location matches the target piece location.
        else if(move.En_Passant__c && location.y == targetPiece.Y_Coord__c && location.x == targetPiece.X_Coord__c)
        {
            //Remove the piece.
            newPiece = null;
        }

        location.piece = newPiece;
        cmp.set('v.location',location);
        cmp.set('v.piece',newPiece);
        
    },

    /*
        Handles the event that marks locations as targetable. Method checks if this location is part of the targetable locations.
    */
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

    }
})