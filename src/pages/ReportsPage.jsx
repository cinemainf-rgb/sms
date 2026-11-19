import { useState, useEffect } from 'react';
import { db } from '../db/database.js';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    cashBalance: 0,
    debts: 0
  });

  useEffect(() => {
    const calculateStats = async () => {
      // 1. حساب إجمالي المبيعات والأرباح
      const sales = await db.sales.toArray();
      const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
      
      let totalProfit = 0;
      sales.forEach(sale => {
        sale.items.forEach(item => {
          totalProfit += (item.sellPrice - item.buyPrice) * item.qty;
        });
      });

      // 2. حساب النقدية (الدرج)
      const wallets = await db.wallets.toArray();
      const cashWallet = wallets.find(w => w.type === 'cash');
      const cashBalance = cashWallet ? cashWallet.balance : 0;

      setStats({
        totalSales,
        totalProfit,
        cashBalance,
        debts: 0 // ممكن نطورها بعدين
      });
    };

    calculateStats();
  }, []);

  return (
    <div className="p-2 space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-[#0b2b40]">التقارير</h2>

      {/* كارت النقدية */}
      <div className="card border-r-4 border-[#0d9488]">
        <p className="text-sm text-gray-500 font-bold">النقدية (الدرج)</p>
        <p className="text-3xl font-bold text-[#0b2b40]">{stats.cashBalance.toLocaleString()} ج.م</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* كارت المبيعات */}
        <div className="card border-r-4 border-blue-400">
          <p className="text-sm text-gray-500 font-bold">المبيعات</p>
          <p className="text-2xl font-bold text-[#0b2b40]">{stats.totalSales.toLocaleString()} ج.م</p>
        </div>

        {/* كارت الأرباح */}
        <div className="card border-r-4 border-green-500">
          <p className="text-sm text-gray-500 font-bold">صافي الربح</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalProfit.toLocaleString()} ج.م</p>
        </div>
      </div>

      {/* كارت الديون (مبدئي) */}
      <div className="card border-r-4 border-red-500">
        <p className="text-sm text-gray-500 font-bold">الديون</p>
        <p className="text-2xl font-bold text-red-500">0 ج.م</p>
      </div>

      {/* مساحة للرسم البياني (اختياري) */}
      <div className="card h-40 flex items-center justify-center bg-gray-50 text-gray-400">
        مكان الرسم البياني (مبيعات آخر 7 أيام)
      </div>
    </div>
  );
}
