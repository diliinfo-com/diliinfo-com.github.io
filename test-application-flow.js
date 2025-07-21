// 测试申请流程的脚本
const API_BASE = 'https://diliinfo-backend-prod.0768keyiran.workers.dev';

async function testApplicationFlow() {
  try {
    console.log('=== 测试申请流程 ===');
    
    // 1. 创建访客申请
    console.log('\n1. 创建访客申请...');
    const sessionId = 'test-session-' + Date.now();
    const createResponse = await fetch(`${API_BASE}/api/applications/guest`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      }
    });
    
    const createResult = await createResponse.json();
    console.log('创建结果:', createResult);
    
    if (!createResult.success) {
      throw new Error('创建申请失败');
    }
    
    const applicationId = createResult.applicationId;
    console.log('申请ID:', applicationId);
    
    // 2. 测试第2步：身份信息
    console.log('\n2. 测试第2步：身份信息...');
    const step2Response = await fetch(`${API_BASE}/api/applications/${applicationId}/step`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 2,
        data: { idNumber: '123456789012345678', realName: '测试用户' },
        phone: '+52123456789'
      })
    });
    
    const step2Result = await step2Response.json();
    console.log('第2步结果:', step2Result);
    
    // 3. 测试第4步：联系人信息
    console.log('\n3. 测试第4步：联系人信息...');
    const step4Response = await fetch(`${API_BASE}/api/applications/${applicationId}/step`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 4,
        data: { 
          contact1Name: '联系人1', 
          contact1Phone: '+52111111111',
          contact2Name: '联系人2', 
          contact2Phone: '+52222222222'
        },
        phone: '+52123456789'
      })
    });
    
    const step4Result = await step4Response.json();
    console.log('第4步结果:', step4Result);
    
    // 4. 测试第7步：银行卡信息
    console.log('\n4. 测试第7步：银行卡信息...');
    const step7Response = await fetch(`${API_BASE}/api/applications/${applicationId}/step`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 7,
        data: { bankCardNumber: '1234567890123456' },
        phone: '+52123456789'
      })
    });
    
    const step7Result = await step7Response.json();
    console.log('第7步结果:', step7Result);
    
    // 5. 获取管理员token并查看申请详情
    console.log('\n5. 获取管理员token...');
    const loginResponse = await fetch(`${API_BASE}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginResult = await loginResponse.json();
    console.log('登录结果:', loginResult.success ? '成功' : '失败');
    
    if (!loginResult.success) {
      throw new Error('管理员登录失败');
    }
    
    const token = loginResult.token;
    
    // 6. 查看申请详情
    console.log('\n6. 查看申请详情...');
    const detailResponse = await fetch(`${API_BASE}/api/admin/applications/${applicationId}/steps`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const detailResult = await detailResponse.json();
    console.log('申请详情:', JSON.stringify(detailResult, null, 2));
    
    // 7. 查看申请列表
    console.log('\n7. 查看申请列表...');
    const listResponse = await fetch(`${API_BASE}/api/admin/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const listResult = await listResponse.json();
    const testApp = listResult.applications.find(app => app.id === applicationId);
    console.log('测试申请在列表中的信息:', JSON.stringify(testApp, null, 2));
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testApplicationFlow();