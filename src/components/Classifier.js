import React, {Component} from "react";
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';

const classifier = knnClassifier.create();

var wait = ms => new Promise((r, j)=>setTimeout(r, ms));
let c;
let net;
export default class Classifier extends Component {

    constructor(props) {
        super(props);
        this.mounted = true;
        this.state = {
            prediction : 'Waiting',
            classId: null
        }
    }

    async componentDidMount() {
        /*
        if(!localStorage.getItem('knnClassifier')){
            let jsonStr = JSON.stringify(require('./knnClassifier'));
            //localStorage.setItem("knnClassifier", jsonStr);
            console.log(jsonStr);
        }*/
        console.log(this.props);
        this.knnLoad();
        let cam = this.props.cam.current;
        cam.addEventListener('loadeddata', () =>{
            this.detectFrame(cam, this.props.props.model, this.props.props.net);
        })
    }
    componentWillUnmount(){
        this.mounted = false;
    }

    sendData= () =>{
        this.props.parentCallback({className: this.state.prediction, classId: this.state.classId});
    }

    knnLoad = () =>{
        if (classifier.getNumClasses() == 0) {   
            //can be change to other source
            let tensorObj = require('./knnClassifier');
            Object.keys(tensorObj).forEach((key) => {
            tensorObj[key] = tf.tensor(tensorObj[key], [Math.floor(tensorObj[key].length / 1000), 1024]);
            });
            classifier.setClassifierDataset(tensorObj);
        }
    };

    detectFrame =  (video, model, mobil) => {
        if(video != undefined){
            model.detect(video).then(
                predictions => {
                    //console.log(predictions);
                    this.transferLearning(video,mobil);
                    this.renderPredictions(predictions,mobil);
                    requestAnimationFrame(() => {
                        this.detectFrame(video, model);
                    });
                });
        }
    }

    renderPredictions = (predictions,mobil) => {
        if(this.props.canvas.current && this.mounted){
            const ctx = this.props.canvas.current.getContext("2d");
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            const font = "24px helvetica";
            ctx.font = font;
            ctx.textBaseline = "top";
        
            predictions.forEach(prediction => {
                const x = prediction.bbox[0];
                const y = prediction.bbox[1];
                const width = prediction.bbox[2];
                const height = prediction.bbox[3];
                if((prediction.class=='bottle')&&(prediction.score >=0.30)){
                    //this.transferLearning(c,mobil);
            
                    // Draw the bounding box.
                    ctx.strokeStyle = "#2fff00";
                    ctx.lineWidth = 1.5;
                    ctx.strokeRect(x, y, width, height);
            
                    // Draw the label background.
                    ctx.fillStyle = "#2fff00";
                    const textWidth = ctx.measureText(this.state.text).width;
                    const textHeight = parseInt(font, 10);
            
                    // draw top left rectangle
                    ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
            
                    // draw bottom left rectangle
                    ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);

                    // Draw the text last to ensure it's on top.
                    ctx.fillStyle = "#000000";
                    ctx.fillText(this.state.text, x, y);
                    ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
                }
                else if(prediction.class !='bottle'){
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
                    ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);
            
                    // Draw the text last to ensure it's on top.
                    ctx.fillStyle = "#000000";
                    ctx.fillText(prediction.class, x, y);
                    ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
                }
            });
        }
        
    }
    transferLearning=async(video,mobil)=>{
        if(this.mounted){
            const activation = this.props.props.net.infer(video, 'conv_preds');
            let k = 10;
            const result = await classifier.predictClass(activation,k);
            const classes = ["Coca", "Coca lata", "Coca zero", "Sabritas", "Pepsi", "Donitas", "Krankys", "Emperador", "Jugo", "cafe","Fondo"];
            if(classes[result.label] != this.state.prediction && result.label != 10 && result.confidences[result.label] > 0.3){
                this.setState({prediction:classes[result.label]});
                this.setState({probability: result.confidences[result.label]})
                this.setState({classId: result.label});
                this.sendData();
                await wait(3000);
                this.setState({prediction: 'Waiting', probability: '-'})
            }
        }
    }

    render(){
        return (
            <div>
                prediction: {this.state.prediction} {'\n'}
                probability: {this.state.probability}
            </div>
        );
    }
    

}
