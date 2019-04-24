/* eslint-disable no-else-return */
import { LightningElement, api } from 'lwc';

export default class LcCurrentPlayerPannel extends LightningElement {

    @api
    opponent
    @api
    player
    @api
    myMove

    get actionClassOpponent(){
        let baseClass = "slds-list__item"
        if(`${this.myMove}` === 'true')
        {
            baseClass += ' other-player';
        }
        else
        {
            baseClass += ' slds-theme--inverse';
        }
        return baseClass;
    }

    get actionLabelOpponent(){
        if(`${this.myMove}` === 'true')
        {
            return "Waiting for you";
        }
        else
        {
            return "Making his move";
        }
    }

    get actionClassCurrent(){
        let baseClass = "slds-list__item"
        if(`${this.myMove}` === 'true')
        {
            baseClass += ' slds-theme--inverse';
        }
        else
        {
            baseClass += ' other-player';
        }
        return baseClass;
    }

    get actionLabelCurrent(){
        if(`${this.myMove}` === 'true')
        {
            return "It's your move";
        }
        else
        {
            return "Waiting for opponent";
        }
    }



}