/* eslint-disable no-else-return */
import { LightningElement, api, track,wire } from 'lwc';
import { registerListener } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class LcChessboardLocation extends LightningElement {

    @api location;
    
    @wire(CurrentPageReference) pageRef;

    @track piece;
    @track isMarked = false;
    @track isTargeted = false;

    xCoord;
    yCoord;
    
    connectedCallback()
    {
        this.piece = this.location.piece;
        this.xCoord = this.location.x;
        this.yCoord = this.location.y;
        registerListener('MarkLocations',this.handleMarkLocation,this);
        registerListener('MoveEvent',this.handleNewMove,this);

    }

    get locationContentClass()
    {
        return `${this.piece ? (this.piece.Piece_Color__c + this.piece.Type__c) : ''} content`;
    }

    get locationClass()
    {
        let classNames="ChessBoardLocation";
        let color;
		if(((this.location.x + this.location.y) % 2) === 0)
			color = 'white';
		else
            color = 'black';
        
        classNames += " " + color;
        classNames += `${(this.isMarked ? ' selected ':'') + (this.isTargeted ? ' targeted ' : '')}`;
        return classNames;
    }

    handleLocationClick()
    {
        let evt;
        if(this.isMarked)
        {
            evt = new CustomEvent("locationtarget",{detail:this.location});
        }
        else
        {
            evt = new CustomEvent("locationselect",{detail:this.location});
        }

        this.dispatchEvent(evt);
    }

    handleMarkLocation(data)
    {
        let coordinates = data.coordinates;
        let isMarked = coordinates.indexOf(''+this.xCoord+this.yCoord) !== -1;

        this.isMarked = false;
        this.isTargeted = false;
        if(data.type === 'select' && isMarked)
        {
            this.isMarked = true;
        }
        else if(data.type === 'target' && isMarked)
        {
            this.isTargeted = true;
        }
    }

    handleNewMove(data)
    {
        let move = data.move;
        let chesspiece = data.chesspiece;
        let targetPiece = data.targetPiece;

        let newPiece = this.piece;

        //Move matches this location as origin
        if(this.location.x === move.X_Origin__c && this.location.y === move.Y_Origin__c)
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
        else if(this.location.x === move.X_Destination__c && this.location.y === move.Y_Destination__c)
        {
            //Set chess piece that moved as new piece in this location.
            newPiece = chesspiece;

        }
        //Special move en passent. Location matches the target piece location.
        else if(move.En_Passant__c && this.location.y === targetPiece.Y_Coord__c && this.location.x === targetPiece.X_Coord__c)
        {
            //Remove the piece.
            newPiece = null;
        }
        this.piece = newPiece;
    }


}