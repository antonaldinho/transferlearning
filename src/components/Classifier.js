import React, { Component } from "react";
import { Row, Col, Grid } from "react-bootstrap";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import * as tf from "@tensorflow/tfjs";

const classifier = knnClassifier.create();

var wait = ms => new Promise((r, j) => setTimeout(r, ms));
let c;
let last;
export default class Classifier extends Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.count = 0;
    this.state = {
      prediction: "Waiting",
      classId: null
    };
  }

  async componentDidMount() {
    /*
        if(!localStorage.getItem('knnClassifier')){
            let jsonStr = JSON.stringify(require('./knnClassifier'));
            //localStorage.setItem("knnClassifier", jsonStr);
            console.log(jsonStr);
        }*/
    //console.log(this.props);
    this.knnLoad();
    let cam = this.props.cam.current;
    cam.addEventListener("loadeddata", () => {
      this.detectFrame(cam, this.props.props.model, this.props.props.net);
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  sendData = () => {
    this.props.parentCallback({
      className: this.state.prediction,
      classId: this.state.classId
    });
  };

  knnLoad = () => {
    if (classifier.getNumClasses() == 0) {
      //can be change to other source
      let tensorObj = require("./knnClassifier");
      Object.keys(tensorObj).forEach(key => {
        tensorObj[key] = tf.tensor(tensorObj[key], [
          Math.floor(tensorObj[key].length / 1024),
          1024
        ]);
      });
      classifier.setClassifierDataset(tensorObj);
    }
  };

  detectFrame = (video, model, mobil) => {
    if (video != undefined) {
      model.detect(video).then(predictions => {
        //console.log(predictions);
        this.renderPredictions(predictions, mobil);
        requestAnimationFrame(() => {
          this.detectFrame(video, model);
        });
      });
    }
  };

  renderPredictions = (predictions, mobil) => {
    if (this.props.canvas.current && this.mounted) {
      const ctx = this.props.canvas.current.getContext("2d");
      const ctx2 = this.props.canvas2.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const font = "24px helvetica";
      ctx.font = font;
      ctx.textBaseline = "top";

      predictions.forEach(prediction => {
        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];
        if (prediction.class == "bottle" && prediction.score >= 0.3) {
          ctx2.drawImage(
            this.props.cam.current,
            x,
            y,
            width,
            height,
            0,
            0,
            224,
            224
          ); //cuadrante
          c = ctx2.getImageData(0, 0, 224, 224);
          this.transferLearning(c, mobil, "bottle");

          //this.transferLearning(c,mobil);

          // Draw the bounding box.
          ctx.strokeStyle = "#2fff00";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, width, height);

          // Draw the label background.
          ctx.fillStyle = "#2fff00";
          const textWidth = ctx.measureText(prediction.class).width;
          const textHeight = parseInt(font, 10);

          // draw top left rectangle
          ctx.fillRect(x, y, textWidth + 10, textHeight + 10);

          // draw bottom left rectangle
          ctx.fillRect(
            x,
            y + height - textHeight,
            textWidth + 15,
            textHeight + 10
          );

          // Draw the text last to ensure it's on top.
          ctx.fillStyle = "#000000";
          ctx.fillText(prediction.class, x, y);
          ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
        } else {
          this.transferLearning(this.props.cam.current, mobil, "");
          // Draw the bounding box.
          ctx.strokeStyle = "#0984e3";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, width, height);

          // Draw the label background.
          ctx.fillStyle = "#0984e3";

          const textWidth = ctx.measureText(prediction.class).width;
          const textHeight = parseInt(font, 10);

          // draw top left rectangle
          ctx.fillRect(x, y, textWidth + 10, textHeight + 10);

          // draw bottom left rectangle
          ctx.fillRect(
            x,
            y + height - textHeight,
            textWidth + 15,
            textHeight + 10
          );

          // Draw the text last to ensure it's on top.
          ctx.fillStyle = "#000000";
          ctx.fillText(prediction.class, x, y);
          ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
        }
      });
    }
  };
  verifyClass = value => {
    if (value == last) {
      this.count++;
      last = value;
    } else {
      this.count = 1;
      last = value;
    }
  };

  transferLearning = async (video, mobil, label) => {
    let confidence = 0.6;
    let cont = 5;
    if (label == "bottle") {
      confidence = 0.5;
      cont = 1;
    }
    if (this.mounted) {
      const activation = this.props.props.net.infer(video, "conv_preds");
      let k = 10;
      const result = await classifier.predictClass(activation, k);
      const classes = [
        "Coca",
        "Coca lata",
        "Coca zero",
        "Sabritas",
        "Pepsi",
        "Donitas",
        "Krankys",
        "Emperador",
        "Jugo",
        "cafe",
        "Fondo"
      ];
      //console.log(classes[result.label] + " " + result.confidences[result.label] + " " + label);
      this.verifyClass(classes[result.label]);
      if (
        this.count > cont &&
        result.label != 10 &&
        result.confidences[result.label] > confidence
      ) {
        this.setState({ prediction: classes[result.label] });
        this.setState({ probability: result.confidences[result.label] });
        this.setState({ classId: result.label });
        this.sendData();
        await wait(3000);
        this.setState({ prediction: "Waiting", probability: "-" });
      }
    }
  };

  render() {
    return (
      <div>
        <Grid>
          <Row>
            <Col>Prediction: {this.state.prediction}</Col>
          </Row>

          <Row>
            <Col>Probability: {this.state.probability}</Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
