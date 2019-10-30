import React, {Component} from "react";
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';

const classifier = knnClassifier.create();

var wait = ms => new Promise((r, j)=>setTimeout(r, ms));


export default class Classifier extends Component {

    constructor(props) {
        super(props);
        this.state = {
            prediction : 'Waiting',
            classId: null
        }
    }

    componentDidMount() {
        console.log('DidMount')
        this.knnLoad();
        this.classify();
    }

    sendData= () =>{
        this.props.parentCallback({className: this.state.prediction, classId: this.state.classId});
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

     classify = async () =>{
        let net = await mobilenet.load();
        let vid =  await this.props.cam.current;
        while (true) {
            if (classifier.getNumClasses() > 0) {      
                // Get the activation from mobilenet from the webcam.
                const activation = net.infer(await this.props.cam.current, 'conv_preds');
                // Get the most likely class and confidences from the classifier module.
                const result = await classifier.predictClass(activation);                
                const classes = ['Coca','Cafe','Coca light','Sabritas','Emperador'];
                
                if(result.confidences[result.label] > 0.7){
                    this.setState({prediction: classes[result.label]});
                    this.setState({probability: result.confidences[result.label]});
                    this.setState({classId: result.label});
                    this.sendData();
                }
                wait(10000);
            }      
        }
    };

    render(){
        return (
            <div>
                prediction: {this.state.prediction} {'\n'}
                probability: {this.state.probability}
            </div>
        )
    }

}
