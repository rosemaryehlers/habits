import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Dropdown, Form, InputGroup, Row, Table } from 'react-bootstrap';
import './Navigation.css';
import './Edit.css';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import { GlobalProps, Task } from './GlobalProps';
import Select, { ActionMeta } from 'react-select';
import Option from 'react-select';

function EditViews(props: GlobalProps) {
    const temp = [...props.global.views];
    temp.unshift("Create New");
    const [viewList, setViewList] = useState<Array<string>>(temp);
    const [selectedView, setSelectedView] = useState("Create New");
    const [allTaskList, setAllTaskList] = useState<Map<number, Task>>(new Map<number, Task>());
    const [currentTaskIds, setCurrentTaskIds] = useState<Array<number>>([]);
    const [availableTasks, setAvailableTasks] = useState<Array<Task>>([]);

    useEffect(() => {
        if(selectedView !== "Create New") {
            fetchTasks();
        }
        fetchCurrentTasks();

        // calculate available tasks
        let unsorted = new Array<Task>();
        allTaskList.forEach((v: Task, k: number) => {
            if(!currentTaskIds.includes(v.id)){
                unsorted.push(v);
            }
        });
        unsorted.sort((a: Task, b: Task) => {
            if(a.name > b.name) return 1;
            if(b.name > a.name) return -1;
            return 0;
        });
        setAvailableTasks(unsorted);

    }, [selectedView]);

    function onViewChange(e: any){
        setSelectedView(e.target.text);
    }
    function onSelectViewChange(option: Option | null, actionMeta: ActionMeta<Option>){
        console.log(option);
    }

    function fetchTasks(forceLoad: boolean = false){
        if(!forceLoad && allTaskList.keys.length > 0){
            return; // we have already populated the list
        }

        const tasksPath = "/tasks";
        let newTasks = new Map<number, Task>();

        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + tasksPath;
        fetch(url, {
            method: "GET"
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching tasks: ${resp.statusText}`);
                props.global.showErrorAlert("Error fetching tasks.");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                data.tasks.map((item: Task) => {
                    newTasks.set(item.id, item);
                });
                setAllTaskList(newTasks);
            }
        }).catch(err => {
            console.log(`Error fetching tasks: ${err}`);
            props.global.showErrorAlert("Error fetching tasks.");
        });
    }
    function fetchCurrentTasks(){
        if(selectedView === "Create New") {
            return;
        }
        const currentTasksPath = "/currentitems";

        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + currentTasksPath
        + "?view=" + selectedView;
        fetch(url, {
            method: "GET"
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching current items for view ${selectedView}: ${resp.statusText}`);
                props.global.showErrorAlert("Error fetching items.");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            setCurrentTaskIds(data.Items.map((item: Task) => item.id));
        }).catch(err => {
            console.log(`Error fetching current items for view ${selectedView}: ${err}`);
            props.global.showErrorAlert("Error fetching items.");
        });
    }

    let availableTaskOptions = new Array<any>();
    availableTasks.forEach((v: Task, i: number) => {
        availableTaskOptions.push({ "value": v.id, "label": v.name });
    });
    let editViewsOptions = new Array<any>();
    props.global.views.forEach((v: string, i: number) => {
        editViewsOptions.push({ "value": v, "label": v });
    });

    return (
        <div>
            <Container fluid className='navigation'>
                <Row>
                    <Col className='left'>
                        <Dropdown>
                            <Dropdown.Toggle size='sm' variant='outline-primary'>{selectedView}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {
                                    viewList.filter( v => v !== selectedView ).map(view => {
                                        return (
                                            <>
                                                <Dropdown.Item value={view} key={view} onClick={onViewChange} >{view}</Dropdown.Item>
                                                { view === "Create New" && <Dropdown.Divider></Dropdown.Divider> }
                                            </>
                                        );
                                    })
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col className='right'>
                            <Button variant="outline-secondary" size="sm" onClick={ ()=> { props.global.onSelectedModeChange("Current"); } }>
                                <img src={iconback} alt='Back' />
                            </Button>
                    </Col>
                </Row>
            </Container>
            <Container fluid className="edit">
                { selectedView === "Create New" &&
                    <div className="edit-form-container">
                        <div className="edit-form">
                            <InputGroup className="name">
                                <InputGroup.Text id="name">Name</InputGroup.Text>
                                <Form.Control aria-label="Name" aria-describedby="name"></Form.Control>
                            </InputGroup>
                        </div>
                        <div className="submit-container">
                            <Button variant="success">Create</Button>{' '}
                        </div>
                    </div>
                }
                { selectedView !== "Create New" &&
                    <div className="edit-form-container">
                        <div className="edit-form">
                            <Table borderless>
                                <tbody>
                                    <tr>
                                        <td>Edit View: </td>
                                        <td>
                                            <Select options={editViewsOptions} onChange={onSelectViewChange} placeholder="Select View" />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Tasks</td>
                                        <td><Select options={availableTaskOptions} /></td>
                                    </tr>
                                    <tr>
                                        <td>&nbsp;</td>
                                        <td>
                                            {
                                                currentTaskIds.map(id => (
                                                    <p>{allTaskList.get(id)?.name}</p>
                                                ))
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                }
            </Container>
        </div>
    );
}

export default EditViews;