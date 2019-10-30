import React, {Component} from "react";
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as cocoSSD from '@tensorflow-models/coco-ssd';

const classifier = knnClassifier.create();

var wait = ms => new Promise((r, j)=>setTimeout(r, ms));
let c;
let net;
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
        this.mobilnetLoad();
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
    mobilnetLoad=async ()=>{
        console.log('Loading mobilenet..');
        net = await mobilenet.load();
        console.log('Sucessfully Mobilnet model');
        this.loadModel(net);
    }

    loadModel= async (net) =>{
        console.log('Loading SSD model..');
        const model = await cocoSSD.load('mobilenet_v2');
        console.log('Sucessfully SSD model');
        console.log(model);
        this.detectFrame(this.props.cam.current,model, net);
    }


    detectFrame =  (video, model, mobil) => {
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

    renderPredictions = (predictions,mobil) => {
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
    transferLearning=async(video,mobil)=>{
        const activation = net.infer(this.props.cam.current, 'conv_preds');
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

    render(){
        return (
            <div>
                prediction: {this.state.prediction} {'\n'}
                probability: {this.state.probability}
            </div>
        );
    }
    

}
