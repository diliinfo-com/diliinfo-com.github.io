import React, { useEffect, useState } from 'react';
import { checkCompatibility } from '../utils/enhancedBrowserCompat';

interface CompatibilityStatus {
  isReady: boolean;
  features: Record<string, boolean>;
  environment: Record<string, boolean>;
  warnings: string[];
}

const CompatibilityChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<CompatibilityStatus>({
    isReady: false,
    features: {},
    environment: {},
    warnings: []
  });

  useEffect(() => {
    const checkAndSetStatus = () => {
      try {
        const { features, environment } = checkCompatibility();
        const warnings: string[] = [];

        // 检查关键功能
        if (!features.fetch) warnings.push('Fetch API不可用');
        if (!features.crypto) warnings.push('Crypto API不可用');
        if (!features.localStorage) warnings.push('LocalStorage不可用');
        if (!features.sessionStorage) warnings.push('SessionStorage不可用');

        // 特殊环境警告
        if (environment.isInApp) {
          console.log('🔍 检测到内置浏览器环境，已启用兼容性增强');
        }

        setStatus({
          isReady: true,
          features,
          environment,
          warnings
        });

        // 输出兼容性报告
        console.log('🔧 兼容性检查完成:', {
          features,
          environment,
          warnings: warnings.length > 0 ? warnings : '无警告'
        });

      } catch (error) {
        console.error('❌ 兼容性检查失败:', error);
        setStatus(prev => ({
          ...prev,
          isReady: true,
          warnings: [...prev.warnings, '兼容性检查失败']
        }));
      }
    };

    // 延迟检查确保polyfills完全加载
    const timer = setTimeout(checkAndSetStatus, 100);
    return () => clearTimeout(timer);
  }, []);

  // 显示加载状态
  if (!status.isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化兼容性层...</p>
        </div>
      </div>
    );
  }

  // 显示严重兼容性问题
  if (status.warnings.length > 2) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-800 mb-4">浏览器兼容性问题</h2>
          <div className="text-left text-sm text-red-700 mb-4">
            <p className="mb-2">检测到以下问题:</p>
            <ul className="list-disc list-inside space-y-1">
              {status.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            建议使用Chrome、Edge或Firefox最新版本访问
          </p>
        </div>
      </div>
    );
  }

  // 兼容性正常，渲染子组件
  return <>{children}</>;
};

export default CompatibilityChecker;