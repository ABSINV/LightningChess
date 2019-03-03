/* eslint-disable no-else-return */
import { LightningElement, api, track } from 'lwc';

export default class LcChessboardLocation extends LightningElement {

    @api
    location;
    @track
    piece;
    @track
    isMarked = false;
    
    connectedCallback()
    {
        this.piece = this.location.piece;
    }

    get locationContentClass()
    {
        if(this.piece !== undefined)
            return `${this.piece.Piece_Color__c + this.piece.Type__c} content`;
        else
            return 'content';
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


}