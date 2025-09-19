import React, { useState, useEffect } from 'react';
import { safeStorage, safeSessionStorage, browserDetection } from '../utils/browserCompat';
import { getApiUrl, isSafari, isWechat, isMobile, isIOS, isAndroid, isQQBrowser, isUCBrowser, isTikTok, isEmbeddedBrowser } from '../config/api';
import { httpClient, checkBrowserCompatibility } from '../utils/httpClient';
import { safariFetch, safariPost, testNetworkConnectivity, testCORSPreflight } from '../utils/safariFetch';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

const StorageDebugTest: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testData, setTestData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [sessionId, setSessionId] = useState<string>('');

  const addLog = (level: LogEntry['level'], message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, level, message, data }]);
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // 初始化测试
  useEffect(() => {
    addLog('info', '开始存储调试测试');
    
    // 增强的浏览器检测
    checkBrowserCompatibility();
    const browserInfo = {
      userAgent: navigator.userAgent,
      isSafari: isSafari(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
      isWeChat: isWechat(),
      isQQBrowser: isQQBrowser(),
      isUCBrowser: isUCBrowser(),
      isTikTok: isTikTok(),
      isEmbeddedBrowser: isEmbeddedBrowser(),
      isMobile: isMobile(),
      // 保留原有的检测方法作为对比
      legacyDetection: {
        isSafari: browserDetection.isSafari,
        isIOS: browserDetection.isIOS,
        isWeChat: browserDetection.isWeChat,
        safariVersion: browserDetection.getSafariVersion(),
        iosVersion: browserDetection.getIOSVersion()
      }
    };
    addLog('info', '浏览器信息', browserInfo);

    // 生成会话ID
    const newSessionId = 'test-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    setSessionId(newSessionId);
    addLog('info', '生成会话ID', { sessionId: newSessionId });

    // 测试原生存储
    testNativeStorage();
  }, []);

  const testNativeStorage = () => {
    addLog('info', '测试原生存储API');
    
    // 测试localStorage
    try {
      localStorage.setItem('debug_test', 'localStorage_works');
      const retrieved = localStorage.getItem('debug_test');
      if (retrieved === 'localStorage_works') {
        addLog('success', 'localStorage 可用');
        localStorage.removeItem('debug_test');
      } else {
        addLog('error', 'localStorage 读取失败');
      }
    } catch (error) {
      addLog('error', 'localStorage 不可用', error);
    }

    // 测试sessionStorage
    try {
      sessionStorage.setItem('debug_test', 'sessionStorage_works');
      const retrieved = sessionStorage.getItem('debug_test');
      if (retrieved === 'sessionStorage_works') {
        addLog('success', 'sessionStorage 可用');
        sessionStorage.removeItem('debug_test');
      } else {
        addLog('error', 'sessionStorage 读取失败');
      }
    } catch (error) {
      addLog('error', 'sessionStorage 不可用', error);
    }
  };

  const testSafeStorage = () => {
    addLog('info', '测试SafeStorage包装器');
    
    try {
      // 测试localStorage包装器
      safeStorage.setItem('debug_safe_local', 'safe_localStorage_works');
      const localResult = safeStorage.getItem('debug_safe_local');
      if (localResult === 'safe_localStorage_works') {
        addLog('success', 'SafeStorage localStorage 可用');
        safeStorage.removeItem('debug_safe_local');
      } else {
        addLog('error', 'SafeStorage localStorage 读取失败', { expected: 'safe_localStorage_works', actual: localResult });
      }

      // 测试sessionStorage包装器
      safeSessionStorage.setItem('debug_safe_session', 'safe_sessionStorage_works');
      const sessionResult = safeSessionStorage.getItem('debug_safe_session');
      if (sessionResult === 'safe_sessionStorage_works') {
        addLog('success', 'SafeStorage sessionStorage 可用');
        safeSessionStorage.removeItem('debug_safe_session');
      } else {
        addLog('error', 'SafeStorage sessionStorage 读取失败', { expected: 'safe_sessionStorage_works', actual: sessionResult });
      }
    } catch (error) {
      addLog('error', 'SafeStorage 测试失败', error);
    }
  };

  const testFormDataStorage = () => {
    addLog('info', '测试表单数据存储');
    
    if (!testData.name || !testData.phone) {
      addLog('warn', '请先填写姓名和手机号');
      return;
    }

    try {
      const formData = {
        ...testData,
        sessionId,
        timestamp: new Date().toISOString()
      };

      // 存储到localStorage
      safeStorage.setItem('form_data', JSON.stringify(formData));
      addLog('info', '表单数据已存储到localStorage', formData);

      // 立即读取验证
      const retrieved = safeStorage.getItem('form_data');
      if (retrieved) {
        const parsedData = JSON.parse(retrieved);
        addLog('success', '表单数据读取成功', parsedData);
      } else {
        addLog('error', '表单数据读取失败');
      }
    } catch (error) {
      addLog('error', '表单数据存储失败', error);
    }
  };

  const testServerAPI = async () => {
    addLog('info', '测试服务器API调用');
    
    if (!testData.name || !testData.phone) {
      addLog('warn', '请先填写姓名和手机号');
      return;
    }

    const requestData = {
      sessionId,
      name: testData.name,
      phone: testData.phone,
      email: testData.email,
      timestamp: new Date().toISOString()
    };

    addLog('info', '发送请求数据', requestData);

    // 1. 首先尝试Safari专用fetch
    addLog('info', '尝试Safari专用fetch包装器');
    const safariResult = await safariPost('/api/applications/guest', requestData, {
      headers: {
        'X-Session-ID': sessionId,
      },
      retries: 2,
      timeout: 15000
    });

    if (safariResult.success) {
      addLog('success', `Safari fetch成功 (${safariResult.responseTime}ms)`, safariResult.data);
      
      // 保存到本地存储
      try {
        safeStorage.setItem('last_api_response', JSON.stringify({
          data: safariResult.data,
          timestamp: new Date().toISOString(),
          sessionId,
          method: 'safariFetch'
        }));
        addLog('success', 'API响应已保存到本地存储');
      } catch (storageError) {
        addLog('warn', '无法保存API响应到本地存储', storageError);
      }
      return;
    }

    addLog('error', `Safari fetch失败 (${safariResult.responseTime}ms)`, {
      error: safariResult.error,
      status: safariResult.status,
      headers: safariResult.headers
    });

    // 2. 尝试httpClient作为备用
    addLog('info', '尝试httpClient作为备用方案');
    try {
      const startTime = Date.now();
      const responseData = await httpClient.postJson('/api/applications/guest', requestData, {
        headers: {
          'X-Session-ID': sessionId,
        }
      });
      
      const responseTime = Date.now() - startTime;
      addLog('success', `httpClient调用成功 (${responseTime}ms)`, responseData);
      
      // 保存到本地存储
      try {
        safeStorage.setItem('last_api_response', JSON.stringify({
          data: responseData,
          timestamp: new Date().toISOString(),
          sessionId,
          method: 'httpClient'
        }));
        addLog('success', 'API响应已保存到本地存储');
      } catch (storageError) {
        addLog('warn', '无法保存API响应到本地存储', storageError);
      }
      return;
      
    } catch (apiError: any) {
      addLog('error', 'httpClient也失败了', {
        error: apiError.message || apiError,
        status: apiError.status,
        statusText: apiError.statusText,
        name: apiError.name
      });
    }

    // 3. 最后尝试原生fetch
    addLog('info', '尝试原生fetch作为最后备用方案');
    try {
      const apiUrl = getApiUrl('/api/applications/guest');
      const startTime = Date.now();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify(requestData),
        mode: 'cors',
        credentials: 'omit'
      });

      const responseTime = Date.now() - startTime;
      addLog('info', `原生fetch响应 (${responseTime}ms)`, { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        addLog('success', '原生fetch调用成功', data);
        
        // 保存到本地存储
        try {
          safeStorage.setItem('last_api_response', JSON.stringify({
            data,
            timestamp: new Date().toISOString(),
            sessionId,
            method: 'nativeFetch'
          }));
          addLog('success', 'API响应已保存到本地存储');
        } catch (storageError) {
          addLog('warn', '无法保存API响应到本地存储', storageError);
        }
      } else {
        const errorText = await response.text();
        addLog('error', '原生fetch调用失败', { 
          status: response.status, 
          statusText: response.statusText,
          errorText,
          responseTime
        });
      }
    } catch (error: any) {
      addLog('error', '所有API调用方法都失败了', {
        message: error.message || error,
        name: error.name,
        type: typeof error
      });
    }
  };

  // 新增：网络连接测试
  const testNetworkConnectivity = async () => {
    addLog('info', '开始网络连接测试');
    
    try {
      const results = await testNetworkConnectivity();
      
      addLog('info', '网络连接测试结果', {
        backend: results.backend ? '✅ 成功' : '❌ 失败',
        google: results.google ? '✅ 成功' : '❌ 失败',
        httpbin: results.httpbin ? '✅ 成功' : '❌ 失败'
      });
      
      // 详细结果
      Object.entries(results.details).forEach(([name, detail]: [string, any]) => {
        if (detail.success) {
          addLog('success', `${name} 连接成功`, {
            status: detail.status,
            responseTime: `${detail.responseTime}ms`
          });
        } else {
          addLog('error', `${name} 连接失败`, {
            error: detail.error
          });
        }
      });
      
    } catch (error: any) {
      addLog('error', '网络连接测试异常', {
        message: error.message,
        name: error.name
      });
    }
  };

  // 新增：CORS预检测试
  const testCORSPreflight = async () => {
    addLog('info', '测试CORS预检请求');
    
    try {
      const result = await testCORSPreflight();
      
      if (result.success) {
        addLog('success', 'CORS预检成功', result.details);
      } else {
        addLog('error', 'CORS预检失败', result.details);
      }
      
    } catch (error: any) {
      addLog('error', 'CORS预检测试异常', {
        message: error.message,
        name: error.name
      });
    }
  };

  const testFullWorkflow = async () => {
    addLog('info', '开始完整工作流测试');
    
    if (!testData.name || !testData.phone) {
      addLog('warn', '请先填写姓名和手机号');
      return;
    }

    // 1. 本地存储测试
    testFormDataStorage();
    
    // 等待一秒
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. 服务器API测试
    await testServerAPI();
    
    addLog('info', '完整工作流测试完成');
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warn': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">存储调试测试页面</h1>
        <p className="text-gray-600">专门用于调试Safari和内置浏览器的存储问题</p>
      </div>

      {/* 测试表单 */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">测试数据输入</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              value={testData.name}
              onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
            <input
              type="tel"
              value={testData.phone}
              onChange={(e) => setTestData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入手机号"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入邮箱"
            />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">会话ID: <code className="bg-gray-200 px-2 py-1 rounded">{sessionId}</code></p>
        </div>
      </div>

      {/* 测试按钮 */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">测试操作</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testNativeStorage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            测试原生存储
          </button>
          <button
            onClick={testSafeStorage}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            测试SafeStorage
          </button>
          <button
            onClick={testFormDataStorage}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            测试表单存储
          </button>
          <button
            onClick={testServerAPI}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            测试服务器API
          </button>
          <button
            onClick={testFullWorkflow}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            完整流程测试
          </button>
          <button
            onClick={testNetworkConnectivity}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
          >
            网络连接测试
          </button>
          <button
            onClick={testCORSPreflight}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
          >
            CORS预检测试
          </button>
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            清空日志
          </button>
        </div>
      </div>

      {/* 日志显示 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">实时日志 ({logs.length}条)</h2>
        <div className="bg-gray-900 text-white p-4 rounded-lg max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-400">暂无日志...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`mb-2 p-2 rounded ${getLogColor(log.level)} text-gray-900`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">{getLogIcon(log.level)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-mono text-xs text-gray-500">{log.timestamp}</span>
                      <span className="font-medium">[{log.level.toUpperCase()}]</span>
                    </div>
                    <div className="mt-1">{log.message}</div>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                          查看详细数据
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="p-6 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">使用说明</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>首先填写测试数据（姓名和手机号必填）</li>
          <li>点击"测试原生存储"检查浏览器原生localStorage/sessionStorage是否可用</li>
          <li>点击"测试SafeStorage"检查我们的存储包装器是否正常工作</li>
          <li>点击"测试表单存储"验证表单数据能否正确存储和读取</li>
          <li>点击"测试服务器API"检查与后端的通信是否正常</li>
          <li>点击"完整流程测试"模拟完整的用户数据存储流程</li>
          <li>所有操作的详细日志都会显示在下方，包括错误信息和数据内容</li>
        </ol>
      </div>
    </div>
  );
};

export default StorageDebugTest;