# 贷款申请步骤修复指南

## 概述
以下是第8-12步需要进行的修复，确保每个步骤都正确调用 `updateApplicationStep` 来保存数据到后端。

## 修复内容

### 第8步：提交贷款申请 ✅ 已正确
**状态**: 已正确实现
- `handleSubmit` 函数已正确调用 `updateApplicationStep(8, stepData)`
- 无需修改

### 第9步：审批中 ✅ 已正确
**状态**: 已正确实现
- `useEffect` 中已正确调用 `updateApplicationStep(9, stepData)`
- 无需修改

### 第10步：审批通过 ✅ 已正确
**状态**: 已正确实现
- 按钮点击事件已正确调用 `updateApplicationStep(10, stepData)`
- 无需修改

### 第11步：提现设置 ❌ 需要修复
**问题**: `handleNext` 函数没有调用 `updateApplicationStep`

**当前代码**:
```typescript
const handleNext = () => {
  const amount = parseFloat(withdrawalAmount.toString());
  if (!amount || amount <= 0 || amount > maxAmount) {
    alert(t('errors.invalid'));
    return;
  }
  onUpdate({ withdrawalAmount: amount, installmentPeriod });
  onNext();
};
```

**修复后代码**:
```typescript
const handleNext = () => {
  const amount = parseFloat(withdrawalAmount.toString());
  if (!amount || amount <= 0 || amount > maxAmount) {
    alert(t('errors.invalid'));
    return;
  }
  const stepData = { withdrawalAmount: amount, installmentPeriod };
  onUpdate(stepData);
  if (updateApplicationStep) {
    updateApplicationStep(11, stepData);
  }
  onNext();
};
```

### 第12步：提现完成 ❌ 需要修复
**问题**: 
1. 函数签名缺少 `updateApplicationStep` 参数
2. 需要在组件加载时记录完成状态

**当前代码**:
```typescript
const Step12Complete: React.FC<StepProps> = ({ data }) => {
```

**修复后代码**:
```typescript
const Step12Complete: React.FC<StepProps> = ({ data, updateApplicationStep }) => {
  const { t } = useTranslation();
  
  // 在组件加载时记录完成状态
  useEffect(() => {
    const stepData = { 
      completed: true, 
      completedAt: Date.now(),
      withdrawalAmount: data.withdrawalAmount,
      installmentPeriod: data.installmentPeriod
    };
    if (updateApplicationStep) {
      updateApplicationStep(12, stepData);
    }
  }, [updateApplicationStep, data.withdrawalAmount, data.installmentPeriod]);

  return (
    // ... 其余代码保持不变
  );
};
```

## 代码格式修复

你提供的代码中还有一些格式问题需要修复：

### 按钮标签格式问题
**问题**: 所有按钮的 `onClick` 属性和 `className` 属性连在一起了

**示例错误**:
```typescript
<buttononClick={onBack}className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
```

**修复后**:
```typescript
<button
  onClick={onBack}
  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
>
```

### 输入框格式问题
**问题**: `input` 标签的属性连在一起了

**示例错误**:
```typescript
<inputtype="number"value={withdrawalAmount}onChange={(e) => setWithdrawalAmount(e.target.value)}
```

**修复后**:
```typescript
<input
  type="number"
  value={withdrawalAmount}
  onChange={(e) => setWithdrawalAmount(e.target.value)}
```

## 完整修复步骤

### 步骤1: 修复第11步的 handleNext 函数
在 `apps/web/src/components/LoanWizard.tsx` 中找到第11步的 `handleNext` 函数，按照上面的修复代码进行替换。

### 步骤2: 修复第12步的函数签名和逻辑
1. 在函数签名中添加 `updateApplicationStep` 参数
2. 添加 `useEffect` 来记录完成状态
3. 在文件顶部添加 `useEffect` 的导入（如果还没有）

### 步骤3: 修复所有按钮和输入框的格式
使用查找替换功能：
- 查找: `<buttononClick=`
- 替换: `<button\n  onClick=`
- 查找: `<inputtype=`
- 替换: `<input\n  type=`

### 步骤4: 重新构建和测试
```bash
cd apps/web
npm run build
```

## 验证修复效果

修复完成后，进行完整的申请流程测试：

1. **完成整个12步申请流程**
2. **在管理后台查看申请详情**，应该能看到：
   - 进度显示为 12/12
   - 所有步骤的详细记录
   - 用户填写的完整信息（姓名、身份证、联系人、银行卡、提现金额等）

## 预期结果

修复后，数据库中应该包含：
- `loan_applications` 表中的完整申请信息
- `application_steps` 表中的12条步骤记录
- 管理后台正确显示申请进度和详细信息

## 注意事项

1. **确保所有步骤都有 `updateApplicationStep` 参数**
2. **每个有用户输入的步骤都要调用 `updateApplicationStep`**
3. **步骤数据要包含该步骤的关键信息**
4. **格式化代码确保可读性**
5. **测试完整流程确保数据正确保存**