
enum ProjectStatus {
    Active,
    Finished
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ){

    }
}

interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

type Listener<T> = (items: T[]) => void

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>){
        this.listeners.push(listenerFn)
    }
}

class ProjectState extends State<Project>{
    private projects: Project[] = [];

    private static instance: ProjectState;

    private constructor(){
        super()
    }

    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        return this.instance = new ProjectState();
    }

    addListener(listenerFn: Listener<Project>){
        this.listeners.push(listenerFn)
    }

    addProject(title: string, description: string, numOfPeople: number){
        const newProject = new Project(
            Math.random.toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        );

        this.projects.push(newProject);
        for( const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

function validate(validatableInput: Validatable){
    let isValid = true;

    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }

    if(
        validatableInput.minLength != null &&
        typeof validatableInput.value === 'string'
    ){
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }

    if(
        validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string'
    ){
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }

    if(
        validatableInput.min != null &&
        typeof validatableInput.value === 'number'

    ){
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }

     if(
        validatableInput.max != null &&
        typeof validatableInput.value === 'number'

    ){
        isValid = isValid && validatableInput.value < validatableInput.max;
    }

    return isValid;
}

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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string
    ){
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild as U;
        if(newElementId){
            this.element.id = newElementId;
        }

       this.attach(insertAtStart);
    }

    private attach(insertAtStart: boolean){
        this.hostElement.insertAdjacentElement(
            insertAtStart ? "afterbegin" : 'beforeend',
            this.element
        );
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
    private project: Project;

    get persons(){
        if(this.project.people === 1){
            return '1 person';
        }
        else {
            return `${this.project.people} persons`
        }
    }

    constructor(hostId: string, project: Project){
        super('single-project', hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }

    configure(): void {

    }

    renderContent(): void {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description;

    }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects: Project[] = [];

    constructor(private type: 'active' | 'finished'){
        super('project-list', 'app', false, `${type}-projects`, )


        this.configure();
        this.renderContent();
    }

    configure(){
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })

            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }

    renderContent(){
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " PROJECTS";
    }

    private renderProjects(){
        const listEl = document.getElementById(
            `${this.type}-projects-list`
        )! as HTMLUListElement;

        listEl.innerHTML = '';

        for (const prjItem of this.assignedProjects){
            console.log('prjItem', prjItem);
            new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
        }
    }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const prjInput = new ProjectInput();
const activeLists = new ProjectList('active');
const finishedList = new ProjectList('finished');