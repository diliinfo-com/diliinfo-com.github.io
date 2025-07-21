// 调试用户注册流程的脚本
const API_BASE = 'https://diliinfo-backend-prod.0768keyiran.workers.dev';

async function debugRegistrationFlow() {
  try {
    console.log('=== 调试用户注册申请流程 ===');
    
    // 1. 创建访客申请（模拟前端初始化）
    console.log('\n1. 创建访客申请...');
    const sessionId = 'debug-session-' + Date.now();
    const createResponse = await fetch(`${API_BASE}/api/applications/guest`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      }
    });
    
    const createResult = await createResponse.json();
    console.log('访客申请创建结果:', createResult);
    
    if (!createResult.success) {
      throw new Error('创建访客申请失败');
    }
    
    const guestApplicationId = createResult.applicationId;
    console.log('访客申请ID:', guestApplicationId);
    
    // 2. 用户注册（关联到访客申请）
    console.log('\n2. 用户注册...');
    const phone = '+52' + Date.now().toString().slice(-9); // 生成唯一手机号
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: phone,
        password: 'test123456',
        applicationId: guestApplicationId
      })
    });
    
    const registerResult = await registerResponse.json();
    console.log('用户注册结果:', registerResult);
    
    if (!registerResult.success) {
      throw new Error('用户注册失败: ' + registerResult.error);
    }
    
    const userApplicationId = registerResult.applicationId;
    console.log('注册后申请ID:', userApplicationId);
    console.log('申请ID是否变化:', guestApplicationId !== userApplicationId);
    
    // 3. 检查申请状态变化
    console.log('\n3. 检查申请状态变化...');
    
    // 获取管理员token
    const loginResponse = await fetch(`${API_BASE}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginResult = await loginResponse.json();
    const token = loginResult.token;
    
    // 检查原访客申请
    console.log('\n3a. 检查原访客申请状态...');
    const guestDetailResponse = await fetch(`${API_BASE}/api/admin/applications/${guestApplicationId}/steps`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const guestDetailResult = await guestDetailResponse.json();
    console.log('原访客申请详情:', JSON.stringify(guestDetailResult, null, 2));
    
    // 检查用户申请（如果ID不同）
    if (userApplicationId && userApplicationId !== guestApplicationId) {
      console.log('\n3b. 检查用户申请状态...');
      const userDetailResponse = await fetch(`${API_BASE}/api/admin/applications/${userApplicationId}/steps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const userDetailResult = await userDetailResponse.json();
      console.log('用户申请详情:', JSON.stringify(userDetailResult, null, 2));
    }
    
    // 4. 测试后续步骤（使用用户申请ID）
    console.log('\n4. 测试第2步：身份信息...');
    const targetApplicationId = userApplicationId || guestApplicationId;
    console.log('使用申请ID:', targetApplicationId);
    
    const step2Response = await fetch(`${API_BASE}/api/applications/${targetApplicationId}/step`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 2,
        data: { idNumber: '987654321098765432', realName: '注册用户测试' },
        phone: phone
      })
    });
    
    const step2Result = await step2Response.json();
    console.log('第2步结果:', step2Result);
    
    // 5. 再次检查申请详情
    console.log('\n5. 检查最终申请详情...');
    const finalDetailResponse = await fetch(`${API_BASE}/api/admin/applications/${targetApplicationId}/steps`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const finalDetailResult = await finalDetailResponse.json();
    console.log('最终申请详情:', JSON.stringify(finalDetailResult, null, 2));
    
    console.log('\n=== 调试完成 ===');
    
  } catch (error) {
    console.error('调试失败:', error);
  }
}

// 运行调试
debugRegistrationFlow();