import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Videocam, VideocamOff, AlertTriangle } from 'lucide-react';

const FaceDetector = forwardRef(({ onCheatingIncident, darkMode = false }, ref) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  const modelRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const lastFacePositionRef = useRef(null);
  const noFaceCountRef = useRef(0);
  const faceMovementCountRef = useRef(0);

  useImperativeHandle(ref, () => ({
    start: startDetection,
    stop: stopDetection
  }));

  useEffect(() => {
    initializeModel();
    return () => {
      stopDetection();
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  const initializeModel = async () => {
    try {
      setStatus('Loading face detection model...');
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 1,
      };
      
      const detector = await faceLandmarksDetection.createDetector(
        model,
        detectorConfig
      );
      
      modelRef.current = detector;
      setStatus('Model loaded. Starting camera...');
      await startCamera();
    } catch (err) {
      console.error('Error initializing model:', err);
      setError('Failed to initialize face detection. Please allow camera access.');
      setStatus('Error');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          startDetection();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera access to continue.');
      setStatus('Camera Error');
    }
  };

  const startDetection = () => {
    if (!modelRef.current || isDetecting) return;
    
    setIsDetecting(true);
    setStatus('Monitoring...');
    setError(null);

    detectionIntervalRef.current = setInterval(() => {
      detectFace();
    }, 1000);
  };

  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !modelRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    try {
      const faces = await modelRef.current.estimateFaces(video, {
        flipHorizontal: false,
        staticImageMode: false
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (faces.length === 0) {
        noFaceCountRef.current++;
        if (noFaceCountRef.current >= 3) {
          onCheatingIncident && onCheatingIncident(
            'FACE_NOT_DETECTED',
            'Face not detected in camera view'
          );
          setStatus('⚠️ Face not detected');
          noFaceCountRef.current = 0;
        }
        lastFacePositionRef.current = null;
        return;
      }

      if (faces.length > 1) {
        onCheatingIncident && onCheatingIncident(
          'MULTIPLE_FACES',
          'Multiple faces detected in camera view'
        );
        setStatus('⚠️ Multiple faces detected');
        return;
      }

      noFaceCountRef.current = 0;
      const face = faces[0];
      const keypoints = face.keypoints;

      const noseTip = keypoints.find(kp => kp.name === 'nose tip');
      if (!noseTip) return;

      const currentPosition = {
        x: noseTip.x,
        y: noseTip.y,
        z: noseTip.z || 0
      };

      if (lastFacePositionRef.current) {
        const movement = calculateMovement(lastFacePositionRef.current, currentPosition);
        
        const movementThreshold = 50;
        const zMovementThreshold = 0.1;

        if (movement.distance > movementThreshold || Math.abs(movement.zChange) > zMovementThreshold) {
          faceMovementCountRef.current++;
          
          if (faceMovementCountRef.current >= 2) {
            onCheatingIncident && onCheatingIncident(
              'FACE_MOVED',
              `Significant face movement detected (${Math.round(movement.distance)}px)`
            );
            setStatus('⚠️ Face movement detected');
            faceMovementCountRef.current = 0;
          }
        } else {
          faceMovementCountRef.current = Math.max(0, faceMovementCountRef.current - 1);
          setStatus('✓ Monitoring');
        }
      }

      lastFacePositionRef.current = currentPosition;

      ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
      keypoints.forEach(keypoint => {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });

    } catch (err) {
      console.error('Error detecting face:', err);
    }
  };

  const calculateMovement = (prev, current) => {
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const zChange = (current.z || 0) - (prev.z || 0);
    
    return { distance, zChange };
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
      <div className="flex items-center mb-3">
        {isDetecting ? (
          <Videocam className="w-5 h-5 text-green-500 mr-2" />
        ) : (
          <VideocamOff className="w-5 h-5 text-gray-400 mr-2" />
        )}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Face Detection</h3>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="relative mb-3">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full rounded-lg ${isDetecting ? 'block' : 'hidden'}`}
        />
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full rounded-lg ${isDetecting ? 'block' : 'hidden'}`}
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Status: <span className="font-medium">{status}</span>
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
        AI-powered monitoring is active. Keep your face centered and visible.
      </p>
    </div>
  );
});

FaceDetector.displayName = 'FaceDetector';

export default FaceDetector;
