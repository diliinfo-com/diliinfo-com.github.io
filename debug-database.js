// 调试数据库数据的脚本
const fetch = require('node-fetch');

async function debugDatabase() {
  try {
    // 获取管理员token
    const loginResponse = await fetch('https://diliinfo-backend-prod.0768keyiran.workers.dev/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult);
    
    if (!loginResult.token) {
      console.error('Failed to get admin token');
      return;
    }
    
    const token = loginResult.token;
    
    // 获取申请列表
    const appsResponse = await fetch('https://diliinfo-backend-prod.0768keyiran.workers.dev/api/admin/applications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const appsResult = await appsResponse.json();
    console.log('Applications:', JSON.stringify(appsResult, null, 2));
    
    // 如果有申请，获取第一个申请的详情
    if (appsResult.applications && appsResult.applications.length > 0) {
      const firstApp = appsResult.applications[0];
      console.log('\n=== First Application Details ===');
      console.log('ID:', firstApp.id);
      console.log('Step:', firstApp.step);
      console.log('Completed Steps:', firstApp.completed_steps);
      console.log('Phone:', firstApp.phone);
      console.log('Real Name:', firstApp.real_name);
      
      // 获取步骤详情
      const stepsResponse = await fetch(`https://diliinfo-backend-prod.0768keyiran.workers.dev/api/admin/applications/${firstApp.id}/steps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const stepsResult = await stepsResponse.json();
      console.log('\n=== Application Steps ===');
      console.log(JSON.stringify(stepsResult, null, 2));
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugDatabase();