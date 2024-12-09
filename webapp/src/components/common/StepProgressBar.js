// src/components/common/StepProgressBar.js
import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { RegistStepContext } from '../../context/RegistStepContext';

const HIDDEN_PATH_PATTERNS = [
  /^\/profile$/,                  
  /^\/cast\/[^/]+\/profile$/,     
  /^\/another-page$/              
];

function StepProgressBar() {
  const { steps, isFooterVisible, redirectUrl } = useContext(RegistStepContext);
  const location = useLocation();

  const shouldHideFooter = HIDDEN_PATH_PATTERNS.some(pattern => pattern.test(location.pathname));
  if (!isFooterVisible || shouldHideFooter) return null;

  const nextStep = steps.find((step) => !step.completed);
  const remainingSteps = steps.filter(step => !step.completed).length;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#ffe6f2",
      borderTop: "3px solid #ff99cc",
      padding: "20px",
      fontSize: "18px",
      boxShadow: "0px -2px 15px rgba(255, 153, 204, 0.4)",
      color: "#d63384",
      fontFamily: "'Comic Sans MS', cursive, sans-serif",
      textAlign: "center"
    }}>
      <div style={{
        maxWidth: "600px", 
        width: "100%",
      }}>
        <p style={{ fontWeight: "bold", fontSize: "20px", color: "#ff66b2", marginBottom: "10px" }}>
          登録完了で5,000ptボーナスゲット！
        </p>
        {nextStep && (
          <>
            <a href={redirectUrl} style={{
              display: "inline-block",
              padding: "10px 25px",
              backgroundColor: "#ff66b2",
              color: "#fff",
              borderRadius: "20px",
              textDecoration: "none",
              fontWeight: "bold",
              boxShadow: "0px 5px 10px rgba(255, 102, 178, 0.4)",
              transition: "all 0.3s ease",
              marginBottom: "8px"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#ff4da6"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#ff66b2"}
            >
              {nextStep.label}に進む
            </a>
            <p style={{ color: "#ff66b2", fontSize: "14px", marginTop: "8px" }}>
              残り{remainingSteps}ステップ
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default StepProgressBar;
