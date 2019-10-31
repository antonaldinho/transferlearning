import React, { Component } from "react";
import {
  PageHeader,
  ListGroup,
  ListGroupItem,
  Button,
  Label,
  Grid,
  Row,
  Col,
  ButtonGroup,
  ButtonToolbar
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

import * as mobilenet from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from "@tensorflow/tfjs";
import streamSaver from 'streamsaver'
import "./Training.css";


export default class Training extends Component {
  constructor(props) {
    super(props);

    this.cam = React.createRef();
    this.mounted = true;

    this.state = {
      isLoading: true,
      items: [],
      consoleText: "",

      // Data management
      classifier: knnClassifier.create(),
      counter: "",
      count: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      net: null
    };
  }

  async componentDidMount() {
    // Load the model.
    this.setState({ isLoading: false, net: await mobilenet.load() });

    // Set up webcam
    this.setupWebcam();

    while (true && this.mounted) {
      if (this.state.classifier.getNumClasses() > 0) {
        // Get the activation from mobilenet from the webcam.
        const activation = this.state.net.infer(this.cam.current, "conv_preds");
        // Get the most likely class and confidences from the classifier module.
        let k = 10;
        const result = await this.state.classifier.predictClass(activation, k);
        const classes = ["Coca", "Coca lata", "Coca zero", "Sabritas", "Pepsi", "Donitas", "Krankys", "Emperador", "Jugo", "cafe","Fondo"];

        this.setState({
          consoleText: `Prediction: ${classes[result.label]}, Probability: ${
            result.confidences[result.label]
          }`
        });

        // Dispose the tensor to release the memory.
      }
      // Give some breathing room by waiting for the next animation frame to
      // fire.
      await tf.nextFrame();
    }
  }

  componentWillUnmount(){
    this.mounted = false;
  }

  setupWebcam = async () => {
    const node = this.cam.current;

    return new Promise((resolve, reject) => {
      const navigatorAny = navigator;

      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia ||
        navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;

      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true },

          stream => {
            node.srcObject = stream;

            node.addEventListener("loadeddata", () => resolve(), false);
          },

          error => reject()
        );
      } else {
        reject();
      }
    });
  };

  async addExample(classId) {
    let auxCount = this.state.count;
    auxCount[classId] = auxCount[classId] + 1;

    this.setState({ count: auxCount });

    console.log("count" + this.state.count);
    console.log("classId" + classId);

    // Capture an image from the web camera.
    let className = ["Coca", "Coca lata", "Coca zero", "Sabritas", "Pepsi", "Donitas", "Krankys", "Emperador", "Jugo", "Cafe","Fondo"];

    this.setState({
      counter: `Class: ${className[classId]}, Counter: ${this.state.count[classId]}`
    });

    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = this.state.net.infer(this.cam.current, "conv_preds");

    // Pass the intermediate activation to the classifier.
    this.state.classifier.addExample(activation, classId);

    // Dispose the tensor to release the memory.
  }

  saveData(content, name) {
    var blob = new Blob([content], {type: "application/json"});
    const fileStream = streamSaver.createWriteStream(name, {
      size: blob.size // Makes the procentage visiable in the download
    })
    const readableStream = blob.stream()

    // more optimized pipe version
    // (Safari may have pipeTo but it's useless without the WritableStream)
    if (window.WritableStream && readableStream.pipeTo) {
      return readableStream.pipeTo(fileStream)
        .then(() => console.log('done writing'))
    }

    // Write (pipe) manually
    
  }

  save() {
    let dataset = this.state.classifier.getClassifierDataset();
    console.log(dataset);

    var datasetObj = {};
    Object.keys(dataset).forEach(key => {
      let data = dataset[key].dataSync();
      datasetObj[key] = Array.from(data);
    });
    let jsonStr = JSON.stringify(datasetObj);
    localStorage.setItem("knnClassifier", jsonStr);

    this.saveData(jsonStr, "knnClassifier.json");
  }

  // Renders
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
      <div className="items">
        <PageHeader>Scan objects for training</PageHeader>

        <Grid>
          <Row className="show-grid">
            <Col style={{ padding: 0 }} xs={12} md={8}>
              <video
                ref={this.cam}
                autoPlay
                playsInline
                muted
                id="webcam"
                width="720"
                height="auto"
              />
            </Col>
          </Row>

          <Row className="show-grid">
            {/* Buttons menu */}
            <Col style={{ padding: 0 }} xs={6} md={6}>
              <ButtonToolbar>
                <Button id="class-a" onClick={() => this.addExample(0)}>
                  Coca
                </Button>
                <Button id="class-b" onClick={() => this.addExample(1)}>
                  Coca de lata
                </Button>
                <Button id="class-c" onClick={() => this.addExample(2)}>
                  Coca zero
                </Button>
                <Button id="class-d" onClick={() => this.addExample(3)}>
                  Sabritas
                </Button>
                <Button id="class-e" onClick={() => this.addExample(4)}>
                  Pepsi
                </Button>
                <Button id="class-f" onClick={() => this.addExample(5)}>
                  Donitas
                </Button>
                <Button id="class-g" onClick={() => this.addExample(6)}>
                  Krankys
                </Button>
                <Button id="class-h" onClick={() => this.addExample(7)}>
                  Emperador
                </Button>
                <Button id="class-i" onClick={() => this.addExample(8)}>
                  Jugo
                </Button>
                <Button id="class-j" onClick={() => this.addExample(9)}>
                  Cafe
                </Button>
                <Button id="class-k" onClick={() => this.addExample(10)}>
                  Fondo
                </Button>
              </ButtonToolbar>
            </Col>

            <Col style={{ padding: 0 }} xs={6} md={6}>
              {/* Save */}
              <Button id="class-e" onClick={() => this.save()}>
                Save
              </Button>
            </Col>
          </Row>

          <Row className="show-grid">
            <Col style={{ padding: 0 }} xs={6} md={6}>
              <Label>{this.state.consoleText}</Label>
            </Col>
            <Col style={{ padding: 0 }} xs={6} md={6}>
              <Label>{this.state.counter}</Label>
            </Col>
          </Row>
        </Grid>

        <ListGroup>
          {!this.state.isLoading && this.renderItemsList(this.state.items)}
        </ListGroup>
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
