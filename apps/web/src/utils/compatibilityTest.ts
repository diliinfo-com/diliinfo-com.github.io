// 浏览器兼容性测试工具
import { httpClient } from './httpClient';
import { isSafari, isWechat, isMobile } from '../config/api';
import { checkBrowserFeatures } from './polyfills';

export interface CompatibilityTestResult {
  browser: string;
  features: { [key: string]: boolean };
  apiTest: {
    success: boolean;
    error?: string;
    responseTime?: number;
  };
  recommendations: string[];
}

export class CompatibilityTester {
  private static instance: CompatibilityTester;

  private constructor() {}

  public static getInstance(): CompatibilityTester {
    if (!CompatibilityTester.instance) {
      CompatibilityTester.instance = new CompatibilityTester();
    }
    return CompatibilityTester.instance;
  }

  // 检测浏览器类型
  private detectBrowser(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('micromessenger')) {
      return 'WeChat Browser';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'Safari';
    } else if (userAgent.includes('chrome')) {
      return 'Chrome';
    } else if (userAgent.includes('firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('edge')) {
      return 'Edge';
    } else {
      return 'Unknown Browser';
    }
  }

  // 测试API连接
  private async testApiConnection(): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const startTime = Date.now();
    
    try {
      const response = await httpClient.get('/api/health');
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return { success: true, responseTime };
      } else {
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime 
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime 
      };
    }
  }

  // 生成建议
  private generateRecommendations(browser: string, features: { [key: string]: boolean }): string[] {
    const recommendations: string[] = [];

    if (browser === 'Safari') {
      recommendations.push('Safari用户：如遇到网络问题，请检查内容拦截器设置');
      if (!features.randomUUID) {
        recommendations.push('您的Safari版本较旧，建议更新到最新版本');
      }
    }

    if (browser === 'WeChat Browser') {
      recommendations.push('微信浏览器用户：如遇到问题，建议在其他浏览器中打开');
      recommendations.push('确保微信已授予网络访问权限');
    }

    if (isMobile()) {
      recommendations.push('移动端用户：确保网络连接稳定');
      recommendations.push('如遇到加载缓慢，请尝试切换WiFi/移动数据');
    }

    if (!features.fetch) {
      recommendations.push('您的浏览器不支持现代网络API，建议更新浏览器');
    }

    if (!features.promise) {
      recommendations.push('您的浏览器不支持Promise，建议更新浏览器');
    }

    return recommendations;
  }

  // 运行完整的兼容性测试
  public async runCompatibilityTest(): Promise<CompatibilityTestResult> {
    const browser = this.detectBrowser();
    const features = checkBrowserFeatures();
    const apiTest = await this.testApiConnection();
    const recommendations = this.generateRecommendations(browser, features);

    return {
      browser,
      features,
      apiTest,
      recommendations
    };
  }

  // 显示测试结果
  public displayTestResults(result: CompatibilityTestResult): void {
    console.group('🔍 浏览器兼容性测试结果');
    
    console.log('📱 浏览器信息:', result.browser);
    console.log('🌐 用户代理:', navigator.userAgent);
    
    console.group('✨ 功能支持情况');
    Object.entries(result.features).forEach(([feature, supported]) => {
      console.log(`${supported ? '✅' : '❌'} ${feature}: ${supported ? '支持' : '不支持'}`);
    });
    console.groupEnd();
    
    console.group('🔗 API连接测试');
    if (result.apiTest.success) {
      console.log('✅ API连接成功');
      console.log(`⏱️ 响应时间: ${result.apiTest.responseTime}ms`);
    } else {
      console.log('❌ API连接失败');
      console.log('🚨 错误信息:', result.apiTest.error);
    }
    console.groupEnd();
    
    if (result.recommendations.length > 0) {
      console.group('💡 建议');
      result.recommendations.forEach(rec => {
        console.log('•', rec);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  // 自动运行测试（在开发模式下）
  public autoTest(): void {
    if (import.meta.env.DEV) {
      setTimeout(async () => {
        const result = await this.runCompatibilityTest();
        this.displayTestResults(result);
      }, 2000); // 延迟2秒执行，确保应用已初始化
    }
  }
}

// 导出单例实例
export const compatibilityTester = CompatibilityTester.getInstance();

// 便捷函数
export const runCompatibilityTest = async (): Promise<CompatibilityTestResult> => {
  return compatibilityTester.runCompatibilityTest();
};

export const displayCompatibilityResults = (result: CompatibilityTestResult): void => {
  compatibilityTester.displayTestResults(result);
};

// 在开发环境下自动运行测试
if (import.meta.env.DEV) {
  compatibilityTester.autoTest();
}