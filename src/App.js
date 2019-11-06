import React, { Component, Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { ClipLoader } from 'react-spinners';
import Routes from "./Routes";
import "./App.css";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as cocoSSD from '@tensorflow-models/coco-ssd';
import * as tf from "@tensorflow/tfjs";


const loadStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  /* bring your own prefixes */
  transform: 'translate(-50%, -50%)'
}


class App extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      isAuthenticated: true,
      isAuthenticating: true,
      net: null,
      model: null,
      loading: null
    };
  }

  /* Load user session */
  async componentDidMount() {
    this.setState({loading: "Loading mobilenet"});
    this.setState({net: await mobilenet.load()});
    this.setState({loading: "Loading cocossd"});
    this.setState({model: await cocoSSD.load()});
  }

  /* Render App */
  render() {
    if(this.state.net == null || this.state.model == null){
      return( 
        <div style={loadStyle}>
            <ClipLoader
          sizeUnit={"px"}
          size={150}
          color={'#123abc'}
          loading={true}
        >
          </ClipLoader>
          <p>{this.state.loading}</p>
        </div>
      );
    }
    else{
      const childProps = {
        isAuthenticated: this.state.isAuthenticated,
        userHasAuthenticated: this.userHasAuthenticated,
        net: this.state.net,
        model: this.state.model
      };
  
      return (
        
        <div className="App container">
          <Navbar fluid collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">Transfer Learning</Link>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              <Nav pullRight>
                <Fragment>
                  <LinkContainer to="/training">
                    <NavItem>Training</NavItem>
                  </LinkContainer>
                </Fragment>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <Routes childProps={childProps} />
        </div>
        );
      }

    }
    
}

export default withRouter(App);
