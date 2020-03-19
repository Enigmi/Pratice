import { LightningElement, track, api } from 'lwc';
import helloWorldtwo from './helloWorldtwo.html';
import helloWorld from './helloWorld.html';
export default class HelloWorld extends LightningElement {
    @api greeting;
    @track helloWorldtwo = true;



    render() {
        console.log('###');
        return this.helloWorldtwo ? helloWorld : helloWorldtwo;

    }
    renderedCallback() {
        console.log('@@@');
    }
    switchTemplate() {
        this.helloWorldtwo = this.helloWorldtwo === true ? false : true;
    }
    changeHandler(event) {
        this.greeting = event.target.value;
    }
}