import React, { useEffect } from 'react';

const MobileFix: React.FC = () => {
  useEffect(() => {
    // 添加移动端修复样式
    const style = document.createElement('style');
    style.textContent = `
      /* 移动端输入框修复 */
      @media (max-width: 640px) {
        .bg-white.rounded-lg.shadow-lg {
          margin-left: 4px !important;
          margin-right: 4px !important;
        }
        
        .bg-white.rounded-lg.shadow-lg .p-3,
        .bg-white.rounded-lg.shadow-lg .p-6,
        .bg-white.rounded-lg.shadow-lg .p-8 {
          padding: 12px !important;
        }
        
        .flex.w-full {
          max-width: 100% !important;
          overflow: hidden !important;
        }
        
        .flex.w-full select {
          width: 50px !important;
          padding: 8px 4px !important;
          font-size: 12px !important;
        }
        
        .flex.w-full input[type="tel"] {
          flex: 1 !important;
          min-width: 0 !important;
          width: 0 !important;
          padding: 8px 6px !important;
          font-size: 14px !important;
        }
        
        input[type="text"],
        input[type="tel"] {
          max-width: 100% !important;
          box-sizing: border-box !important;
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
        
        .container.mx-auto {
          padding-left: 8px !important;
          padding-right: 8px !important;
        }
        
        .max-w-2xl.mx-auto {
          width: 100% !important;
          max-width: 100% !important;
        }
      }
      
      /* 防止水平滚动 */
      body, html {
        overflow-x: hidden !important;
      }
      
      .min-h-screen {
        overflow-x: hidden !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default MobileFix;