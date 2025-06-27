import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Stats {
  summary: {
    totalUsers: number;
    totalApplications: number;
    totalPageViews: number;
  };
  applicationsByStatus: Array<{ status: string; count: number }>;
  dailyRegistrations: Array<{ date: string; count: number }>;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  created_at: number;
  application_count: number;
}

interface Application {
  id: string;
  user_id: string;
  step: number;
  max_step: number;
  status: string;
  amount: number;
  email: string;
  first_name: string;
  last_name: string;
  upload_count: number;
  created_at: number;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'applications'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    const token = localStorage.getItem('token');
    
    if (!adminData || !token) {
      navigate('/login');
      return;
    }

    setAdmin(JSON.parse(adminData));
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      // 并行获取所有数据
      const [statsRes, usersRes, appsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/applications', { headers })
      ]);

      const [statsData, usersData, appsData] = await Promise.all([
        statsRes.json(),
        usersRes.json(),
        appsRes.json()
      ]);

      setStats(statsData);
      setUsers(usersData.users || []);
      setApplications(appsData.applications || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* 管理员信息卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                管理后台
              </h1>
              <p className="text-slate-600">
                欢迎，{admin?.username} | 角色: {admin?.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>

        {/* 标签栏 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex space-x-8 border-b">
            {[
              { key: 'stats', label: '数据统计', icon: '📊' },
              { key: 'users', label: '用户管理', icon: '👥' },
              { key: 'applications', label: '申请管理', icon: '📋' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 数据统计 */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8">
            {/* 概览卡片 */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-slate-600 text-sm">总用户数</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.summary.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-slate-600 text-sm">总申请数</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.summary.totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-slate-600 text-sm">页面访问量</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.summary.totalPageViews}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 申请状态分布 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-trust-dark mb-4">申请状态分布</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.applicationsByStatus.map((item) => (
                  <div key={item.status} className="text-center">
                    <div className={`px-3 py-2 rounded-lg ${getStatusColor(item.status)}`}>
                      <p className="font-semibold">{item.count}</p>
                    </div>
                    <p className="text-sm text-trust-muted mt-2">{getStatusText(item.status)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 每日注册趋势 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-trust-dark mb-4">近7日用户注册</h3>
              <div className="space-y-2">
                {stats.dailyRegistrations.map((item) => (
                  <div key={item.date} className="flex justify-between items-center">
                    <span className="text-trust-muted">{item.date}</span>
                    <span className="font-semibold text-trust-dark">{item.count} 人</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 用户管理 */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-trust-dark">用户列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电话</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">注册时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{user.id.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.application_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.created_at * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 申请管理 */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-trust-dark">贷款申请列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传材料</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">
                            {app.first_name} {app.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ¥{app.amount?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-trust-primary h-2 rounded-full"
                              style={{ width: `${(app.step / app.max_step) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{app.step}/{app.max_step}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.upload_count} 个文件
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(app.created_at * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-trust-primary hover:text-trust-primary/80">
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 