import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  step: number;
  max_step: number;
  status: string;
  amount: number;
  created_at: number;
  updated_at: number;
}

const UserCenter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchApplications();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'draft': '草稿',
      'submitted': '已提交',
      'under_review': '审核中',
      'approved': '已批准',
      'rejected': '已拒绝'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-trust-light via-white to-trust-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-light via-white to-trust-light">
      <div className="container mx-auto px-4 py-8">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-trust-dark mb-2">
                欢迎，{user?.firstName || user?.email}
              </h1>
              <p className="text-trust-muted">
                管理您的贷款申请和账户信息
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-trust-muted hover:text-trust-dark transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 申请列表 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-trust-dark">我的贷款申请</h2>
            <button
              onClick={() => navigate('/loan')}
              className="bg-trust-primary text-white px-4 py-2 rounded-lg hover:bg-trust-primary/90 transition-colors"
            >
              新建申请
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-trust-light">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h6v4H7V5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-trust-dark mb-2">暂无申请记录</h3>
              <p className="text-trust-muted mb-4">您还没有提交任何贷款申请</p>
              <button
                onClick={() => navigate('/loan')}
                className="bg-trust-primary text-white px-6 py-2 rounded-lg hover:bg-trust-primary/90 transition-colors"
              >
                立即申请
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-trust-dark">
                        申请ID: {app.id.slice(0, 8)}...
                      </h3>
                      <p className="text-trust-muted text-sm">
                        申请金额: ¥{app.amount?.toLocaleString() || '-'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusText(app.status)}
                    </span>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-trust-muted mb-2">
                      <span>申请进度</span>
                      <span>{app.step} / {app.max_step}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-trust-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(app.step / app.max_step) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-trust-muted">
                      创建时间: {new Date(app.created_at * 1000).toLocaleDateString()}
                    </span>
                    <button className="text-trust-primary hover:text-trust-primary/80 font-medium">
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 快捷操作 */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-trust-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-trust-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-trust-dark mb-2">申请贷款</h3>
            <p className="text-trust-muted text-sm mb-4">快速提交新的贷款申请</p>
            <button
              onClick={() => navigate('/loan')}
              className="text-trust-primary hover:text-trust-primary/80 font-medium"
            >
              立即申请 →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-trust-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-trust-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-trust-dark mb-2">个人资料</h3>
            <p className="text-trust-muted text-sm mb-4">更新您的个人信息</p>
            <button className="text-trust-primary hover:text-trust-primary/80 font-medium">
              编辑资料 →
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-trust-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-trust-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-trust-dark mb-2">帮助中心</h3>
            <p className="text-trust-muted text-sm mb-4">获取帮助和支持</p>
            <button className="text-trust-primary hover:text-trust-primary/80 font-medium">
              联系客服 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCenter; 