/**
 * Created by lievenj on 2/27/2019.
 */

import { LightningElement,api,wire } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import getSessionId from '@salesforce/apex/StreamingAPIController.getSession';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
export default class Streaminglistener extends LightningElement {

    @api
    listeners

    @wire(CurrentPageReference) pageRef;

    //Init
    connectedCallback() {
        debugger;

        loadScript(this,'/resource/jquery')
            .then(() => {
                return loadScript(this,'/resource/cometd');
            })
            .then(() => {
                return loadScript(this,'/resource/jquerycometd');
            })
            .then(() => {
                this.initializeStreaming();
            })
    }

    //Destroy
    disconnectedCallback(){
        $.cometd.disconnect();
    }

    initializeStreaming() {

        getSessionId().then( sessionId => {
            var listenerList = this.listeners.split(',');
            //check if the url is already set on cometd; if so there is another listener component instantiated and we can skip the following part.
            var url = $.cometd.getURL();
            if(url == undefined)
            {
                $.cometd.init({
                    url: window.location.protocol+'//'+window.location.hostname+'/cometd/35.0/',
                    requestHeaders: { Authorization: 'OAuth '+sessionId},appendMessageTypeToURL : false
                });
            }
            var cmp = this;
            for(var i = 0; i < listenerList.length;i++)
            {
                $.cometd.subscribe('/topic/'+listenerList[i],function(message) {
                    //Use pubsub to send application events
                    fireEvent(cmp.pageRef, "StreamingEvent",
                    {
                        "sObject":message.data.sobject,
                        "event":message.data.event,
                        "eventType":message.channel.replace('/topic/','')
                    });
                });
            }
        })
        .catch(error => {
            alert(error.body.message);
        });
    }
}