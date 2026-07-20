import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Square, Play, Download } from 'lucide-react';
import { getCameraPermission, stopStreamTracks } from '../../utils/mediaUtils';
import { RECORDING_STATUS, PROCTOR_LABELS } from '../../utils/telemetryConstants';

export default function WebcamStream({ onRecordingComplete, isSessionActive }) {
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState(RECORDING_STATUS.IDLE);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState('');
  const [cameraError, setCameraError] = useState('');
  const liveVideoRef = useRef(null);
  const chunksRef = useRef([]);

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
    if (isSessionActive && !stream) {
      handleInitCamera();
    }
    return () => {
      if (stream) {
        stopStreamTracks(stream);
        setStream(null);
      }
    };
  }, [isSessionActive]);

  const handleInitCamera = async () => {
    setCameraError('');
    try {
      const combinedStream = await getCameraPermission();
      setPermission(true);
      setStream(combinedStream);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = combinedStream;
      }
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera access denied. Please grant permission in browser settings.'
        : err.name === 'NotFoundError'
        ? 'No camera device found.'
        : `Camera error: ${err.message}`;
      setCameraError(msg);
      setPermission(false);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    setRecordingStatus('recording');
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    try {
      const media = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(media);
      media.ondataavailable = (event) => {
        if (typeof event.data !== 'undefined' && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      media.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideoUrl(videoUrl);
        if (onRecordingComplete) {
          onRecordingComplete(videoUrl, videoBlob);
        }
        chunksRef.current = [];
      };
      media.start(1000);
    } catch (err) {
      setCameraError(`Recording init failed: ${err.message}`);
      setRecordingStatus('idle');
    }
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
          <Video size={14} color={recordingStatus === RECORDING_STATUS.RECORDING ? '#ef4444' : '#aaa'} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#ccc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{PROCTOR_LABELS.HEADER_TITLE}</span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: '600', color: recordingStatus === RECORDING_STATUS.RECORDING ? '#ef4444' : '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: recordingStatus === RECORDING_STATUS.RECORDING ? '#ef4444' : '#888', display: 'inline-block', animation: recordingStatus === RECORDING_STATUS.RECORDING ? 'pulse 1.5s infinite' : 'none' }} />
          {recordingStatus.toUpperCase()}
        </span>
      </div>

      <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid #222' }}>
        {permission && stream ? (
          <video ref={setVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <VideoOff size={24} color="#555" />
            <span style={{ fontSize: '12px', color: '#888' }}>{PROCTOR_LABELS.OFFLINE}</span>
            <button onClick={handleInitCamera} style={{ marginTop: '8px', padding: '4px 10px', fontSize: '11px', background: '#222', border: '1px solid #333', color: '#ccc', borderRadius: '4px', cursor: 'pointer' }}>
              {PROCTOR_LABELS.PERMISSION_GRANT}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {recordingStatus === RECORDING_STATUS.IDLE && (
          <button
            onClick={startRecording}
            disabled={!permission}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#fff', color: '#000', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Play size={12} /> {PROCTOR_LABELS.START_FEED}
          </button>
        )}
        {recordingStatus === RECORDING_STATUS.RECORDING && (
          <button
            onClick={stopRecording}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            <Square size={12} /> {PROCTOR_LABELS.STOP_FEED}
          </button>
        )}
        {recordingStatus === RECORDING_STATUS.STOPPED && recordedVideoUrl && (
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              onClick={startRecording}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #333', background: 'transparent', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
            >
              {PROCTOR_LABELS.RE_RECORD}
            </button>
            <a
              href={recordedVideoUrl}
              download="interview_session_telemetry.webm"
              style={{ flex: 1, padding: '8px', borderRadius: '6px', background: '#222', border: '1px solid #333', color: '#fff', fontSize: '11px', fontWeight: '600', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Download size={12} /> {PROCTOR_LABELS.DOWNLOAD}
            </a>
          </div>
        )}
        {!permission && (
          <button onClick={handleInitCamera} disabled={!!cameraError} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #333', background: 'transparent', color: cameraError ? '#555' : '#fff', fontSize: '11px', fontWeight: '600', cursor: cameraError ? 'not-allowed' : 'pointer' }}>
            Retry Camera
          </button>
        )}
      </div>
    </div>
  );
}
