/* eslint-disable no-useless-return */
/* eslint-disable no-else-return */
import { LightningElement, api, track } from 'lwc';
import getBoardPieces from "@salesforce/apex/ChessGameController.getBoardPieces"; 
import {createBaseBoard,transposeChessPieces,getPossibleLocations} from 'c/lcChessService';

export default class LcChessboard extends LightningElement {

    @api
    activeGame;
    @api
    currentUser;
    @track
    playerColor;
    @track
    locations;
    selectedPiece;

    connectedCallback()
    {
        this.setPlayerColor();
        getBoardPieces({game:this.activeGame.Id}).then(result => {
            let chessPieces = transposeChessPieces(result,this.transposeRequired);
            this.locations = createBaseBoard(chessPieces);
        });
    }

    setPlayerColor()
    {
        if(this.activeGame.Player_White__c === this.currentUser)
            this.playerColor = 'White';
        else
            this.playerColor = 'Black';
    }

    //UI getter to display the opponent's name
    get opponent(){
        if(this.playerColor === 'White')
            return this.activeGame.Black_Name__c;
        else
            return this.activeGame.White_Name__c;
    }

    //UI getter to display the player's name
    get player(){
        if(this.playerColor === 'Black')
            return this.activeGame.Black_Name__c;
        else
            return this.activeGame.White_Name__c;
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
            debugger;
            let possibleLocation = getPossibleLocations(location,this.locations,this.playerColor,this.activeGame.Current_Turn__c);
            console.log(possibleLocation);
        }   
    }

    handleLocationTarget()
    {

    }

    
}