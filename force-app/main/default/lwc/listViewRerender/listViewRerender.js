import { LightningElement, track, api } from 'lwc';
import getContactList from '@salesforce/apex/ListViewGetContactList.getContactList';

export default class ListViewRerender extends LightningElement {

    @track contact;
    @api searchKey;
    count = 0;
    handleFormInputChange(event){

        this.searchKey = event.target.value;
        this.count = event.target.value.length;
        if(this.count===0){
            this.contact = null;        
        }
        this.callapex(this.count);
    }
    callapex (scount) {  
        if(this.count!==0){
            getContactList({input : this.searchKey})
            .then(result => {
                this.contact = result;
                if(scount===0 || this.searchKey===''){
                    this.contact = null;
                }
            })
            .catch(error => {
                this.error = error;
               
            }); 

            
        }   

    }

}