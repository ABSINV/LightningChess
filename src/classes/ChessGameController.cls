public class ChessGameController {
    
    /**
        This method creates a new chess game for the provided users.
    */
    public static void createNewChessGame(Id u1,Id u2)
    {
        ChessBoard__c game = new ChessBoard__c();
        game.Player_White__c = u1;
        game.Player_Black__c = u2;
        game.Game_Status__c = 'New';
        game.Current_Player__c = 'White';
        game.Current_Turn__c = 1;
        insert game;
        createInitialPieces(game.Id);
    }
    
    /**
        This method return a list of all chesspieces for a certain chess game.
    */
    @AuraEnabled
    public static Object getBoardPieces(Id game)
    {
        return [select Id,Active__c,ChessBoard__c,Piece_Color__c,Type__c,X_Coord__c,Y_Coord__c,Has_Moved__c,En_Passant_Turn__c from ChessPiece__c where ChessBoard__c = :game];
    }
    
    /**
        This method returns information on a chesspiece based on its id. It also returns the chessboard information.
    */
    @AuraEnabled
    public static Map<String,Object> getBoardPiece(Id chesspiece,Id targetPiece)
    {
        Map<String,Object> returnMap = new Map<String,Object>();
        Id board;
        for(ChessPiece__c p : [select Id,Active__c,ChessBoard__c,Piece_Color__c,Type__c,X_Coord__c,Y_Coord__c,Has_Moved__c,En_Passant_Turn__c from ChessPiece__c where Id = :chesspiece or Id = :targetPiece])
        {
            if(p.Id == chesspiece){
                board = p.ChessBoard__c;
                returnMap.put('chesspiece',p );
            }
            else if(p.Id == targetPiece )
                returnMap.put('targetPiece',p);
        }
    	
		ChessBoard__c b = [SELECT Id,Current_Player__c,Game_Status__c,Player_Black__c,Player_White__c,Black_Name__c,White_Name__c,Winning_Player__c,Current_Turn__c FROM ChessBoard__c where id = :board];
        returnMap.put('chessboard',b);
        return returnMap;
    }
    
    /**
        This method creates a new move for a certain chess pieces. The provided decimals are the new coordinates for the chesspiece.
    */
    @AuraEnabled
    public static Object createNewMove(ChessPiece__c chesspiece, Decimal newX, Decimal newY,String special)
    {
        System.SavePoint sp = Database.setSavepoint();
        try{
            ChessboardMove__c move = new ChessboardMove__c();
            move.ChessBoard__c = chesspiece.ChessBoard__c;
            move.ChessPiece__c = chesspiece.Id;
            move.X_Destination__c = newX;
            move.Y_Destination__c = newY;
            move.X_Origin__c = chesspiece.X_Coord__c;
            move.Y_Origin__c = chesspiece.Y_Coord__c;
        
            if(special == 'En passant')
                move.En_Passant__c = true;
            else if(special == 'Castling')
                move.Castling__c = true; 
            
            ChessPiece__c targetPiece = setTargetPiece(move);           
            insert move;
            
            chesspiece.X_Coord__c = newX;
            chesspiece.Y_Coord__c = newY;
            chesspiece.Has_Moved__c = true;
            update chesspiece;
            
            ChessBoard__c cb = [SELECT Id,Current_Player__c,Game_Status__c,Player_Black__c,Player_White__c,Winning_Player__c,Current_Turn__c FROM ChessBoard__c where Id = :chesspiece.ChessBoard__c];
			if(cb.Player_White__c == UserInfo.getUserId())
                cb.Current_Player__c = 'Black';
            else
                cb.Current_Player__c = 'White';
            cb.Current_Turn__c += 1;

            if(targetPiece != null && targetPiece.Type__c == 'King')
            {
                cb.Winning_Player__c = UserInfo.getUserId();
                List<Id> userIds = new List<Id>();
                userIds.add(cb.Player_White__c); userIds.add(cb.Player_Black__c);
                LoggedInUserController.setPlayersActive(userIds);
            }
            update cb;
            return cb;
        }
        catch(Exception e)
        {
            Database.rollback(sp);
            //return errormessage
            return e.getStackTraceString();
        }
        
    }

    private static ChessPiece__c setTargetPiece(ChessboardMove__c move)
    {
        ChessPiece__c targetPiece;
        if(move.En_Passant__c)
        {
            targetPiece = getTargetPiece(move.X_Destination__c + ((move.X_Destination__c - move.X_Origin__c)*-1),move.Y_Destination__c,move.ChessBoard__c);
            targetPiece.Active__c = false;
        }
        else if(move.Castling__c)
        {
            targetPiece = getTargetPiece(move.X_Destination__c,move.Y_Destination__c,move.ChessBoard__c);
            targetPiece.X_Coord__c = move.X_Origin__c;
            targetPiece.Y_Coord__c = move.Y_Origin__c;
            targetPiece.Has_Moved__c = true;
        }
        else
        {
            targetPiece = getTargetPiece(move.X_Destination__c,move.Y_Destination__c,move.ChessBoard__c);
            if(targetPiece != null)
                targetPiece.Active__c = false;
            
        }
        System.debug(move);
        System.debug(targetPiece);
        if(targetPiece != null)
        {
             move.Target_Piece__c = targetPiece.Id;
             update targetPiece;
        }
       
        return targetPiece;
    }

    private static ChessPiece__c getTargetPiece(Decimal x, Decimal y,Id chessboard)
    {
        List<ChessPiece__c> pieces = [select id,Type__c from ChessPiece__c where ChessBoard__c=:chessboard and X_Coord__c = :x and Y_Coord__c = :y and Active__c = true limit 1];
        if(pieces.size() > 0)
        {
            return pieces.get(0);
        }
        return null;
     }

    /**
        This method creates all 24 chesspieces or that own starting point. hence coordinates are not transposed here.
    */
    public static void createInitialPieces(Id board)
    {
        List<ChessPiece__c> pieces = new List<ChessPiece__c>();
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Rook',X_Coord__c=0,Y_Coord__c=0));
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Knight',X_Coord__c=0,Y_Coord__c=1));        
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Bishop',X_Coord__c=0,Y_Coord__c=2));       
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Queen',X_Coord__c=0,Y_Coord__c=4));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'King',X_Coord__c=0,Y_Coord__c=3));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Bishop',X_Coord__c=0,Y_Coord__c=5));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Knight',X_Coord__c=0,Y_Coord__c=6));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Rook',X_Coord__c=0,Y_Coord__c=7));     
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=0));   
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=1));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=2));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=3));
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=4));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=5));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=6));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'White',Type__c = 'Pawn',X_Coord__c=1,Y_Coord__c=7));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Rook',X_Coord__c=7,Y_Coord__c=0));
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Knight',X_Coord__c=7,Y_Coord__c=1));        
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Bishop',X_Coord__c=7,Y_Coord__c=2));       
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Queen',X_Coord__c=7,Y_Coord__c=4));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'King',X_Coord__c=7,Y_Coord__c=3));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Bishop',X_Coord__c=7,Y_Coord__c=5));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Knight',X_Coord__c=7,Y_Coord__c=6));      
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Rook',X_Coord__c=7,Y_Coord__c=7));     
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=0));   
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=1));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=2));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=3));
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=4));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=5));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=6));    
        pieces.add(new ChessPiece__c(ChessBoard__c=board,Piece_Color__c = 'Black',Type__c = 'Pawn',X_Coord__c=6,Y_Coord__c=7)); 
        insert pieces;
        
        
    }
    
    @AuraEnabled
    public static Object getUser(){
        return UserInfo.getUserId();
    }
    
}