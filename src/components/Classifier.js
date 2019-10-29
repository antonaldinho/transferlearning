import React, {Component} from "react";
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

const classifier = knnClassifier.create();

var wait = ms => new Promise((r, j)=>setTimeout(r, ms));
let net;

export default class Classifier extends Component {

    constructor(props) {
        super(props);
        this.state = {
            prediction : 'Waiting',
        }
    }

    componentDidMount() {
        console.log('DidMount')
        this.knnLoad();
        this.startC(); 
    }

    sendData= (pred) =>{
        this.props.parentCallback(pred);
    }

    knnLoad = () =>{
        //can be change to other source
        let tensorObj = require('./knnClassifier.json');
        Object.keys(tensorObj).forEach((key) => {
        tensorObj[key] = tf.tensor(tensorObj[key], [Math.floor(tensorObj[key].length / 1000), 1024]);
        console.log(Math.floor(tensorObj[key].length));
        });
        classifier.setClassifierDataset(tensorObj);
        console.log(tensorObj);
    };

     startC = async () =>{
        net = await mobilenet.load();
        let vid =  await this.props.cam.current;
        if (classifier.getNumClasses() > 0) {
            this.classify()
        }
    };
    classify = async () =>{
        const activation = net.infer(await this.props.cam.current, 'conv_preds');
        // Get the most likely class and confidences from the classifier module.
        const result = await classifier.predictClass(activation);                
        const classes = ['Coca','Cafe','Coca light','Sabritas','Emperador'];
        if(result.confidences[result.label] > 0.7 && this.state.prediction != classes[result.label]
            && result.label != 4){
            this.setState({prediction: classes[result.label]});
            this.sendData(classes[result.label]);
            wait(50000);
        }
        requestAnimationFrame(() => {
            this.classify();
        });
    }

    render(){
        return (
            <div>
                prediction: {this.state.prediction} {'\n'}
                probability: {this.state.probability}
            </div>
        )
    }

}
