import React, { Component } from "react";
import "@tensorflow/tfjs";
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';

export default class WebcamComponent extends Component {

    constructor() {
        super();
        this.cam = React.createRef();
    }

    // knnLoad = () => {
    //     //knnClassifier30.json se comparta de manera semi-estable
    //     // se cambio el 9/10/2019 por knnClassifierv4.json
    //     //knnClassifierv4.json le falta entrenamiento
    //     // se dejará por el momento el knnClassiifier30.json
    //     //let tensorObj = require('./knnClassifier30.json')
    //     let tensorObj = require('./knnClassifierAndatti.json');
    //     Object.keys(tensorObj).forEach((key) => {
    //         console.log(tensorObj[key].length);
    //         tensorObj[key] = tf.tensor(tensorObj[key], [Math.floor(tensorObj[key].length / 1000), 1024]);
    //     });
    //     this.classifier.setClassifierDataset(tensorObj);
    // }

    // mobilenetLoad = async () => {
    //     console.log('Loading mobilenet..');
    //     const net = await mobilenet.load();
    //     console.log('Sucessfully Mobilnet model');
    //     this.predictions(net);
    // }

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

    componentDidMount() {
        console.log('DidMount')
        this.setupWebcam();
    }
    render() {
        return (
            <video ref={this.cam} autoPlay playsInline muted id="webcam" width="600" height="500" />
        )
    }
}