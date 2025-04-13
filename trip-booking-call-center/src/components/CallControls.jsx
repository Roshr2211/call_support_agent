// components/CallControls.js
import React, { useState } from 'react';
import { Phone, PhoneOff, Pause, UserPlus, MessageSquare } from 'lucide-react';

function CallControls({ callStatus, setCallStatus }) {
  const [callDuration, setCallDuration] = useState('00:00');
  const [timerId, setTimerId] = useState(null);
  
  const startCall = () => {
    setCallStatus('active');
    let seconds = 0;
    const timer = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      setCallDuration(
        `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    setTimerId(timer);
  };
  
  const endCall = () => {
    setCallStatus('idle');
    clearInterval(timerId);
    setCallDuration('00:00');
  };
  
  const toggleHold = () => {
    if (callStatus === 'active') {
      setCallStatus('on-hold');
      clearInterval(timerId);
    } else if (callStatus === 'on-hold') {
      setCallStatus('active');
      startCall();
    }
  };
  
  return (
    <div className="call-controls">
      <div className="call-status">
        {callStatus === 'idle' ? (
          <span>Ready to Call</span>
        ) : (
          <>
            <span className={`status-indicator ${callStatus}`}></span>
            <span>
              {callStatus === 'active' ? 'In Call' : 'On Hold'} - {callDuration}
            </span>
          </>
        )}
      </div>
      <div className="control-buttons">
        {callStatus === 'idle' ? (
          <button className="call-button start" onClick={startCall}>
            <Phone size={20} />
            <span>Start Call</span>
          </button>
        ) : (
          <>
            <button 
              className={`call-button ${callStatus === 'on-hold' ? 'resume' : 'hold'}`} 
              onClick={toggleHold}
            >
              <Pause size={20} />
              <span>{callStatus === 'on-hold' ? 'Resume' : 'Hold'}</span>
            </button>
            <button className="call-button transfer">
              <UserPlus size={20} />
              <span>Transfer</span>
            </button>
            <button className="call-button end" onClick={endCall}>
              <PhoneOff size={20} />
              <span>End Call</span>
            </button>
          </>
        )}
      </div>
      <div className="quick-tools">
        <button className="tool-button">
          <MessageSquare size={16} />
          <span>Quick Responses</span>
        </button>
      </div>
    </div>
  );
}

export default CallControls;

