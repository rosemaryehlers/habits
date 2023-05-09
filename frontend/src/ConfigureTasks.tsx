import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Form, InputGroup, Modal } from 'react-bootstrap';
import { GlobalProps, Task } from './GlobalProps';
import iconpencil from 'bootstrap-icons/icons/pencil-square.svg';
import icontrash from 'bootstrap-icons/icons/trash.svg';
import { AppAlert } from './Alerts';
import { v4 as uuidv4 } from 'uuid';

type StringDict = { [key: string] : any }
const defaultCreateTaskFields : StringDict = {
    "name": "",
    "type": "infinite",
    "count": ""
};

const timeoutMilliseconds = 5000;

function ConfigureTasks(props: GlobalProps) {
    const [tasks, setTasks] = useState<Map<number, Task>>(new Map<number, Task>());
    const [filteredTaskIds, setFilteredTaskIds] = useState<Array<number>>([]);
    const [filterText, setFilterText] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createTaskFields, setCreateTaskFields] = useState(defaultCreateTaskFields);
    const [createTaskError, setCreateTaskError] = useState<AppAlert|null>(null);

    // one time init
    useEffect(() => {
        const tasksPath = "/tasks";

        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + tasksPath;
        fetch(url, {
            method: "GET"
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching tasks: ${resp.statusText}`);
                props.global.addAlert("Error fetching tasks.", "danger");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                let newTasks = new Map<number, Task>();
                data.tasks.map((item: Task) => {
                    newTasks.set(item.id, item);
                });
                setTasks(newTasks);
            }
        }).catch(err => {
            console.log(`Error fetching tasks: ${err}`);
            props.global.addAlert("Error fetching tasks.", "danger");
        });
    }, []);

    useEffect(() => {
        if(filterText.length > 2){
            const filteredIds = new Array<number>();
            tasks.forEach((task: Task, id: number) => {
                if(task.name.toLowerCase().includes(filterText)) {
                    filteredIds.push(task.id);
                }
            });
            setFilteredTaskIds(filteredIds);
        } else if(filterText === ""){
            setFilteredTaskIds([]);
        }
    }, [filterText]);

    function onFilterText(e: any){
        const inputText = (e.target.value + "").trim().toLowerCase();
        if(inputText.length > 2) {
            setFilterText(inputText);
        } else {
            setFilterText("");
        }
    }

    function onCloseCreateModal(){
        var newState = {...defaultCreateTaskFields};
        setCreateTaskFields(newState);
        if(createTaskError) {
            clearCreateTaskAlert(createTaskError.id);
        }
        if(showCreateModal){
            setShowCreateModal(false);
        }
    }
    function onCreateSubmit(e: any){
        console.log("create task submit", createTaskFields);
        e.preventDefault();
        e.stopPropagation();

        const createTaskPath = "/create-task";

        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + createTaskPath;
        var data = {...createTaskFields};
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        }).then( resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} creating task ${data.name}: ${resp.statusText}`);
                createCreateTaskAlert();
            } else {
                // clear form
                var newState = {...defaultCreateTaskFields};
                setCreateTaskFields(newState);
            }
        }).catch(err => {
            console.log(`Error creating task ${data.name}`, err);
            createCreateTaskAlert();
        }).finally(() => {
            // do something?
        });
    }
    function createCreateTaskAlert() {
        let id = uuidv4();
        let newTimeout = setTimeout(clearCreateTaskAlert, timeoutMilliseconds, id);
        let newAlert = {
            id: id,
            msg: <>Error creating task.</>,
            style: "danger",
            timeout: newTimeout
        } as AppAlert;
        setCreateTaskError(newAlert);
    }
    function clearCreateTaskAlert(id: string) {
        if(createTaskError && createTaskError.timeout) {
            clearTimeout(createTaskError.timeout);
        }

        setCreateTaskError(null);
    }

    function whichTasks(){
        if(filterText.length > 2 && filteredTaskIds.length > 0) {
            return filteredTaskIds.map((id: number, _) => {
                const task = tasks.get(id);
                if(task != undefined){
                    return renderTask(task);
                }
            });
        } else if (filterText.length > 2) {
            return (<>
                <div className="label"></div>
                <div className="center">No tasks found</div>
                <div className="icon"></div>
            </>);
        } else {
            return [...tasks.values()].map( t => ( renderTask(t) ));
        }
    }
    function renderTask(t: Task) {
        return (
            <React.Fragment key={t.id}>
            <div className="label"></div>
            <div className="center">{t.name}</div>
            <div className="icon">
                <Button variant="secondary" size="sm">
                    <img className="svg-white" src={iconpencil} />
                </Button>
                <Button variant="danger" size="sm">
                    <img className="svg-white" src={icontrash} />
                </Button>
            </div>
            </React.Fragment>
        );
    }

    function handleCreateTaskFormChange(e: any, field: string) {
        var newValue = e.target.value;
        if(field === "count") {
            var parsed = parseInt(newValue);
            if(isNaN(parsed) || parsed < 1) {
                newValue = createTaskFields[field];
            }
        }
        
        var newState = {...createTaskFields};
        newState[field] = newValue;
        console.log("set state");
        setCreateTaskFields(newState);
    }

    return (
        <Container fluid className="configure-container content-container">
            <>
                <div className="label"></div>
                <div className="center">
                    <Button variant="success" size="sm" onClick={() => setShowCreateModal(true) }>Create Task</Button>{' '}
                </div>
                <div className="icon"></div>
                <div className="label"></div>
                <div className="center">
                    <Form.Control type="text" id="filterTasksInput" size="sm" placeholder="Filter Tasks" onKeyUp={ (e) => onFilterText(e) }></Form.Control>
                </div>
                <div className="icon"></div>
                { whichTasks() }

                <Modal show={showCreateModal} onHide={onCloseCreateModal} size="sm" >
                    <Modal.Header closeButton>
                        <Modal.Title>Create Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form noValidate id="createForm" onSubmit={e => onCreateSubmit(e) }>
                            <InputGroup>
                                <InputGroup.Text>Name</InputGroup.Text>
                                <Form.Control type="text" maxLength={20} value={createTaskFields.name} onChange={ (e) => handleCreateTaskFormChange(e, "name") } />
                            </InputGroup>
                            <InputGroup className="input-group">
                                <InputGroup.Text>Type</InputGroup.Text>
                                <Button value="infinite" onClick={ (e) => handleCreateTaskFormChange(e, "type") } variant={ createTaskFields.type === "infinite" ? "secondary" : "outline-secondary" } size="sm">Endless</Button>
                                <Button value="finite" onClick={ (e) => handleCreateTaskFormChange(e, "type") } variant={ createTaskFields.type === "finite" ? "secondary" : "outline-secondary" } size="sm">Count</Button>
                            </InputGroup>
                            { createTaskFields.type === "finite" &&
                                <InputGroup>
                                    <InputGroup.Text>Goal</InputGroup.Text>
                                    <Form.Control id="taskGoal" type="number" value={createTaskFields.count}  onChange={ e => handleCreateTaskFormChange(e, "count") } />
                                </InputGroup>
                            }
                        </Form>
                    </Modal.Body>
                    { createTaskError !== null && 
                        <Alert variant="danger" transition={false} >
                            {createTaskError.msg}
                        </Alert>
                    }
                    <Modal.Footer>
                        <Button variant="primary" form="createForm" type="submit">Create</Button>{' '}
                        <Button variant="secondary" onClick={onCloseCreateModal}>Cancel</Button>{' '}
                    </Modal.Footer>
                </Modal>
            </>
        </Container>
    );
}

export default ConfigureTasks;