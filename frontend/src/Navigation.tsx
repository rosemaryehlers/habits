import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './Navigation.css';
import icongear from 'bootstrap-icons/icons/gear-fill.svg';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { GlobalProps } from './GlobalProps';
import { Form, Modal, Stack } from 'react-bootstrap';

export interface NavigationProps {
    views: Array<string>;
    defaultView?: string;
    selectedView?: string;
    onSelectedViewChange(view: string): any;
    modes: Array<string>;
    selectedMode?: string;
    onSelectedModeChange(mode: string): any;
    headerText?: JSX.Element;
}
export interface CombinedNavigationProps extends GlobalProps, NavigationProps {
}
interface NavigationState {
    showSettingsModal: boolean;
}

class Navigation extends React.Component<CombinedNavigationProps, NavigationState> {
    constructor(props: CombinedNavigationProps) {
        super(props);
        this.onViewChange = this.onViewChange.bind(this);
        this.onModeChange = this.onModeChange.bind(this);
        this.toggleSettingsModal = this.toggleSettingsModal.bind(this);

        this.state = {
            showSettingsModal: false
        };
    }

    onViewChange(e: any){
        this.props.onSelectedViewChange(e.target.text);
    }
    onModeChange(e: any){
        this.props.onSelectedModeChange(e.target.text);
    }
    onWeeksChange(e: any){
        console.log(e);
        e.preventDefault();
    }
    toggleSettingsModal(e: any) {
        e.preventDefault();
        let show = !this.state.showSettingsModal;
        this.setState({
            showSettingsModal: show
        });
    }

    renderWeeksInput(){
        if(this.props.selectedMode === "History"){
            return (
                <Form id="weeksInput" onSubmit={ this.onWeeksChange }>
                    <Form.Control disabled defaultValue={6} required size="sm"></Form.Control>
                    <Form.Text>weeks</Form.Text>
                </Form>
            );
        }

        return;
    }

    renderSettingsButton() {
        if(this.props.selectedMode === "edit"){
            return (
                <Button variant="outline-secondary" size="sm">
                    <img src={iconback} alt='Back' />
                </Button>
            );
        }

        return (
            <Button variant="outline-secondary" size="sm" 
                onClick={ () => { this.setState({ showSettingsModal: true }) } } >
                <img src={icongear} alt='Settings' />
            </Button>
        );
    }

    render(){
        return (
            <Container fluid className='navigation'>
                <Row>
                    <Col className='left'>
                        <Dropdown>
                            <Dropdown.Toggle size='sm' variant='outline-primary'>{this.props.selectedView}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.ItemText>Select View</Dropdown.ItemText>
                                <Dropdown.Divider />
                                {
                                    this.props.views.filter(v => v !== this.props.selectedView).map(view => (
                                    <Dropdown.Item onClick={this.onViewChange} value={view} key={view}>{view}</Dropdown.Item>
                                    ))
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown show={ this.props.selectedMode !== "edit" } >
                            <Dropdown.Toggle size='sm' variant='outline-primary'>{this.props.selectedMode}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {
                                    this.props.modes.filter(m => m !== this.props.selectedMode).map(mode => (
                                        <Dropdown.Item onClick={this.onModeChange} value={mode} key={mode}>{mode}</Dropdown.Item>
                                    ))
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                        { this.renderWeeksInput() }
                    </Col>
                    <Col className="center">
                        { this.props.headerText }
                    </Col>
                    <Col className='right'>{ this.renderSettingsButton() }</Col>
                </Row>

                <Modal 
                    show={this.state.showSettingsModal}
                    className="settings-modal" size="sm" centered >
                    <Modal.Body>
                        <Stack>
                            <Button variant="outline-primary" onClick={ () => { this.props.onSelectedModeChange("edit"); } } >Edit Views</Button>
                            <Button variant="secondary" onClick={ this.toggleSettingsModal } className="close" >Close</Button>
                        </Stack>
                    </Modal.Body>
                </Modal>
            </Container>
        );
    }
}

export default Navigation;