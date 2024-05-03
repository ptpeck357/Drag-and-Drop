import { Component } from "./base-component.js";
import { Validatable, validate } from "../util/validation.js";
import { projectState } from "../state/project-state.js";
import { autobind } from "../decorators/autobind.js";

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLFormElement;
    descriptionInputElement: HTMLFormElement;
    peopleInputElement: HTMLFormElement;

    constructor() {
        super('project-input', 'app', true, 'user-input')

        this.titleInputElement = this.element.querySelector('#title')! as HTMLFormElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLFormElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLFormElement;

        this.configure();
    }

    configure(){
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent(): void {}

    private gatherUserInput():[string, string, number] | void {
        const enterTitle = this.titleInputElement.value;
        const enterdescription = this.descriptionInputElement.value;
        const enterPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enterTitle,
            required: true
        };

         const descriptionValidatable: Validatable = {
            value: enterdescription,
            required: true,
            minLength: 4
        };

         const peopleValidatable: Validatable = {
            value: +enterPeople,
            required: true,
            min: 0,
            max: 10
        };

        if(
            !validate(titleValidatable) ||
            !validate(descriptionValidatable)||
            !validate(peopleValidatable)
        ){
            alert("please try again");
            return;
        }
        else {
            return [enterTitle, enterdescription, +enterPeople];
        }
    }

    private clearInputs(){
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput = this.gatherUserInput();

        if(Array.isArray(userInput) ){
            const [title, desc, people] = userInput
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }
}