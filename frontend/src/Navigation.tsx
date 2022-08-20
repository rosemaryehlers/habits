import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './Navigation.css';
import icongear from 'bootstrap-icons/icons/gear-fill.svg'
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { GlobalProps } from './GlobalProps';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';

export interface NavigationProps {
    views: Array<string>;
    selectedView?: string;
    onSelectedViewChange(view: string): any;
    modes: Array<string>;
    selectedMode?: string;
    onSelectedModeChange(mode: string): any;
}
export interface CombinedNavigationProps extends GlobalProps, NavigationProps {
}

class Navigation extends React.Component<CombinedNavigationProps, {}> {
    constructor(props: CombinedNavigationProps) {
        super(props);
        this.onViewChange = this.onViewChange.bind(this);
        this.onModeChange = this.onModeChange.bind(this);
    }

    onViewChange(e: any){
        this.props.onSelectedViewChange(e.target.text);
    }
    onModeChange(e: any){
        this.props.onSelectedModeChange(e.target.text);
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
                        <Dropdown>
                            <Dropdown.Toggle size='sm' variant='outline-primary'>{this.props.selectedMode}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {
                                    this.props.modes.filter(m => m !== this.props.selectedMode).map(mode => (
                                        <Dropdown.Item onClick={this.onModeChange} value={mode} key={mode}>{mode}</Dropdown.Item>
                                    ))
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col className='right'>
                        <Button variant="outline-secondary" size="sm">
                            <img src={icongear} alt='Settings' className='icon gear' />
                        </Button>{' '}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Navigation;