import React, { useEffect, useState } from 'react';
import { Button, Container, Stack, Table } from 'react-bootstrap';
import Select from 'react-select';
import { GlobalProps, Task } from './GlobalProps';
import iconplus from 'bootstrap-icons/icons/plus-lg.svg'
import icontrash from 'bootstrap-icons/icons/trash.svg';

function ConfigureViews(props: GlobalProps) {
    const [selectedView, setSelectedView] = useState(undefined);
    const [allTaskList, setAllTaskList] = useState<Map<number, Task>>(new Map<number, Task>());
    const [currentTaskIds, setCurrentTaskIds] = useState<Array<number>>([]);
    const [availableTasks, setAvailableTasks] = useState<Array<Task>>([]);

    // one time init
    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        if(selectedView === undefined) {
            return;
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

    let editViewsOptions = new Array<any>();
    props.global.views.forEach((v: string, i: number) => {
        editViewsOptions.push({ "value": v, "label": v });
    });

    let availableTaskOptions = new Array<any>();
    availableTasks.forEach((v: Task, i: number) => {
        availableTaskOptions.push({ "value": v.id, "label": v.name });
    });

    return (
        <Container fluid className="configure-tasks-container content-container">
            <div className="label">View</div>
            <div className="center">
                <Select options={editViewsOptions} onChange={ (e: any) => { setSelectedView(e.value); } } placeholder="Select View" />
            </div>
            <div className="icon"></div>

            { selectedView !== undefined && 
                <>
                    <div className="label">Add Task</div>
                    <div className="center"><Select options={availableTaskOptions} /></div>
                    <div className="icon">
                        <Button variant="success">
                            <img className="svg-white" src={iconplus} />
                        </Button>
                    </div>

                    {
                        currentTaskIds.map(id => (
                            <>
                                <div className="label" key={"label" + id}></div>
                                <div className="center" key={"center" + id}>{allTaskList.get(id)?.name}</div>
                                <div className="icon" key={"icon" + id}>
                                    <Button size="sm" variant="danger">
                                        <img className="svg-white" src={icontrash} />
                                    </Button>
                                </div>
                            </>
                        ))
                    }
                </>
            }
        </Container>
    );
}

export default ConfigureViews;