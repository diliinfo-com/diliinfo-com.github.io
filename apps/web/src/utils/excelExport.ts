// Excel导出工具函数
export interface ExportData {
  id: string;
  user_id?: string;
  phone?: string;
  real_name?: string;
  id_number?: string;
  contact1_name?: string;
  contact1_phone?: string;
  contact2_name?: string;
  contact2_phone?: string;
  bank_card_number?: string;
  withdrawal_amount?: number;
  installment_period?: number;
  current_step: number;
  status: string;
  created_at: number;
  updated_at: number;
}

export const exportToExcel = (data: ExportData[], filename: string = 'loan_applications') => {
  // 创建CSV内容
  const headers = [
    '申请ID',
    '用户ID', 
    '手机号',
    '真实姓名',
    '身份证号',
    '联系人1姓名',
    '联系人1电话',
    '联系人2姓名', 
    '联系人2电话',
    '银行卡号',
    '提现金额',
    '分期期数',
    '当前步骤',
    '状态',
    '创建时间',
    '更新时间'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.id,
      row.user_id || '',
      row.phone || '',
      row.real_name || '',
      row.id_number || '',
      row.contact1_name || '',
      row.contact1_phone || '',
      row.contact2_name || '',
      row.contact2_phone || '',
      row.bank_card_number || '',
      row.withdrawal_amount || '',
      row.installment_period || '',
      row.current_step,
      row.status,
      new Date(row.created_at * 1000).toLocaleString('zh-CN'),
      new Date(row.updated_at * 1000).toLocaleString('zh-CN')
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // 添加BOM以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: formatDateForInput(startDate),
    endDate: formatDateForInput(endDate)
  };
};