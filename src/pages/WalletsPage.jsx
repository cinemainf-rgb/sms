import { useState, useEffect } from 'react';
import { db } from '../db/database.js';
import toast from 'react-hot-toast';

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [operationType, setOperationType] = useState('in'); // 'in' = وارد, 'out' = صادر
  const [amount, setAmount] = useState('');

  // جلب المحافظ من الداتابيز
  const loadWallets = async () => {
    const data = await db.wallets.toArray();
    setWallets(data);
  };

  useEffect(() => {
    loadWallets();
  }, []);

  // فتح شاشة العملية (وارد / صادر)
  const openOperation = (wallet, type) => {
    setSelectedWallet(wallet);
    setOperationType(type);
    setAmount('');
    setIsModalOpen(true);
  };

  // تنفيذ العملية (الحسبة والليميت والعمولة)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number(amount);
    if (!val || val <= 0) return toast.error('أدخل مبلغ صحيح');

    try {
      let newBalance = selectedWallet.balance;
      let newLimit = selectedWallet.limitTotal;
      let fee = 0;

      // لو المحفظة فودافون أو إنستاباي، بنحسب عمولة 1% في الحالتين (وارد/صادر)
      if (selectedWallet.type === 'wallet' || selectedWallet.type === 'bank') {
        fee = val * 0.01; 
      }

      if (operationType === 'in') {
        // الوارد: الرصيد بيزيد، الليميت مبيتأثرش
        newBalance += val;
        // (ملاحظة: لو عايز العمولة تتخصم من الدرج هنا، ممكن نضيفها لاحقاً)
      } else {
        // الصادر: الرصيد بيقل، والليميت بيقل (عشان خروج كاش)
        if (newBalance < val) return toast.error('الرصيد غير كافٍ');
        newBalance -= val;
        newLimit -= val; // الليميت بيقل زي ما إنت شرحت
      }

      // تحديث المحفظة في الداتابيز
      await db.wallets.update(selectedWallet.id, {
        balance: newBalance,
        limitTotal: newLimit
      });

      // تسجيل العملية في سجل العمليات
      await db.transactions.add({
        type: operationType,
        amount: val,
        fee: fee,
        walletId: selectedWallet.id,
        note: `عملية ${operationType === 'in' ? 'وارد' : 'صادر'} - عمولة: ${fee}`,
        date: new Date().toISOString()
      });

      toast.success('تمت العملية بنجاح');
      setIsModalOpen(false);
      loadWallets(); // تحديث الشاشة

    } catch (error) {
      toast.error('حدث خطأ أثناء تنفيذ العملية');
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold mb-4 text-[#0b2b40]">المحافظ والخزنة</h2>

      {/* عرض كروت المحافظ */}
      <div className="grid grid-cols-1 gap-4">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="card">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-[#0b2b40]">{wallet.name}</h3>
              <span className="text-sm bg-[#e6f7f6] text-[#0d9488] px-2 py-1 rounded-md">
                {wallet.type === 'cash' ? 'نقدية' : wallet.type === 'bank' ? 'بنك' : 'محفظة'}
              </span>
            </div>
            
            <p className="text-3xl font-bold text-[#0d9488] mb-1">
              {wallet.balance.toLocaleString()} <span className="text-sm text-gray-500">ج.م</span>
            </p>

            {/* الليميت بيظهر بس للمحافظ والبنوك */}
            {wallet.type !== 'cash' && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  الليميت المتبقي: {wallet.limitTotal.toLocaleString()} ج.م
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-[#0d9488] h-2 rounded-full" 
                    style={{ width: `${(wallet.limitTotal / (wallet.type === 'bank' ? 400000 : 200000)) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* أزرار الوارد والصادر */}
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => openOperation(wallet, 'in')}
                className="flex-1 bg-[#0d9488] text-white py-2 rounded-xl font-bold text-sm"
              >
                وارد (+)
              </button>
              {wallet.type !== 'cash' && (
                <button 
                  onClick={() => openOperation(wallet, 'out')}
                  className="flex-1 bg-[#0b2b40] text-white py-2 rounded-xl font-bold text-sm"
                >
                  صادر (-)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* شاشة إدخال العملية (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4 text-center">
              {operationType === 'in' ? 'وارد (استلام)' : 'صادر (تحويل)'} - {selectedWallet.name}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-bold mb-2">المبلغ (ج.م)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-3 mb-4 focus:border-[#0d9488] outline-none text-center text-xl font-bold"
                placeholder="0"
                autoFocus
              />

              {/* معاينة العمولة */}
              {amount > 0 && (selectedWallet.type === 'wallet' || selectedWallet.type === 'bank') && (
                <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm">
                  <p className="flex justify-between">
                    <span>العمولة (1%):</span>
                    <span className="font-bold">{(Number(amount) * 0.01).toFixed(2)} ج.م</span>
                  </p>
                  <p className="flex justify-between text-[#0d9488] font-bold mt-1">
                    <span>الرصيد بعد العملية:</span>
                    <span>
                      {operationType === 'in' 
                        ? (selectedWallet.balance + Number(amount)).toLocaleString() 
                        : (selectedWallet.balance - Number(amount)).toLocaleString()
                      } ج.م
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-[#0d9488] text-white py-3 rounded-xl font-bold"
                >
                  تأكيد
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
