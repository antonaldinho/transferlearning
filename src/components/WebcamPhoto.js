import React from 'react';
import Webcam from "react-webcam";
const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
};

const WebcamPhoto = () => {
    const webcamRef = React.useRef(null);

    const capture = React.useCallback(
        () => {
            const imageSrc = webcamRef.current.getScreenshot();
        },
        [webcamRef]
    );

    return (
        <div>
            <Webcam
                audio={false}
                height={360}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={640}
                videoConstraints={videoConstraints}
            />
            <button onClick={capture}>Capture photo</button>
        </div>
    );
};

export default Webcam;