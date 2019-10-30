import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem, Modal, Button, Row, Col } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "@tensorflow/tfjs";
import "./Home.css";
import Classifier from "../components/Classifier";

const camStyle={
    position: 'absolute',
    left: '3px',
    top: '10px',
    marginLeft: '5px'
}
const recogStyle={
    display: 'flex',
    flexDirection: 'row',
    alginContent: 'stretch',
    justifyContent: 'space-between'
}
const deleteButtonStyle = {
    top: '50%',
    left: '95%',
    transform: 'translate(-50%, -50%)'
}
export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            items: [],
            showModal: false,
            productName: null,
            productId: null
        };
        this.cam = React.createRef();
        this.canvas = React.createRef();
        this.canvas2 = React.createRef();
        this.handleClose = this.handleClose.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleSaveItem = this.handleSaveItem.bind(this);
        this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    }

    setupWebcam = async () => {
        const node = this.cam.current;
        return new Promise((resolve, reject) => {
            const navigatorAny = navigator;
            navigator.getUserMedia = navigator.getUserMedia ||
                navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
                navigatorAny.msGetUserMedia;
            if (navigator.getUserMedia) {
                navigator.getUserMedia({ video: true },
                    stream => {
                        node.srcObject = stream;
                        node.addEventListener('loadeddata', () => resolve(), false);
                    },
                    error => reject());
            } else {
                reject();
            }
        });
    }

    async componentDidMount() {
        try {
            // Extract saved json items
            // const items = this.getItems();

            // this.setState({ items });
            this.setupWebcam();
        } catch (e) {
            alert("error: " + e);
        }

        this.setState({ isLoading: false });
    }

    callbackFunction = (childData) => {
        console.log(childData); 
        if (childData.className !== 'Emperador') {
            this.setState({ productName: childData.className });
            this.setState({ productId: childData.classId });
            this.setState({ showModal: true });
        }
        //this.setState({productName: childData});
    }

    handleClose() {
        this.setState({ showModal: false })
    }

    handleSaveItem() {
        var includesItem = false;
        const newItems = this.state.items.map(item => {
            if (item.itemId === this.state.productId) {
                item.itemQuantity = item.itemQuantity + 1;
                includesItem = true;
            }
            return item;
        })
        if (includesItem) {
            this.setState(newItems);
        }
        else {
            let items = this.state.items;
            const newItem = {
                itemId: this.state.productId,
                itemName: this.state.productName,
                itemQuantity: 1
            }
            items.push(newItem);
            this.setState({ items: items })
        }
        this.setState({ showModal: false })
    }
    handleShow() {
        this.setState({ showModal: true })
    }
    handleDeleteItemClick(event) {
        const itemId = event.target.name;
        const length = this.state.items.length;
        let items = this.state.items;
        for(let i = 0; i < length; i++) {
            if(items[i].itemId === itemId) {
                items.splice(i, 1);
            }
        }
        console.log(items);
        this.setState({items: items});
    }

    // getItems() {
    //     // Demo data change for real json generated.
    //     return [
    //         {
    //             itemId: 1,
    //             itemName: "Coca Cola",
    //             itemQuantity: 1
    //         },
    //         {
    //             itemId: 1,
    //             itemName: "Pepsi",
    //             itemQuantity: 1
    //         }
    //     ];
    // }

    renderItemsList(items) {
        return [{}].concat(items).map((item, i) =>
            i !== 0 ? (
                <ListGroupItem header={item.itemName.trim().split("\n")[0]}>
                    <Row>
                        <Col md={11}>
                            {"Quantity: " + item.itemQuantity}
                        </Col>
                        <Col>
                            <Button style={deleteButtonStyle} variant="danger" name={item.itemId} onClick={this.handleDeleteItemClick}>x</Button>
                        </Col>
                    </Row>
                    
                </ListGroupItem>
            ) : null
        );
    }

    renderLander() {
        return (
            <div className="lander">
                <h1>Transfer learning</h1>
                <p>Product recognition</p>
            </div>
        );
    }

    renderitems() {
        return (
            <div className="items" style={recogStyle}>
                <div className = "cam">
                    <video style={camStyle} ref ={this.cam} autoPlay playsInline muted id="webcam" width="600" height="500"/>
                    <canvas style={camStyle} ref={this.canvas} width="800" height="500" />
                    <canvas style={{display:'none'}} ref={this.canvas2} width="224" height="224" />
                </div>
                <div style={{width: '55%'}}>
                    <PageHeader >Scan new product</PageHeader>
                    <Classifier cam={this.cam} canvas={this.canvas} canvas2={this.canvas2} parentCallback={this.callbackFunction}></Classifier>
                    <PageHeader >Shopping cart</PageHeader>

                    <ListGroup >
                        {!this.state.isLoading && this.renderItemsList(this.state.items)}
                    </ListGroup>
                    <Modal show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>¿Agregar producto?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Nombre del producto: {this.state.productName}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={this.handleSaveItem}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="Home">
                {this.props.isAuthenticated ? this.renderitems() : this.renderLander()}
            </div>
        );
    }
}
