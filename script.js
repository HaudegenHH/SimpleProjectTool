const projectsContainer = document.querySelector('[data-lists]');
const newListForm = document.querySelector('[data-new-list-form]');
const newListInput = document.querySelector('[data-new-list-input]');
const deleteListBtn = document.querySelector('[data-delete-list-btn]');
const clearCompleteBtn = document.querySelector('[data-clear-complete-tasks-btn]');
const projectOutputContainer = document.querySelector('[data-project-output-container]');
const projectTitleElement = document.querySelector('[data-project-title]');
const projectCountElement = document.querySelector('[data-project-count]');
const tasksContainer = document.querySelector('[data-tasks]');
const taskTemplate = document.getElementById('task-template');
const newTaskForm = document.querySelector('[data-new-task-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
let projects = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];

if(projects.length == 0){
    projects.push({
        id: '1',
        name: "Ninox / Mentor e.V.",
        tasks: [{
            id: 1,
            name: 'Generische Tabellendarstellung',
            completed: true
        },{
            id: 2,
            name: 'Typo3 / Extension',
            completed: false
        }]
    },
    {
        id: '2',
        name: "DSVGO-/SEO Checkliste",
        tasks: [{
            id: 1,
            name: 'Impressum',
            completed: false
        },{
            id: 2,
            name: 'alt-Attribute ausgefüllt?',
            completed: false 
        },{
            id: 3,
            name: 'h1 gesetzt?',
            completed: true
        },{
            id: 4,
            name: 'robots.txt!',
            completed: false
        }]
    });
}

//   wenn null zurück kommt, wurde nichts selected
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

/* 
statt den dynamisch erzeugten liElementen einen EventListener zuzuordnen, wird das Eltern-Element auf Events überprüft: */
projectsContainer.addEventListener('click', e => {
    // nur wenn es ein li-Element ist:    
    if(e.target.tagName.toLowerCase() === 'li'){
        selectedListId = e.target.dataset.projectId;
        saveAndRender();
    }
})

tasksContainer.addEventListener('click', e => {
    if(e.target.tagName.toLowerCase() === 'input') {
        const selectedProject = projects.find(project => project.id == selectedListId);
        // e.target.id ist die checkbox.id
        const selectedTask = selectedProject.tasks.find(task => task.id === e.target.id);
        selectedTask.completed = e.target.checked;
        save();
        renderTaskCount(selectedProject);
    }
})

deleteListBtn.addEventListener('click', e => {
    projects = projects.filter(project => project.id !== selectedListId);
    selectedListId = null;
    saveAndRender();
})

clearCompleteBtn.addEventListener('click', e => {
    const selectedList = projects.find(project => project.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.completed);
    saveAndRender();
})

newListForm.addEventListener('submit', e => {
    e.preventDefault();
    const projectName = newListInput.value;
    if(projectName == null || projectName === '') return;
    const project = createList(projectName);    
    newListInput.value = null;
    projects.push(project);
    saveAndRender();
})

newTaskForm.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value;
    if(taskName == null || taskName === '') return;
    const task = createTask(taskName);    
    newTaskInput.value = null;
    const selectedList = projects.find(project => project.id === selectedListId);
    selectedList.tasks.push(task);
    saveAndRender();
})

function createTask(name) {
    return { id: Date.now().toString(), name, completed: false  };
}

function createList(name) {
    return { id: Date.now().toString(), name, tasks: [] };
}

function saveAndRender() {
    save();
    render();
}

function save() {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(projects));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function render() {
    clearElement(projectsContainer);
    renderProjects();
    const selectedProject = projects.find(project => project.id === selectedListId);

    if (selectedListId == null) {
        projectOutputContainer.style.display = 'none';
    } else {
        projectOutputContainer.style.display = '';
        projectTitleElement.innerText = selectedProject.name;
        renderTaskCount(selectedProject);
        clearElement(tasksContainer);
        renderTasks(selectedProject);
    }
}

function renderTasks(selectedProject) {
    selectedProject.tasks.forEach(task => {
        /* task wird geklont, mit dem 2. Parameter true werden alle Elemente (und nicht nur das oberste) geklont: */
        const taskElement = document.importNode(taskTemplate.content, true);
        const checkbox = taskElement.querySelector('input');
        checkbox.id = task.id;        
        checkbox.checked = task.completed;
        const label = taskElement.querySelector('label');
        label.htmlFor = task.id;
        label.append(task.name);
        tasksContainer.appendChild(taskElement);
    })
}

function renderTaskCount(selectedList) {
    let incompleteTaskCount = selectedList.tasks.filter(task => !task.completed).length;
    const taskString = incompleteTaskCount == 1 ? "Aufgabe" : "Aufgaben";
    projectCountElement.innerText = `${incompleteTaskCount} unerledigte ${taskString}`; 
}

function renderProjects() {
    projects.forEach(project => {
        const liElement = document.createElement('li');
        liElement.dataset.projectId = project.id;
        liElement.classList.add('list-name');
        liElement.innerText = project.name;
        if(project.id === selectedListId) {
            liElement.classList.add('active');
        }
        projectsContainer.appendChild(liElement);
    })
}
function clearElement(el) {
    // solange sich noch ein Projekt in der Liste befindet: initial den projectsContainer leeren
    while(el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

render();