export function createBaseBoard(chessPieces){
    let locations = [];
    let row;
    for(let i = 0; i < 8; i++)
    {
        row = [];
        locations[i]=row;
        for(let j = 0; j < 8; j++)
        {
            row[j]={x:i, y:j, Id:""+i+j};
        }
    }

    assignChessPieces(locations,chessPieces);
    return locations;
}

export function assignChessPieces(locations,chessPieces) 
{
    for(let i = 0; i < chessPieces.length; i++)
    {
        locations[chessPieces[i].X_Coord__c][chessPieces[i].Y_Coord__c].piece = chessPieces[i];
    }
}


export function transposeChessPieces(chessPieces,transposeRequired)
{
    if(!transposeRequired)
        return chessPieces;
    
    let returnArray = [];
    chessPieces.forEach(chessPiece => {
        returnArray.push(transposeChessPiece(chessPiece,transposeRequired));
    });
    return returnArray;
}

export function transposeChessPiece(chessPiece,transposeRequired)
{
    if(chessPiece && transposeRequired)
    {
        chessPiece.X_Coord__c = transposeCoord(chessPiece.X_Coord__c,7)
        chessPiece.Y_Coord__c = transposeCoord(chessPiece.Y_Coord__c,7)
    }
    return chessPiece;
}

export function transposeCoord(x,total)
{
    return total - x;
}

export function getPossibleLocations(location,locations,playerColor,currentTurn)
{
    let returnList = [];

    switch(location.piece.Type__c)
    {
        case 'Pawn':
            handlePawnLogic(location,locations,returnList,playerColor,currentTurn);
            break;
        case 'Knight':
            handleKnightLogic(location,locations,returnList,playerColor);
            break;
        case 'Rook':
            handleRookLogic(location,locations,returnList,playerColor);
            break;
        case 'Bishop':
            handleBishopLogic(location,locations,returnList,playerColor);
            break;
        case 'Queen':
            handleQueenLogic(location,locations,returnList,playerColor);
            break;
        case 'King':
            handleKingLogic(location,locations,returnList,playerColor);
            break;
        default:
            break;
    }
    return returnList;
}

 function handlePawnLogic(loc,locations,returnList,color,turn)
{
    let x = loc.piece.X_Coord__c;
    let y = loc.piece.Y_Coord__c;
    //Move one forward if not taken
    addSelectableLocation(x-1,y,locations,returnList,'WhiteBlack');
    //Move two from staring position      
    if(loc.x === 6)
        addSelectableLocation(x-2,y,locations,returnList,'WhiteBlack');
    //Move right forward if taken
    addSelectableLocation(x-1,y+1,locations,returnList,color,true);
    //Move left forward if taken
    addSelectableLocation(x-1,y-1,locations,returnList,color,true);

    if(checkEnPassant(x,y-1,locations,turn,color))
        addSelectableLocation(x-1,y-1,locations,returnList,color,false,'En passant');

    if(checkEnPassant(x,y+1,locations,turn,color))
        addSelectableLocation(x-1,y+1,locations,returnList,color,false,'En passant');

    return returnList;        
}

function checkEnPassant(x,y,locations,turn,color)
{
    if(inRange(x,y))
    {
        let l = locations[x][y];
        if(l.piece)
        {
            //En_Passent_Turn__c is set on the server when the pawn moves two forward. It tells us that the target pieces
            //is vulnerable for enpassant in turn x
            return l.piece.Type__c === 'Pawn' && l.piece.En_Passant_Turn__c === turn && l.piece.Piece_Color__c !== color;
        }
    }
    return false;
}
    
/**
    Handles all the possible location for a knight
*/
function handleKnightLogic(loc, locations,returnList,color)
{
    let x = loc.piece.X_Coord__c;
    let y = loc.piece.Y_Coord__c;
    addSelectableLocation(x-2,y-1,locations,returnList,color);
    addSelectableLocation(x-1,y-2,locations,returnList,color);
    addSelectableLocation(x+2,y-1,locations,returnList,color);
    addSelectableLocation(x+1,y-2,locations,returnList,color);
    addSelectableLocation(x-2,y+1,locations,returnList,color);
    addSelectableLocation(x-1,y+2,locations,returnList,color);
    addSelectableLocation(x+2,y+1,locations,returnList,color);
    addSelectableLocation(x+1,y+2,locations,returnList,color);                    
    return returnList;
}
    
    /**
        Handles all the possible location for a rook
    */
function handleRookLogic(loc,locations,returnList,color)
{
    handleMovementInDirection(loc,locations,returnList,color,1,0,8);
    handleMovementInDirection(loc,locations,returnList,color,-1,0,8);
    handleMovementInDirection(loc,locations,returnList,color,0,1,8);
    handleMovementInDirection(loc,locations,returnList,color,0,-1,8);
}
    
    /**
        Handles all the possible location for a bischop
    */
function handleBishopLogic(loc,locations,returnList,color)
{
    handleMovementInDirection(loc,locations,returnList,color,1,1,8);
    handleMovementInDirection(loc,locations,returnList,color,-1,-1,8);
    handleMovementInDirection(loc,locations,returnList,color,-1,1,8);
    handleMovementInDirection(loc,locations,returnList,color,1,-1,8);
}

    /**
        Handles all the possible location for a queen
    */
function handleQueenLogic (loc,locations,returnList,color)
{
    handleMovementInDirection(loc,locations,returnList,color,1,1,8);
    handleMovementInDirection(loc,locations,returnList,color,-1,-1,8);
    handleMovementInDirection(loc,locations,returnList,color,-1,1,8);
    handleMovementInDirection(loc,locations,returnList,color,1,-1,8);
    handleMovementInDirection(loc,locations,returnList,color,1,0,8);
    handleMovementInDirection(loc,locations,returnList,color,-1,0,8);
    handleMovementInDirection(loc,locations,returnList,color,0,1,8);
    handleMovementInDirection(loc,locations,returnList,color,0,-1,8);
}

    /**
        Handles all the possible location for a king
    */
function handleKingLogic(loc,locations,returnList,color)
{
    handleMovementInDirection(loc,locations,returnList,color,1,0,1);
    handleMovementInDirection(loc,locations,returnList,color,-1,0,1);
    handleMovementInDirection(loc,locations,returnList,color,0,1,1);
    handleMovementInDirection(loc,locations,returnList,color,0,-1,1);

    if(!loc.piece.Has_moved__c)
    {
        checkCastling(loc.piece.X_Coord__c,loc.piece.Y_Coord__c,locations,returnList,color,1)
        checkCastling(loc.piece.X_Coord__c,loc.piece.Y_Coord__c,locations,returnList,color,-1)
    }
            
}

function checkCastling(x,y,locations,returnList,color,direction)
{
    y += direction;
    if(inRange(x, y))
    {
        let l = locations[x][y];
        if(l.piece){
            checkCastling(x,y,locations,returnList,color,direction)
        }
        else if(l.piece.Type__c === 'Rook' && l.piece.Piece_Color__c === color && !l.piece.Has_moved__c)
        {
            returnList.push(''+(x) + (y));
            l.specialAction = 'Castling'
        }
    }
}

/**
    This method generate a possible list of location in a certain direction. This direct is defined by the xdir and ydir parameter.
    for example xdir=-1 and ydir=0 will generate locations vertically up (or forward from the user's perspective).

    The color parameter is important to know a players color. The method will stop generating locations when it hits a piece.
    Depending on the color of the piece (friendly or hostile) it will be added or not.
    Adding WhiteBlack as color will ensure that once it hits a piece it will stop and not add the location as possible target.

    The last parameter is the movelimit. This put a limit on the amount of locations we will search.
*/
function handleMovementInDirection(loc,locations,returnList,color,xdir,ydir,moveLimit)
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
        valid = addSelectableLocation(x,y,locations,returnList,color) && counter < moveLimit;
        
    }
}
   
/**
     This method defines if a location on the provided coordinates can be added or not.
    The color parameter is again to check if we add the location or not if it has a piece on top of it.
    The not empty parameter is especially for the pawn logic. Pawn can only move diagonally when it contain a piece of the 
    opposite side.
*/
function addSelectableLocation(x,y,locations,returnList,color,notEmpty,special)
{
    if(inRange(x,y))
    {
        let l = locations[x][y]
        if((l.piece && color.indexOf(l.piece.Piece_Color__c) == -1)
                    || (!l.piece && !notEmpty))
        {
            l.specialAction = special;
            returnList.push(''+(x) + (y));
            return !l.piece;
        }
            
    }
    return false;
}

function inRange(x,y)
{
    return x < 8 && x >= 0 && y < 8 && y >= 0;
}