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
    const [showDeleteModal, setShowDeleteModal] = useState<number|null>(null);
    const [editModal, setEditModal] = useState<StringDict|null>(null);
    const [createTaskModal, setCreateTaskModal] = useState<StringDict|null>(null);


    // one time init
    useEffect(() => {
        fetchTasks();
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

    function fetchTasks() {
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
    }
    function onFilterText(e: any){
        const inputText = (e.target.value + "").trim().toLowerCase();
        if(inputText.length > 2) {
            setFilterText(inputText);
        } else {
            setFilterText("");
        }
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
                <Button variant="secondary" size="sm" onClick={ e => handleEditFormChange(e, "id", t.id) } >
                    <img className="svg-white" src={iconpencil} />
                </Button>
                <Button variant="danger" size="sm" onClick={ () => setShowDeleteModal(t.id) }>
                    <img className="svg-white" src={icontrash} />
                </Button>
            </div>
            </React.Fragment>
        );
    }

    function onCloseCreateModal(){
        if(createTaskModal && createTaskModal.error && createTaskModal.error.timeout) {
            clearTimeout(createTaskModal.error.timeout);
        }
        setCreateTaskModal(null);
    }
    function onCreateSubmit(e: any){
        e.preventDefault();
        e.stopPropagation();

        const createTaskPath = "/create-task";

        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + createTaskPath;
        var data = {...createTaskModal};
        delete data.error;
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        }).then( resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} creating task ${data.name}: ${resp.statusText}`);
                createCreateTaskAlert();
            } else {
                // clear & close form
                onCloseCreateModal();
                fetchTasks();
            }
        }).catch(err => {
            console.log(`Error creating task ${data.name}`, err);
            createCreateTaskAlert();
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
        let newState = {...createTaskModal};
        newState.error = newAlert;
        setCreateTaskModal(newState);
    }
    function clearCreateTaskAlert(id: string) {
        if(createTaskModal && createTaskModal.error && createTaskModal.error.timeout) {
            clearTimeout(createTaskModal.error.timeout);
        }

        let newState = {...createTaskModal};
        newState.error = null;
        setCreateTaskModal(newState);
    }
    function handleCreateTaskFormChange(e: any, field: string) {
        var newValue = e.target.value;
        if(field === "count") {
            var parsed = parseInt(newValue);
            if(createTaskModal && (isNaN(parsed) || parsed < 1)) {
                newValue = createTaskModal[field];
            }
        }
        
        var newState = {...createTaskModal};
        newState[field] = newValue;
        setCreateTaskModal(newState);
    }

    function deleteTask() {
        const deletePath = "/delete-task";
        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + deletePath;
        var data = { id: showDeleteModal };
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        }).then( resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} deleting task ${data.id}: ${resp.statusText}`);
                props.global.addAlert("Error deleting task.", "danger");
            } else {
                // clear & close form
                props.global.addAlert("Success!", "success");
                fetchTasks();
            }
        }).catch(err => {
            console.log(`Error deleting task ${data.id}`, err);
            props.global.addAlert("Error deleting task.", "danger");
        }).finally(() => {
            setShowDeleteModal(null);
        });
    }

    function handleEditFormChange(e: any, field: string, val: any|null) {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let newValue = null;
        if(val !== null) {
            newValue = val;
        } else {
            newValue = e ? e.target.value : null;
        }

        let newState = {...editModal};
        // populate name based on id if necessary
        if(field === "id") {
            let task = tasks.get(newValue);
            if(task !== undefined) {
                newState["name"] = task.name;
            }
        }
        newState[field] = newValue;
        setEditModal(newState);
    }
    function submitEditTask() {
        if(editModal === null) {
            return;
        }
        let task = tasks.get(editModal.id);
        if(task === undefined || task.name === editModal.name) {
            setEditModal(null); // no change, don't make request
            return;
        }

        const editPath = "/edit-task";
        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + editPath;
        var data = {
            id: editModal.id,
            name: editModal.name
        };
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        }).then( resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} editing task ${data.id}: ${resp.statusText}`);
                createEditTaskAlert();
            } else {
                // clear & close form
                setEditModal(null);
                props.global.addAlert("Success!", "success");
                fetchTasks();
            }
        }).catch(err => {
            console.log(`Error deleting task ${data.id}`, err);
            createEditTaskAlert();
        });
    }
    function createEditTaskAlert() {
        let id = uuidv4();
        let newTimeout = setTimeout(clearEditTaskAlert, timeoutMilliseconds, id);
        let newAlert = {
            id: id,
            msg: <>Error editing task.</>,
            style: "danger",
            timeout: newTimeout
        } as AppAlert;
        handleEditFormChange(null, "error", newAlert);
    }
    function clearEditTaskAlert(id: string) {
        if(editModal && editModal.error && editModal.error.timeout) {
            clearTimeout(editModal.error.timeout);
        }

        handleEditFormChange(null, "error", null);
    }

    return (
        <Container fluid className="configure-container content-container">
            <>
                <div className="label"></div>
                <div className="center">
                    <Button variant="success" size="sm" onClick={() => setCreateTaskModal(defaultCreateTaskFields) }>Create Task</Button>{' '}
                </div>
                <div className="icon"></div>
                <div className="label"></div>
                <div className="center">
                    <Form.Control type="text" id="filterTasksInput" size="sm" placeholder="Filter Tasks" onKeyUp={ (e) => onFilterText(e) }></Form.Control>
                </div>
                <div className="icon"></div>
                { whichTasks() }

                <Modal show={ createTaskModal !== null } onHide={onCloseCreateModal} size="sm" >
                    <Modal.Header closeButton>
                        <Modal.Title>Create Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form noValidate id="createForm" onSubmit={e => onCreateSubmit(e) }>
                            <InputGroup>
                                <InputGroup.Text>Name</InputGroup.Text>
                                <Form.Control type="text" maxLength={20} value={createTaskModal ? createTaskModal.name : "" } onChange={ (e) => handleCreateTaskFormChange(e, "name") } />
                            </InputGroup>
                            <InputGroup className="input-group">
                                <InputGroup.Text>Type</InputGroup.Text>
                                <Button value="infinite" onClick={ (e) => handleCreateTaskFormChange(e, "type") } variant={ createTaskModal && createTaskModal.type === "infinite" ? "secondary" : "outline-secondary" } size="sm">Endless</Button>
                                <Button value="finite" onClick={ (e) => handleCreateTaskFormChange(e, "type") } variant={ createTaskModal && createTaskModal.type === "finite" ? "secondary" : "outline-secondary" } size="sm">Count</Button>
                            </InputGroup>
                            { createTaskModal && createTaskModal.type === "finite" &&
                                <InputGroup>
                                    <InputGroup.Text>Goal</InputGroup.Text>
                                    <Form.Control id="taskGoal" type="number" value={createTaskModal && createTaskModal.count}  onChange={ e => handleCreateTaskFormChange(e, "count") } />
                                </InputGroup>
                            }
                        </Form>
                    </Modal.Body>
                    { createTaskModal && createTaskModal.error && 
                        <Alert variant="danger" transition={false} >
                            { createTaskModal && createTaskModal.error ? createTaskModal.error.msg : "" }
                        </Alert>
                    }
                    <Modal.Footer>
                        <Button variant="primary" form="createForm" type="submit">Create</Button>{' '}
                        <Button variant="secondary" onClick={onCloseCreateModal}>Cancel</Button>{' '}
                    </Modal.Footer>
                </Modal>

                <Modal show={ showDeleteModal !== null } onHide={ () => setShowDeleteModal(null) } size="sm">
                    <Modal.Body>This task may be in use on multiple views! Are you sure you want to delete it?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={ deleteTask }>Yes</Button>
                        <Button variant="secondary" onClick={ () => setShowDeleteModal(null) } >No</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={ editModal !== null } onHide={ () => setEditModal(null) } size="sm" >
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Task</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <InputGroup>
                                <InputGroup.Text>Name</InputGroup.Text>
                                <Form.Control type="text" maxLength={20} value={ editModal !== null ? editModal.name : "" } onChange={ (e) => handleEditFormChange(e, "name", null) } />
                            </InputGroup>
                    </Modal.Body>
                    { editModal && editModal.error && 
                        <Alert variant="danger" transition={false} >
                            { editModal && editModal.error ? editModal.error.msg : "" }
                        </Alert>
                    }
                    <Modal.Footer>
                        <Button variant="primary" onClick={ submitEditTask }>Submit</Button>{' '}
                        <Button variant="secondary" onClick={ e => setEditModal(null) }>Cancel</Button>{' '}
                    </Modal.Footer>
                </Modal>
            </>
        </Container>
    );
}

export default ConfigureTasks;