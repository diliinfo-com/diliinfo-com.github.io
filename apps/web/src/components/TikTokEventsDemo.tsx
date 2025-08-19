import React, { useState } from 'react';
import useTikTokEvents from '../hooks/useTikTokEvents';

// TikTok Events API 演示组件
const TikTokEventsDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loanAmount, setLoanAmount] = useState(5000);
  
  // 使用TikTok Events Hook
  const {
    trackButtonClick,
    trackSearch,
    trackContact,
    trackCompleteRegistration,
    trackLead,
    trackLoanApplicationStart,
    trackLoanApplicationComplete,
    trackSignUp,
    trackLogin
  } = useTikTokEvents();
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackSearch(searchQuery);
      alert(`已跟踪搜索事件: ${searchQuery}`);
    }
  };
  
  // 处理联系
  const handleContact = () => {
    trackContact('customer_service');
    alert('已跟踪联系事件');
  };
  
  // 处理注册
  const handleRegistration = () => {
    trackCompleteRegistration('web');
    alert('已跟踪注册完成事件');
  };
  
  // 处理潜在客户
  const handleLead = () => {
    trackLead('inquiry', '贷款咨询');
    alert('已跟踪潜在客户事件');
  };
  
  // 处理贷款申请开始
  const handleLoanStart = () => {
    trackLoanApplicationStart('personal');
    alert('已跟踪贷款申请开始事件');
  };
  
  // 处理贷款申请完成
  const handleLoanComplete = () => {
    trackLoanApplicationComplete(loanAmount, 'personal');
    alert(`已跟踪贷款申请完成事件: ${loanAmount}`);
  };
  
  // 处理登录
  const handleLogin = () => {
    trackLogin('web');
    alert('已跟踪登录事件');
  };
  
  // 处理注册
  const handleSignUp = () => {
    trackSignUp('web');
    alert('已跟踪注册事件');
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">TikTok Events API 演示</h2>
      
      {/* 搜索表单 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">搜索事件</h3>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入搜索关键词"
            className="flex-1 px-4 py-2 border rounded-l"
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
            onClick={() => trackButtonClick('搜索按钮', '搜索表单')}
          >
            搜索
          </button>
        </form>
      </div>
      
      {/* 贷款金额 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">贷款金额</h3>
        <div className="flex items-center">
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(parseInt(e.target.value))}
            className="flex-1 mr-4"
          />
          <span className="font-bold">{loanAmount} MXN</span>
        </div>
      </div>
      
      {/* 事件按钮 */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleContact}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          联系客服
        </button>
        
        <button
          onClick={handleRegistration}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          完成注册
        </button>
        
        <button
          onClick={handleLead}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          提交咨询
        </button>
        
        <button
          onClick={handleLoanStart}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          开始贷款申请
        </button>
        
        <button
          onClick={handleLoanComplete}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          完成贷款申请
        </button>
        
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          用户登录
        </button>
        
        <button
          onClick={handleSignUp}
          className="bg-teal-500 text-white px-4 py-2 rounded"
        >
          用户注册
        </button>
      </div>
    </div>
  );
};

export default TikTokEventsDemo;