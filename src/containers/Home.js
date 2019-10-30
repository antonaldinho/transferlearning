import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
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
export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            items: []
        };
        this.cam = React.createRef();
        this.canvas = React.createRef();
        this.canvas2 = React.createRef();

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
            const items = this.getItems();

            this.setState({ items });
            this.setupWebcam();
        } catch (e) {
            alert("error: " + e);
        }

        this.setState({ isLoading: false });
    }

    getItems() {
        // Demo data change for real json generated.
        return [
            {
                itemId: 1,
                itemName: "Coca Cola",
                itemQuantity: 1
            },
            {
                itemId: 1,
                itemName: "Pepsi",
                itemQuantity: 1
            }
        ];
    }

    renderItemsList(items) {
        return [{}].concat(items).map((item, i) =>
            i !== 0 ? (
                <LinkContainer key={item.itemId} to={`/items/${item.itemId}`}>
                    <ListGroupItem header={item.itemName.trim().split("\n")[0]}>
                        {"Quantity: " + item.itemQuantity}
                    </ListGroupItem>
                </LinkContainer>
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
