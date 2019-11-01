import React, { Component } from "react";
import {
  PageHeader,
  ListGroup,
  ListGroupItem,
  Modal,
  Button,
  Row,
  Col,
  Grid
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "@tensorflow/tfjs";
import "./Home.css";
import Classifier from "../components/Classifier";

const divStyle = {
  position: "relative",
  top: "0px",
  left: "0px"
};
const camStyle = {
  position: "absolute",
  top: "10px",
  left: "5px"
};
const recogStyle = {
  display: "flex",
  flexDirection: "row",
  alginContent: "stretch",
  justifyContent: "space-between"
};
const deleteButtonStyle = {
  top: "50%",
  left: "95%",
  transform: "translate(-50%, -50%)"
};
const prices = [15, 8, 15, 16, 12, 18, 10, 13, 18, 20];
export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      items: [],
      showModal: false,
      productName: null,
      productId: null,
      totalPrice: 0
    };
    this.cam = React.createRef();
    this.canvas = React.createRef();
    this.canvas2 = React.createRef();
    this.handleClose = this.handleClose.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleSaveItem = this.handleSaveItem.bind(this);
    this.handleDeleteItemClick = this.handleDeleteItemClick.bind(this);
    this.calculatePrice = this.calculatePrice.bind(this);
  }

  setupWebcam = async () => {
    const node = this.cam.current;
    var vid_constraints = {
      mandatory: {
        maxHeight: 500,
        maxWidth: 600
      }
    };
    var constraints = { audio: false, video: vid_constraints };
    return new Promise((resolve, reject) => {
      const navigatorAny = navigator;
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia ||
        navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
      if (navigator.getUserMedia) {
        try {
          navigator.getUserMedia(
            constraints,
            stream => {
              node.srcObject = stream;
              node.addEventListener("loadeddata", () => resolve(), false);
            },
            error => reject()
          );
        } catch (err) {
          console.log(err);
        }
      } else {
        reject();
      }
    });
  };

  async componentDidMount() {
    try {
      this.setupWebcam();
    } catch (e) {
      alert("error: " + e);
    }

    this.setState({ isLoading: false });
  }

  calculatePrice() {
    let price = 0;
    for (let i = 0; i < this.state.items.length; i++) {
      price =
        price +
        this.state.items[i].itemQuantity * prices[this.state.items[i].itemId];
    }
    return price;
  }

  callbackFunction = childData => {
    this.setState({ productName: childData.className });
    this.setState({ productId: childData.classId });
    this.setState({ showModal: true });

    //this.setState({productName: childData});
  };

  handleClose() {
    this.setState({ showModal: false });
  }

  handleSaveItem() {
    var includesItem = false;
    const newItems = this.state.items.map(item => {
      if (item.itemId === this.state.productId) {
        item.itemQuantity = item.itemQuantity + 1;
        includesItem = true;
      }
      return item;
    });
    if (includesItem) {
      this.setState(newItems);
    } else {
      let items = this.state.items;
      const newItem = {
        itemId: this.state.productId,
        itemName: this.state.productName,
        itemQuantity: 1
      };
      items.push(newItem);
      this.setState({ items: items });
    }
    const newPrice = this.calculatePrice();
    this.setState({ showModal: false, totalPrice: newPrice });
  }

  handleShow() {
    this.setState({ showModal: true });
  }

  handleDeleteItemClick = async event => {
    const itemId = event.target.name;
    let items = this.state.items;
    for (let i = 0; i < this.state.items.length; i++) {
      if (items[i].itemId === itemId) {
        items.splice(i, 1);
        break;
      }
    }
    const newPrice = this.calculatePrice();
    this.setState({ items: items, totalPrice: newPrice });
  };

  renderItemsList(items) {
    return [{}].concat(items).map((item, i) =>
      i !== 0 ? (
        <ListGroupItem header={item.itemName.trim().split("\n")[0]}>
          <Row>
            <Col md={11}>
              {"Quantity: " + item.itemQuantity}
              {"\n"}
              {"Price: " + item.itemQuantity * prices[item.itemId]}
            </Col>
            <Col>
              <Button
                style={deleteButtonStyle}
                variant="danger"
                name={item.itemId}
                onClick={this.handleDeleteItemClick}
              >
                x
              </Button>
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
    let childProps = {
      net: this.props.net,
      model: this.props.model,
      cam: this.cam,
      canvas: this.canvas,
      canvas2: this.canvas2
    };
    console.log(childProps);
    return (
      <div className="items">
        <PageHeader>Scan new product</PageHeader>

        {/** Camera section */}

        <Grid>
          <Row className="show-grid">
            <Col style={{ padding: 0 }} xs={12} md={8}>
              <div className="cam" style={divStyle}>
                <video ref={this.cam} autoPlay muted id="webcam" />
                <canvas
                  style={{ display: "none" }}
                  ref={this.canvas}
                  width="600"
                  height="500"
                />
                <canvas
                  style={{ display: "none" }}
                  ref={this.canvas2}
                  width="224"
                  height="224"
                />
              </div>
              <Classifier
                cam={this.cam}
                canvas={this.canvas}
                canvas2={this.canvas2}
                props={childProps}
                parentCallback={this.callbackFunction}
              ></Classifier>
            </Col>
          </Row>

          {/** Shopping cart */}
          <Row className="show-grid">
            <Col style={{ padding: 0 }} xs={12} md={8}>
              <PageHeader>Shopping cart</PageHeader>
              {"Total price: " + this.state.totalPrice}

              <ListGroup>
                {!this.state.isLoading &&
                  this.renderItemsList(this.state.items)}
              </ListGroup>
            </Col>
          </Row>
        </Grid>

        {/** Modal section */}
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
