-- 为没有申请记录的用户创建申请记录
-- 这个脚本需要在 Cloudflare D1 数据库中执行

-- 首先，找出没有申请记录的用户
-- 然后为他们创建申请记录

-- 插入缺失的申请记录
INSERT INTO loan_applications (id, user_id, phone, step, is_guest, started_at, created_at, updated_at)
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))) as id,
    u.id as user_id,
    u.phone,
    1 as step,
    FALSE as is_guest,
    u.created_at as started_at,
    u.created_at as created_at,
    u.created_at as updated_at
FROM users u
LEFT JOIN loan_applications la ON u.id = la.user_id
WHERE la.user_id IS NULL;

-- 为这些新创建的申请记录添加注册步骤
INSERT INTO application_steps (id, application_id, step_number, step_name, step_data, ip_address, completed_at)
SELECT 
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))) as id,
    la.id as application_id,
    1 as step_number,
    'user_registration' as step_name,
    '{"phone":"' || u.phone || '","registered":true,"source":"data_fix"}' as step_data,
    '' as ip_address,
    u.created_at as completed_at
FROM users u
JOIN loan_applications la ON u.id = la.user_id
LEFT JOIN application_steps aps ON la.id = aps.application_id
WHERE aps.application_id IS NULL;