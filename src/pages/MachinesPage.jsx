import { useState, useEffect } from 'react';
import { db } from '../db/database.js';
import toast from 'react-hot-toast';

export default function MachinesPage() {
  const [machines, setMachines] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');

  // جلب المكن والمحافظ
  useEffect(() => {
    const loadData = async () => {
      // بنجيب المحافظ
      const w = await db.wallets.toArray();
      setWallets(w);
      
      // بنكريت مكن افتراضي لو مفيش مكن في الداتابيز
      const m = await db.table('machines').toArray().catch(() => []);
      if (m.length === 0) {
        // لو الجدول مش موجود في الداتابيز هنضيفه
        await db.table('machines').bulkAdd([
          { name: 'فوري رئيسي', balance: 0 },
          { name: 'فوري كروت', balance: 0 },
          { name: 'كاش أوت', balance: 0 },
          { name: 'موبايل', balance: 0 }
        ]);
        setMachines(await db.table('machines').toArray());
      } else {
        setMachines(m);
      }
    };
    loadData();
  }, []);

  // تنفيذ عملية الشحن للمكنة
  const handleRechargeMachine = async (e) => {
    e.preventDefault();
    if (!walletId) return toast.error('اختر المحفظة اللي هتشحن منها');
    
    const val = Number(amount);
    if (!val || val <= 0) return toast.error('أدخل مبلغ صحيح');

    try {
      const wallet = await db.wallets.get(Number(walletId));
      if (wallet.balance < val) return toast.error('رصيد المحفظة غير كافٍ');

      // 1. خصم المبلغ من المحفظة
      await db.wallets.update(wallet.id, { 
        balance: wallet.balance - val,
        limitTotal: wallet.limitTotal - val // الليميت بيقل عشان ده صادر
      });

      // 2. زيادة رصيد المكنة
      const machine = await db.table('machines').get(selectedMachine.id);
      await db.table('machines').update(machine.id, { balance: machine.balance + val });

      // 3. تسجيل العملية
      await db.transactions.add({
        type: 'out',
        amount: val,
        walletId: wallet.id,
        note: `شحن مكنة: ${machine.name}`,
        date: new Date().toISOString()
      });

      toast.success('تم شحن المكنة بنجاح');
      setSelectedMachine(null);
      setAmount('');
      setWalletId('');
      
      // تحديث الشاشة
      window.location.reload(); 
    } catch (error) {
      toast.error('حدث خطأ أثناء الشحن');
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold mb-4 text-[#0b2b40]">المكن</h2>
      <p className="text-sm text-gray-500 mb-4">اختر المكنة عشان تشحن لها رصيد</p>

      {/* شبكة المكن */}
      <div className="grid grid-cols-2 gap-3">
        {machines.map(m => (
          <div 
            key={m.id} 
            onClick={() => setSelectedMachine(m)} 
            className={`card cursor-pointer text-center border-2 transition-all ${selectedMachine?.id === m.id ? 'border-[#0d9488] bg-[#e6f7f6]' : 'border-transparent'}`}
          >
            <h3 className="font-bold text-lg text-[#0b2b40]">{m.name}</h3>
            <p className="text-gray-500 text-sm mt-1">الرصيد: {m.balance || 0} ج.م</p>
          </div>
        ))}
      </div>

      {/* شاشة شحن المكنة */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6">
            <h3 className="font-bold text-center mb-4 text-lg">شحن {selectedMachine.name}</h3>
            
            <form onSubmit={handleRechargeMachine}>
              <label className="block text-sm font-bold mb-1">المبلغ (ج.م)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 mb-4 text-center font-bold text-xl outline-none focus:border-[#0d9488]"
                placeholder="0"
                autoFocus
              />

              <label className="block text-sm font-bold mb-1">خصم من محفظة</label>
              <select 
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 mb-6 outline-none focus:border-[#0d9488]"
              >
                <option value="">اختر المحفظة...</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} (رصيد: {w.balance})</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-[#0d9488] text-white py-3 rounded-xl font-bold">شحن</button>
                <button type="button" onClick={() => setSelectedMachine(null)} className="flex-1 bg-gray-200 py-3 rounded-xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
