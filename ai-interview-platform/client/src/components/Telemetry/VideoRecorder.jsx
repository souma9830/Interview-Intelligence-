import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Square, Play, Download, AlertCircle } from 'lucide-react';
import { STANDARD_AUDIO_CONSTRAINTS, STANDARD_VIDEO_CONSTRAINTS } from '../../utils/audioConstraints';

export default function VideoRecorder({ onRecordingComplete, isSessionActive }) {
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, recording, stopped
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoChunks, setVideoChunks] = useState([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState('');
  const liveVideoRef = useRef(null);

  // Set stream as srcObject when the video node mounts dynamically
  const setVideoRef = (node) => {
    if (node && stream) {
      node.srcObject = stream;
    }
    liveVideoRef.current = node;
  };

  useEffect(() => {
    if (stream && liveVideoRef.current) {
      liveVideoRef.current.srcObject = stream;
    }
  }, [stream]);


  useEffect(() => {
    // Start camera stream on mount if active
    if (isSessionActive && !stream) {
      getCameraPermission();
    }
    return () => {
      stopCameraStream();
    };
  }, [isSessionActive]);

  const getCameraPermission = async () => {
    try {
      const combinedStream = await navigator.mediaDevices.getUserMedia({
        video: STANDARD_VIDEO_CONSTRAINTS,
        audio: STANDARD_AUDIO_CONSTRAINTS
      });
      setPermission(true);
      setStream(combinedStream);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = combinedStream;
      }
    } catch (err) {
      console.error('Error getting media devices permissions:', err);
      setPermission(false);
    }
  };

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    setRecordingStatus('recording');
    const media = new MediaRecorder(stream, { mimeType: 'video/webm' });
    setMediaRecorder(media);
    media.start();
    let localChunks = [];
    media.ondataavailable = (event) => {
      if (typeof event.data !== 'undefined' && event.data.size > 0) {
        localChunks.push(event.data);
      }
    };
    setVideoChunks(localChunks);
    media.onstop = () => {
      const videoBlob = new Blob(localChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideoUrl(videoUrl);
      if (onRecordingComplete) {
        onRecordingComplete(videoUrl, videoBlob);
      }
      setVideoChunks([]);
    };
  };

  const stopRecording = () => {
    if (mediaRecorder && recordingStatus === 'recording') {
      mediaRecorder.stop();
      setRecordingStatus('stopped');
    }
  };

  return (
    <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={14} color={recordingStatus === 'recording' ? '#ef4444' : '#aaa'} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#ccc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Proctored Video Telemetry</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: '600', color: recordingStatus === 'recording' ? '#ef4444' : '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: recordingStatus === 'recording' ? '#ef4444' : '#888', display: 'inline-block', animation: recordingStatus === 'recording' ? 'pulse 1.5s infinite' : 'none' }} />
          {recordingStatus.toUpperCase()}
        </span>
      </div>

      <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid #222' }}>
        {permission && stream ? (
          <video ref={setVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <VideoOff size={24} color="#555" />
            <span style={{ fontSize: '12px', color: '#888' }}>Telemetry offline (Mic/Cam denied)</span>
            <button onClick={getCameraPermission} style={{ marginTop: '8px', padding: '4px 10px', fontSize: '11px', background: '#222', border: '1px solid #333', color: '#ccc', borderRadius: '4px', cursor: 'pointer' }}>
              Grant Permission
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {recordingStatus === 'idle' && (
          <button
            onClick={startRecording}
            disabled={!permission}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#fff', color: '#000', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Play size={12} /> Start Proctoring Feed
          </button>
        )}
        {recordingStatus === 'recording' && (
          <button
            onClick={stopRecording}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Square size={12} /> Stop Proctoring Feed
          </button>
        )}
        {recordingStatus === 'stopped' && recordedVideoUrl && (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={startRecording}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #333', background: 'transparent', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
            >
              Re-record
            </button>
            <a
              href={recordedVideoUrl}
              download="interview_session_telemetry.webm"
              style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#222', border: '1px solid #333', color: '#fff', fontSize: '11px', fontWeight: '600', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Download size={12} /> Download WebM
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Video telemetry monitoring enabled
