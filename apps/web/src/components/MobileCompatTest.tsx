import React, { useEffect, useState } from 'react';
import { 
  browserDetection, 
  safeSessionStorage
} from '../utils/browserCompat';
import { getApiUrl } from '../config/api';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const MobileCompatTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const runCompatibilityTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // 1. 浏览器检测测试
    try {
      const browserInfo = {
        isSafari: browserDetection.isSafari,
        isIOS: browserDetection.isIOS,
        isAndroid: browserDetection.isAndroid,
        isWeChat: browserDetection.isWeChat,
        safariVersion: browserDetection.getSafariVersion(),
        iosVersion: browserDetection.getIOSVersion(),
        userAgent: navigator.userAgent
      };
      addResult({
        name: '浏览器检测',
        status: 'success',
        message: `检测到: ${browserInfo.isSafari ? 'Safari' : browserInfo.isWeChat ? 'WeChat' : '其他浏览器'}`,
        details: browserInfo
      });
    } catch (error) {
      addResult({
        name: '浏览器检测',
        status: 'error',
        message: '浏览器检测失败',
        details: error
      });
    }

    // 2. 存储可用性测试
    try {
      let sessionStorageAvailable = false;
      let localStorageAvailable = false;
      
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        sessionStorageAvailable = true;
      } catch (e) {}
      
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        localStorageAvailable = true;
      } catch (e) {}
      
      const storageInfo = { sessionStorage: sessionStorageAvailable, localStorage: localStorageAvailable };
      addResult({
        name: '存储可用性',
        status: storageInfo.sessionStorage && storageInfo.localStorage ? 'success' : 'warning',
        message: `Session: ${storageInfo.sessionStorage ? '✅' : '❌'}, Local: ${storageInfo.localStorage ? '✅' : '❌'}`,
        details: storageInfo
      });
    } catch (error) {
      addResult({
        name: '存储可用性',
        status: 'error',
        message: '存储检测失败',
        details: error
      });
    }

    // 3. UUID生成测试
    try {
      const generateUUID = () => {
        if (window.crypto?.randomUUID) {
          return window.crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      const isValid = uuid1 !== uuid2 && uuid1.length === 36;
      addResult({
        name: 'UUID生成',
        status: isValid ? 'success' : 'error',
        message: isValid ? '✅ UUID生成正常' : '❌ UUID生成异常',
        details: { uuid1, uuid2 }
      });
    } catch (error) {
      addResult({
        name: 'UUID生成',
        status: 'error',
        message: 'UUID生成失败',
        details: error
      });
    }

    // 4. 存储读写测试
    try {
      const testKey = 'mobile_compat_test';
      const testValue = `test_${Date.now()}`;
      
      safeSessionStorage.setItem(testKey, testValue);
      const retrieved = safeSessionStorage.getItem(testKey);
      safeSessionStorage.removeItem(testKey);
      
      const success = retrieved === testValue;
      addResult({
        name: '存储读写',
        status: success ? 'success' : 'warning',
        message: success ? '✅ 存储读写正常' : '⚠️ 使用内存存储',
        details: { testValue, retrieved, success }
      });
    } catch (error) {
      addResult({
        name: '存储读写',
        status: 'error',
        message: '存储读写失败',
        details: error
      });
    }

    // 5. 网络请求测试
    try {
      const testUrl = getApiUrl('/api/health');
      console.log('🧪 Testing network request to:', testUrl);
      
      const startTime = Date.now();
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      const endTime = Date.now();
      
      const responseText = await response.text();
      const success = response.ok;
      
      addResult({
        name: '网络请求',
        status: success ? 'success' : 'error',
        message: success ? `✅ 请求成功 (${endTime - startTime}ms)` : `❌ 请求失败 ${response.status}`,
        details: { 
          status: response.status, 
          statusText: response.statusText,
          responseText: responseText.substring(0, 200),
          duration: endTime - startTime
        }
      });
    } catch (error) {
      addResult({
        name: '网络请求',
        status: 'error',
        message: '网络请求失败',
        details: error
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    // 自动运行测试
    runCompatibilityTests();
  }, []);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">移动端兼容性测试</h2>
        <p className="text-gray-600">检测当前浏览器的兼容性状态</p>
      </div>

      <div className="mb-4">
        <button
          onClick={runCompatibilityTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? '测试中...' : '重新测试'}
        </button>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">
                {getStatusIcon(result.status)} {result.name}
              </h3>
              <span className={`font-medium ${getStatusColor(result.status)}`}>
                {result.status.toUpperCase()}
              </span>
            </div>
            
            <p className={`mb-2 ${getStatusColor(result.status)}`}>
              {result.message}
            </p>
            
            {result.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  查看详细信息
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {isRunning && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">正在运行兼容性测试...</p>
        </div>
      )}
    </div>
  );
};

export default MobileCompatTest;