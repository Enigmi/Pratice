import { LightningElement, api, track } from 'lwc';
import { subscribe } from 'lightning/empApi';
import getaudio from '@salesforce/apex/LwcPlayAudio.getaudio';

export default class App extends LightningElement {

    @api recordId;
    temp = [];
    @track count;
    tempRecordId;
    tempdata;
    temperror;
    @track channelName = '/event/RefershAudioComponent__e';;
    @api strTitle = 'Audio';
    fetchdata() {
        var key;
        var strings;
        var countfile = 0;
        var tempVarResponce;
        //var getRecordId;
        getaudio({ recordId: this.recordId })
            .then(data => {

                if (data) {
                    // eslint-disable-next-line guard-for-in
                    for (key in data) {
                        countfile++;
                        this.count = countfile;
                        this.tempdata = data;
                        strings = '/sfc/servlet.shepherd/document/download/' + data[key].ContentDocumentId;
                        this.temp.push({ value: strings, key: data[key].ContentDocument.Title });
                    }

                }
                if (!data) {
                    this.count = 0;
                }

            })
            .catch(error => {
                this.temperror = error;
            });

        const messageCallback = function (response) {

            tempVarResponce = response.data.payload.RecordId__c;
            getaudio({ recordId: tempVarResponce })
                .then(data => {

                    if (data) {
                        this.temp = [];
                        // eslint-disable-next-line guard-for-in
                        for (key in data) {
                            countfile++;
                            this.count = countfile;
                            this.tempdata = data;
                            strings = '/sfc/servlet.shepherd/document/download/' + data[key].ContentDocumentId;
                            this.temp.push({ value: strings, key: data[key].ContentDocument.Title });
                        }

                    }
                    if (!data) {
                        this.count = 0;
                    }

                })
                .catch(error => {


                    this.temperror = error;
                });


        };
        subscribe(this.channelName, -1, messageCallback).then(response => {
            JSON.stringify(response.channel);

        });

    }

    connectedCallback() {

        this.fetchdata();
    }


    // @wire(getaudio,{recordId :"$recordId"})
    // lwcplayaudio({ error, data }) {
    //     var key;
    //     var strings ;
    //     var countfile=0;
    //     if (data) {

    //         // eslint-disable-next-line guard-for-in
    //         for(key in data){
    //             countfile++;
    //             this.count=countfile;
    //             this.tempdata = data;
    //             strings = '/sfc/servlet.shepherd/document/download/'+data[key].ContentDocumentId
    //             this.temp.push({value:strings,key:data[key].ContentDocument.Title});
    //         }

    //     } else if (error) {

    //         this.temperror = error;

    //     }
    //     if(!data){
    //         this.count=0;
    //     }


}