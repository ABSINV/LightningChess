({
    /**
        This method creates the default location structure of our board. Later we will assign a piece to each of these locations  
    */
    createBaseBoard: function () {
        var locations = [];
        var row;
        for(var i = 0; i < 8; i++)
        {
            row = [];
            locations[i]=row;
            for(var j = 0; j < 8; j++)
            {
                row[j]={x:i, y:j};
            }
        }
        return locations;
        
    },

    /**
        This method will call the server side controller to obtain all chesspieces and assign them to the correct location
    */
    handleNewChessBoard: function(cmp,chessboard,helper){
        debugger;
        var action = cmp.get('c.getBoardPieces');
        action.setParams({'game':chessboard.Id});
        action.setCallback(this,function(response)
        {
            if(!cmp.isValid())
                return;
            if(response.getState() == 'SUCCESS')
            {
                var locations = helper.createBaseBoard();
                var pieces = response.getReturnValue();
                var u = cmp.get('v.currentUser');
                cmp.set('v.activeGame',chessboard);
                
                //Put each chess piece on its respective location
                helper.assignPieces(locations,pieces,cmp);
                cmp.set('v.locations',locations);

                helper.setPlayers(cmp);
                helper.setMyMove(cmp);
            }
            else
            {
                //implement better error handling
                alert('Error: handleNewChessBoard');
            }
            
        });

        $A.enqueueAction(action);
    },


    /**
        This method assigns the chesspieces to their starting location based on its coordinates. These coordinates are first transposed 
        based on the player's color. 
    */
    assignPieces: function(locations,pieces,cmp)
    {
        for(var i = 0; i < pieces.length; i++)
        {
            this.transposeChessPiece(pieces[i],cmp);
            locations[pieces[i].X_Coord__c][pieces[i].Y_Coord__c].piece = pieces[i];
        }
    },   
    
    /**
        Defines if the player used the white or the black pieces.
    */
    getPlayerColor: function(u,game)
    {
        if(game.Player_White__c == u)
            return 'White';
        else
            return 'Black';
    },
    
    /**
        This method handles a move received from the streaming api. It will check if this is a valid move for our current game.
        If it is the method will fire an event toward the locations to update accordingly.
    */
    handleNewChessboardMove: function(cmp,move,helper)
    {
        
        var activeGame = cmp.get('v.activeGame');
        if(activeGame.Id == move.ChessBoard__c)
        {
            //Obtain information from the server about the chesspiece and the chessboard
            var action = cmp.get('c.getBoardPiece');
            action.setParams({'chesspiece': move.ChessPiece__c, 'targetPiece':move.Target_Piece__c});
            action.setCallback(this,function(response){
                if(!cmp.isValid())
                    return;

                if(response.getState() == 'SUCCESS')
                {
                    var r = response.getReturnValue(); 
                    var chesspiece = r.chesspiece;
                    var targetPiece = r.targetPiece;
                    //Inform the location about the change.
                    var e = $A.get('e.c:Chessboard_Location_Move_Event');
                    e.setParams({
                        
                            'move':this.transposeMove(move,cmp),
                            'chesspiece':this.transposeChessPiece(chesspiece,cmp),
                            'targetPiece':this.transposeChessPiece(targetPiece,cmp)
                        
                        
                    });
                    e.fire();
                    
                    cmp.set('v.activeGame',r.chessboard);
                    if(r.chessboard.Winning_Player__c == cmp.get('v.currentUser'))
                    {
                        cmp.set('v.myMove',false);
                        alert('you have won the game');
                    }
                    else if(r.chessboard.Winning_Player__c != undefined && r.chessboard.Winning_Player__c != null)
                    {
                        cmp.set('v.myMove',false);
                        alert('you have lost the game')
                    }
                    else
                    {
                        helper.setMyMove(cmp);
                    }
                }
                else
                {
                    alert('error in handleNewChessboardMove');
                }
                

            }) 
            $A.enqueueAction(action);
        }
    },
    
    /**
        Create a new move on the server. This will send a notification to both player information the app about the change.
    */
    sendNewMove : function(cmp,helper,chesspiece,newX,newY,special)
    {
        var action = cmp.get('c.createNewMove');
        
        action.setParams({'chesspiece': this.transposeChessPiece(chesspiece,cmp), 'newX':this.transposeCoord(newX,7,cmp), 'newY':this.transposeCoord(newY,7,cmp), 'special': special});
        action.setCallback(this,function(response){
            if(!cmp.isValid())
                return;
            if(response.getState() == 'SUCCESS')
            {
                var chessboard = response.getReturnValue();
                cmp.set('v.activeGame',chessboard);                
            }
            else
            {
                alert('error sendNewMove');
            }

        })
        $A.enqueueAction(action);
    },

    /**
        Method tranposes a coordinate based on the user's color.
    */
    transposeCoord: function(x,total,cmp)
    {
        var color = this.getPlayerColor(cmp.get('v.currentUser'),cmp.get('v.activeGame'))
        if(color == 'White')
        {
            return total - x;
        }
        else
        {
            return x;
        }
    },
    
     /**
        This ensures that each player sees his/her pieces on the bottom of the board (in front of him).
        In the front end we keep working with the transposed coordinates. When sending them back to the server we again transpose them.
        Server side we always work with the original piece coordinates. This provides an additional layer between lightning and server.
    */
    transposeChessPiece: function(piece,cmp)
    {
        if(piece)
        {
            piece.X_Coord__c = this.transposeCoord(piece.X_Coord__c,7,cmp)
            piece.Y_Coord__c = this.transposeCoord(piece.Y_Coord__c,7,cmp)
            return piece;
        }
        
    },
    
    /**
        Transposes all coordinates on a move. This ensures that the correct pieces are move in the app.
    */
    transposeMove: function(move,cmp)
    {
        move.X_Destination__c = this.transposeCoord(move.X_Destination__c,7,cmp)
        move.Y_Destination__c = this.transposeCoord(move.Y_Destination__c,7,cmp)
        move.X_Origin__c = this.transposeCoord(move.X_Origin__c,7,cmp)
        move.Y_Origin__c = this.transposeCoord(move.Y_Origin__c,7,cmp);
        move.X_Direction__c = this.transposeCoord(move.X_Direction__c,0,cmp);
        move.Y_Direction__c = this.transposeCoord(move.Y_Direction__c,0,cmp);

        return move;
        
    },

    /**
        This method contain all the chess logic. It is able to retrieve a list of possible move for each of the pieces.
    */
    getPossibleLocations: function(loc,locations,color,turn)
    {
        ;
        var returnList = [];
        var l;
        if(loc.piece.Type__c == 'Pawn')
        {
            this.handlePawnLogic(loc,locations,returnList,color,turn)
            // loc.selected = true;
            
        }
        else if(loc.piece.Type__c == 'Knight')
        {
            this.handleKnightLogic(loc,locations,returnList,color);
        }
        else if(loc.piece.Type__c == 'Rook')
        {
            this.handleRookLogic(loc,locations,returnList,color);
        }
        else if(loc.piece.Type__c == 'Bishop')
        {
            this.handleBishopLogic(loc,locations,returnList,color);
        }
        else if(loc.piece.Type__c == 'Queen')
        {
            this.handleQueenLogic(loc,locations,returnList,color);
        }
        else if(loc.piece.Type__c == 'King')
        {
            this.handleKingLogic(loc,locations,returnList,color);
        }
        return returnList;
    },
    
    /**
        Handles all the possible locations for a pawn
    */
    handlePawnLogic : function(loc,locations,returnList,color,turn)
    {
        
        var l;
        var x = loc.piece.X_Coord__c;
        var y = loc.piece.Y_Coord__c;
        //Move one forward if not taken
        this.addSelectableLocation(x-1,y,locations,returnList,'WhiteBlack');
        //Move two from staring position      
        if(loc.x == 6)
        	this.addSelectableLocation(x-2,y,locations,returnList,'WhiteBlack');
        //Move right forward if taken
        this.addSelectableLocation(x-1,y+1,locations,returnList,color,true);
        //Move left forward if taken
       	this.addSelectableLocation(x-1,y-1,locations,returnList,color,true);

        if(this.checkEnPassant(x,y-1,locations,turn,color))
            this.addSelectableLocation(x-1,y-1,locations,returnList,color,false,'En passant');

        if(this.checkEnPassant(x,y+1,locations,turn,color))
            this.addSelectableLocation(x-1,y+1,locations,returnList,color,false,'En passant');

		return returnList;        
    },

    checkEnPassant : function(x,y,locations,turn,color)
    {
        if(this.inRange(x,y))
        {
            var l = locations[x][y];
            if(!$A.util.isEmpty(l.piece))
            {
                return l.piece.Type__c == 'Pawn' && l.piece.En_Passant_Turn__c == turn && l.piece.Piece_Color__c != color;
            }
        }
        return false;
    },
    
    /**
        Handles all the possible location for a knight
    */
    handleKnightLogic: function(loc, locations,returnList,color)
    {
        var x = loc.piece.X_Coord__c;
        var y = loc.piece.Y_Coord__c;
        this.addSelectableLocation(x-2,y-1,locations,returnList,color);
        this.addSelectableLocation(x-1,y-2,locations,returnList,color);
        this.addSelectableLocation(x+2,y-1,locations,returnList,color);
        this.addSelectableLocation(x+1,y-2,locations,returnList,color);
        this.addSelectableLocation(x-2,y+1,locations,returnList,color);
        this.addSelectableLocation(x-1,y+2,locations,returnList,color);
        this.addSelectableLocation(x+2,y+1,locations,returnList,color);
        this.addSelectableLocation(x+1,y+2,locations,returnList,color);                    
        return returnList;
    },
    
    /**
        Handles all the possible location for a rook
    */
    handleRookLogic: function(loc,locations,returnList,color)
    {
      	this.handleMovementInDirection(loc,locations,returnList,color,1,0,8);
        this.handleMovementInDirection(loc,locations,returnList,color,-1,0,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,0,1,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,0,-1,8);

    },
    
    /**
        Handles all the possible location for a bischop
    */
    handleBishopLogic: function(loc,locations,returnList,color)
    {
      	this.handleMovementInDirection(loc,locations,returnList,color,1,1,8);
        this.handleMovementInDirection(loc,locations,returnList,color,-1,-1,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,-1,1,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,1,-1,8);

    },

    /**
        Handles all the possible location for a queen
    */
    handleQueenLogic: function(loc,locations,returnList,color)
    {
      	this.handleMovementInDirection(loc,locations,returnList,color,1,1,8);
        this.handleMovementInDirection(loc,locations,returnList,color,-1,-1,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,-1,1,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,1,-1,8);
        this.handleMovementInDirection(loc,locations,returnList,color,1,0,8);
        this.handleMovementInDirection(loc,locations,returnList,color,-1,0,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,0,1,8);
      	this.handleMovementInDirection(loc,locations,returnList,color,0,-1,8);

    },

    /**
        Handles all the possible location for a king
    */
    handleKingLogic: function(loc,locations,returnList,color)
    {
        this.handleMovementInDirection(loc,locations,returnList,color,1,0,1);
        this.handleMovementInDirection(loc,locations,returnList,color,-1,0,1);
      	this.handleMovementInDirection(loc,locations,returnList,color,0,1,1);
      	this.handleMovementInDirection(loc,locations,returnList,color,0,-1,1);

        if(!loc.piece.Has_moved__c)
        {
            this.checkCastling(loc.piece.X_Coord__c,loc.piece.Y_Coord__c,locations,returnList,color,1)
            this.checkCastling(loc.piece.X_Coord__c,loc.piece.Y_Coord__c,locations,returnList,color,-1)
        }
                
    },

    checkCastling : function(x,y,locations,returnList,color,direction)
    {
        y += direction;
        if(this.inRange(x, y))
        {
            var l = locations[x][y];
            if($A.util.isEmpty(l.piece)){
                return this.checkCastling(x,y,locations,returnList,color,direction)
            }
            else if(l.piece.Type__c == 'Rook' && l.piece.Piece_Color__c == color && !l.piece.Has_moved__c)
            {
                 returnList.push(''+(x) + (y));
                 l.specialAction = 'Castling'
            }
            else {
                return false
            }
        }
        else
            return false;
        
    },
    
    /**
        This method generate a possible list of location in a certain direction. This direct is defined by the xdir and ydir parameter.
        for example xdir=-1 and ydir=0 will generate locations vertically up (or forward from the user's perspective).

        The color parameter is important to know a players color. The method will stop generating locations when it hits a piece.
        Depending on the color of the piece (friendly or hostile) it will be added or not.
        Adding WhiteBlack as color will ensure that once it hits a piece it will stop and not add the location as possible target.

        The last parameter is the movelimit. This put a limit on the amount of locations we will search.
    */
    handleMovementInDirection : function(loc,locations,returnList,color,xdir,ydir,moveLimit)
    {
        var x = loc.piece.X_Coord__c;
        var y = loc.piece.Y_Coord__c;
        var counter = 0;
        var valid = counter < moveLimit;
        while(valid)
        {
            x = x+xdir
            y = y+ydir
            counter++;
            valid = this.addSelectableLocation(x,y,locations,returnList,color) && counter < moveLimit;
            
        }
    },
    
    /**
        This method defines if a location on the provided coordinates can be added or not.
        The color parameter is again to check if we add the location or not if it has a piece on top of it.
        The not empty parameter is especially for the pawn logic. Pawn can only move diagonally when it contain a piece of the 
        opposite side.
    */
    addSelectableLocation: function(x,y,locations,returnList,color,notEmpty,special)
    {
        if(this.inRange(x,y))
        {
            var l = locations[x][y]
            if((!$A.util.isEmpty(l.piece) && color.indexOf(l.piece.Piece_Color__c) == -1)
               		|| ($A.util.isEmpty(l.piece) && !notEmpty))
            {
                l.specialAction = special;
                returnList.push(''+(x) + (y));
                return $A.util.isEmpty(l.piece);
            }
           	
        }
        return false;
	},

    inRange : function(x,y){
        return x < 8 && x >= 0 && y < 8 && y >= 0;
    }
    
})