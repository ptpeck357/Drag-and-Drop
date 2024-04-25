function autobind (
    _: any,
    _2: string,
    descriptor: PropertyDescriptor
) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}


class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLFormElement;
    descriptionInputElement: HTMLFormElement;
    peopleInputElement: HTMLFormElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title')! as HTMLFormElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLFormElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLFormElement;

        this.configure();
        this.attach();
    }

    private gatherUserInput():[string, string, number] | void {
        const enterTitle = this.titleInputElement.value;
        const enterdescription = this.descriptionInputElement.value;
        const enterPeople = this.peopleInputElement.value;

        if(
            enterTitle.trim().length === 0 ||
            enterdescription.trim().length === 0 ||
            enterPeople.trim().length === 0
        ){
            alert("please try again");
            return;
        }
        else {
            return [enterTitle, enterPeople, +enterPeople];
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
            console.log(title, desc, people);
            this.clearInputs();
        }
    }

    private configure(){
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const prjInput = new ProjectInput();