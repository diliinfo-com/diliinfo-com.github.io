import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

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
  phone?: string;
  session_id?: string;
  step: number;
  max_step: number;
  status: string;
  amount: number;
  email: string;
  first_name: string;
  last_name: string;
  real_name?: string;
  upload_count: number;
  completed_steps?: number;
  is_guest?: boolean;
  started_at?: number;
  created_at: number;
}

interface GuestApplication {
  id: string;
  phone?: string;
  session_id: string;
  step: number;
  status: string;
  started_at: number;
  created_at: number;
  updated_at: number;
  completed_steps: number;
  step_names: string;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'applications' | 'guests'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [guestApplications, setGuestApplications] = useState<GuestApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationSteps, setApplicationSteps] = useState<any[]>([]);
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
      // 获取基础数据
      console.log('Fetching admin data with token:', token?.substring(0, 20) + '...');
      
      const statsRes = await fetch(getApiUrl('/api/admin/stats'), { headers });
      const usersRes = await fetch(getApiUrl('/api/admin/users'), { headers });
      const appsRes = await fetch(getApiUrl('/api/admin/applications'), { headers });
      const guestsRes = await fetch(getApiUrl('/api/admin/applications/guests'), { headers });

      console.log('API responses status:', {
        stats: statsRes.status,
        users: usersRes.status,
        apps: appsRes.status,
        guests: guestsRes.status
      });

      if (!statsRes.ok || !usersRes.ok || !appsRes.ok || !guestsRes.ok) {
        throw new Error('One or more API requests failed');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const appsData = await appsRes.json();
      const guestsData = await guestsRes.json();

      console.log('Fetched data:', {
        stats: statsData,
        users: usersData.users?.length || 0,
        applications: appsData.applications?.length || 0,
        guests: guestsData.guestApplications?.length || 0
      });

      setStats(statsData);
      setUsers(usersData.users || []);
      setApplications(appsData.applications || []);
      setGuestApplications(guestsData.guestApplications || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      // 显示错误信息给用户
      alert('获取管理数据失败，请检查网络连接或重新登录');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationSteps = async (applicationId: string) => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      console.log('Fetching application steps for:', applicationId);
      console.log('Current selectedApplication before fetch:', selectedApplication);
      
      const response = await fetch(getApiUrl(`/api/admin/applications/${applicationId}/steps`), { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Application steps data:', data);
      console.log('Setting selectedApplication to:', data.application);
      
      // 先清空再设置，确保状态变化
      setSelectedApplication(null);
      setApplicationSteps([]);
      
      // 使用 setTimeout 确保状态更新
      setTimeout(() => {
        setSelectedApplication(data.application);
        setApplicationSteps(data.steps || []);
        console.log('selectedApplication set to:', data.application?.id);
      }, 10);
      
    } catch (error) {
      console.error('Failed to fetch application steps:', error);
      alert('获取申请详情失败，请重试');
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
              { key: 'applications', label: '申请管理', icon: '📋' },
              { key: 'guests', label: '访客申请', icon: '👤' }
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
              <p className="text-sm text-gray-600 mt-1">包含所有用户申请（含访客申请）</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">联系方式</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
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
                            {app.real_name || `${app.first_name || ''} ${app.last_name || ''}`.trim() || '未填写'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {app.id.slice(0, 8)}...
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {app.phone || app.email || '未填写'}
                        </div>
                        {app.is_guest && (
                          <div className="text-xs text-orange-600">
                            会话: {app.session_id?.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${app.amount?.toLocaleString() || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${app.is_guest ? 'bg-orange-500' : 'bg-blue-500'}`}
                              style={{ width: `${((app.completed_steps || 0) / 12) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">{app.completed_steps || 0}/12</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          app.is_guest 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {app.is_guest ? '访客' : '用户'}
                        </span>
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
                        <button 
                          onClick={() => fetchApplicationSteps(app.id)}
                          className="text-trust-primary hover:text-trust-primary/80"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                  {applications.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        暂无申请记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 访客申请管理 */}
        {activeTab === 'guests' && (
          <div className="space-y-6">
            {/* 访客申请列表 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-trust-dark">访客申请记录</h3>
                <p className="text-sm text-gray-600 mt-1">包含未注册用户的申请记录和进度</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">手机号</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前步骤</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完成步骤</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guestApplications.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {guest.id.slice(0, 8)}...
                          </div>
                          <div className="text-xs text-gray-500">
                            会话: {guest.session_id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.phone || '未填写'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${(guest.step / 12) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">{guest.step}/12</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.completed_steps} 步
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(guest.status)}`}>
                            {getStatusText(guest.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(guest.started_at * 1000).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => fetchApplicationSteps(guest.id)}
                            className="text-trust-primary hover:text-trust-primary/80"
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                    {guestApplications.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                          暂无访客申请记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 申请详情模态框 - 移到最外层，所有标签页都能使用 */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-trust-dark">申请详情</h3>
              <button 
                onClick={() => setSelectedApplication(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">基本信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">申请ID：</span>
                    <span className="font-mono">{selectedApplication.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">手机号：</span>
                    <span>{selectedApplication.phone || selectedApplication.user_phone || '未填写'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">是否注册：</span>
                    <span className={selectedApplication.is_guest ? 'text-orange-600' : 'text-green-600'}>
                      {selectedApplication.is_guest ? '访客' : '已注册'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">状态：</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusText(selectedApplication.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">申请金额：</span>
                    <span>${selectedApplication.amount?.toLocaleString() || '未填写'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">完成步骤：</span>
                    <span>{selectedApplication.completed_steps || 0}/12</span>
                  </div>
                </div>
              </div>

              {/* 详细申请信息 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">申请详细信息</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedApplication.real_name && (
                    <div>
                      <span className="text-gray-600">真实姓名：</span>
                      <span>{selectedApplication.real_name}</span>
                    </div>
                  )}
                  {selectedApplication.id_number && (
                    <div>
                      <span className="text-gray-600">身份证号：</span>
                      <span className="font-mono">{selectedApplication.id_number}</span>
                    </div>
                  )}
                  {selectedApplication.contact1_name && (
                    <div>
                      <span className="text-gray-600">联系人1：</span>
                      <span>{selectedApplication.contact1_name} - {selectedApplication.contact1_phone}</span>
                    </div>
                  )}
                  {selectedApplication.contact2_name && (
                    <div>
                      <span className="text-gray-600">联系人2：</span>
                      <span>{selectedApplication.contact2_name} - {selectedApplication.contact2_phone}</span>
                    </div>
                  )}
                  {selectedApplication.bank_card_number && (
                    <div>
                      <span className="text-gray-600">银行卡号：</span>
                      <span className="font-mono">{selectedApplication.bank_card_number}</span>
                    </div>
                  )}
                  {selectedApplication.withdrawal_amount && (
                    <div>
                      <span className="text-gray-600">提现金额：</span>
                      <span>${selectedApplication.withdrawal_amount?.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedApplication.installment_period && (
                    <div>
                      <span className="text-gray-600">分期期数：</span>
                      <span>{selectedApplication.installment_period}期</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">申请时间：</span>
                    <span>{new Date((selectedApplication.started_at || selectedApplication.created_at) * 1000).toLocaleString()}</span>
                  </div>
                  {selectedApplication.submitted_at && (
                    <div>
                      <span className="text-gray-600">提交时间：</span>
                      <span>{new Date(selectedApplication.submitted_at * 1000).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedApplication.approved_at && (
                    <div>
                      <span className="text-gray-600">审批时间：</span>
                      <span>{new Date(selectedApplication.approved_at * 1000).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 步骤记录 */}
              <div>
                <h4 className="font-semibold mb-3">申请步骤记录</h4>
                <div className="space-y-3">
                  {applicationSteps.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{step.step_number}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">{step.step_name}</h5>
                          <span className="text-sm text-gray-500">
                            {new Date(step.completed_at * 1000).toLocaleString()}
                          </span>
                        </div>
                        {step.step_data && (
                          <div className="mt-2 text-sm text-gray-600">
                            <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded">
                              {JSON.stringify(JSON.parse(step.step_data), null, 2)}
                            </pre>
                          </div>
                        )}
                        {step.ip_address && (
                          <div className="mt-1 text-xs text-gray-500">
                            IP: {step.ip_address}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {applicationSteps.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      暂无步骤记录
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 