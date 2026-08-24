'use client';

import React from 'react';

export default function StatusPage() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 250px)',
        padding: '40px 20px'
      }}
    >
      <style jsx>{`
        .status-card {
          background-color: #ffffff;
          padding: 50px 60px;
          border-radius: 14px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          text-align: center;
          border: 1px solid #e2e8f0;
          max-width: 550px;
          width: 100%;
        }
        .pulse-dot {
          height: 26px;
          width: 26px;
          background-color: #2ecc71;
          border-radius: 50%;
          display: inline-block;
          margin-bottom: 20px;
          animation: pulse 1.5s infinite;
        }
        h1 {
          margin: 0 0 10px 0;
          color: #2c3e50;
          font-size: 26px;
          font-weight: 800;
        }
        p {
          color: #7f8c8d;
          font-size: 16px;
          line-height: 1.6;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
          }
          70% {
            box-shadow: 0 0 0 16px rgba(46, 204, 113, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
          }
        }
      `}</style>

      <div className="status-card">
        <span className="pulse-dot"></span>
        <h1>MCQ Engine is Fully Charged!</h1>
        <p>Oxygen level normal. The knowledge battleground is perfectly prepared and running smoothly.</p>
      </div>
    </div>
  );
}
