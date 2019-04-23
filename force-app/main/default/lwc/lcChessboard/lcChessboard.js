/* eslint-disable no-useless-return */
/* eslint-disable no-else-return */
import { LightningElement, api, track,wire } from 'lwc';
import getBoardPieces from "@salesforce/apex/ChessGameController.getBoardPieces"; 
import createNewMove from "@salesforce/apex/ChessGameController.createNewMove"; 
import getBoardPiece from "@salesforce/apex/ChessGameController.getBoardPiece";
import {createBaseBoard,transposeChessPieces,transposeChessPiece,transposeMove,transposeCoord,getPossibleLocations} from 'c/lcChessService';
import { fireEvent, registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class LcChessboard extends LightningElement {

    @api activeGame;
    @api currentUser;
    
    @track playerColor;
    @track locations;
    @track opponent;
    @track player;

    @wire(CurrentPageReference) pageRef;
    
    selectedPiece;

    connectedCallback()
    {
        this.setPlayerColor();
        this.opponent = this.activeGame.Black_Name__c;
        this.player = this.activeGame.White_Name__c;

        getBoardPieces({game:this.activeGame.Id}).then(result => {
            let chessPieces = transposeChessPieces(result,this.transposeRequired);
            this.locations = createBaseBoard(chessPieces);
        });
        registerListener('StreamingEvent',this.handleStreamingEvent,this);
    }

    setPlayerColor()
    {
        if(this.activeGame.Player_White__c === this.currentUser)
            this.playerColor = 'White';
        else
            this.playerColor = 'Black';
    }

    get myMove(){
        return `${this.activeGame.Current_Player__c}` === this.playerColor;
    }

    /**
    * The white player will play with a reversed board (as compared to the stored coords on the server) therefor all coords will be transposed when
    * retrieved and send to the server.
    */
    get transposeRequired(){
        return this.playerColor === 'White';
    }

    handleLocationSelect(event)
    {
        if(!this.myMove)
            return;

        let location = event.detail;
        if(location.piece && location.piece.Piece_Color__c === this.playerColor && (location.specialAction !== 'Castling' || !location.selected))
        {
            this.selectedPiece = location.piece;
            let possibleLocation = getPossibleLocations(location,this.locations,this.playerColor,this.activeGame.Current_Turn__c);
            fireEvent(this.pageRef,'MarkLocations',{coordinates : possibleLocation, type: 'select'})
        }   
    }

    handleLocationTarget(event)
    {
        if(!this.myMove)
            return;
        
        let location = event.detail;
        if(this.selectedPiece.Type__c === 'Pawn' && location.x == 0)
        {
            //handle promotion of the pawn...
        }
        else
        {
            this.sendNewMove(location);
        }
    
    }

    sendNewMove(location)
    {
        createNewMove({
            chesspiece:transposeChessPiece(Object.assign({},this.selectedPiece),this.transposeRequired),
            newX: this.transposeRequired ? transposeCoord(location.x,7) : location.x,
            newY: this.transposeRequired ? transposeCoord(location.y,7) : location.y,
            special:location.special
        }).then(result => {
            this.dispatchEvent(new CustomEvent('gamechange',{detail:result}));
        }).catch(error => {
            //Handle error
            alert('error during move');
        });

        fireEvent(this.pageRef,'MarkLocations',{coordinates : [''+(location.x) + (location.y)], type: 'target'})
    }

    handleNewChessboardMove(move)
    {
        if(this.activeGame.Id === move.ChessBoard__c)
        {
            //Obtain information from the server about the chesspiece and the chessboard
            
            let params = {'chesspiece': move.ChessPiece__c, 'targetPiece':move.Target_Piece__c};
            getBoardPiece(params).then(result => {
                 
                    let chesspiece = result.chesspiece;
                    let targetPiece = result.targetPiece;
                    //Inform the location about the change.
                    let transposedMove = transposeMove(move,this.transposeRequired);
                    fireEvent(this.pageRef,'MoveEvent',{
                        'move':transposedMove,
                        'chesspiece':transposeChessPiece(chesspiece,this.transposeRequired),
                        'targetPiece':transposeChessPiece(targetPiece,this.transposeRequired)
                    });

                    //Mark the location to which the piece moved as a target.
                    fireEvent(this.pageRef,'MarkLocations',{coordinates : [('' + (transposedMove.X_Destination__c) + (transposedMove.Y_Destination__c))], type: 'target'})

                    //Update the chessboard
                    this.dispatchEvent(new CustomEvent('gamechange',{detail:result.chessboard}));
                    let targetLocation = this.locations[move.X_Destination__c][move.Y_Destination__c];
                    let sourceLocation = this.locations[move.X_Origin__c][move.Y_Origin__c]; 
                    targetLocation.piece = chesspiece;
                    sourceLocation.piece = null;                     
            }).catch(error => {
                alert('error during handling new move');
            });
           
        }
    }

   handleStreamingEvent(data)
   {
    //Check if the received event is related to a new chessboardmove
        switch(data.eventType){
            case 'NewChessboardMove':
                this.handleNewChessboardMove(data.sObject);
                break;
            default:
                break;
        }
    }




    
}