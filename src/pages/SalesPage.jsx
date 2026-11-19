import { useState, useEffect } from 'react';
import { db } from '../db/database.js';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [cart, setCart] = useState([]);
  
  // فورم إضافة منتج جديد
  const [newProduct, setNewProduct] = useState({ name: '', buyPrice: '', sellPrice: '', stock: '' });
  
  // شاشة الدفع
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState('');

  // جلب البيانات من الداتابيز
  const loadData = async () => {
    setProducts(await db.products.toArray());
    setWallets(await db.wallets.toArray());
  };

  useEffect(() => {
    loadData();
  }, []);

  // إضافة منتج للفاتورة
  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) return toast.error('الكمية غير كافية في المخزون');
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  // إضافة صنف جديد للبرنامج (إكسسوار)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sellPrice) return toast.error('أكمل البيانات');
    
    await db.products.add({
      name: newProduct.name,
      buyPrice: Number(newProduct.buyPrice),
      sellPrice: Number(newProduct.sellPrice),
      stock: Number(newProduct.stock)
    });
    
    toast.success('تمت إضافة الصنف');
    setNewProduct({ name: '', buyPrice: '', sellPrice: '', stock: '' });
    loadData();
  };

  // حساب إجمالي الفاتورة
  const totalAmount = cart.reduce((sum, item) => sum + (item.sellPrice * item.qty), 0);

  // إتمام البيع والدفع
  const handleCheckout = async () => {
    if (!selectedWalletId) return toast.error('اختر طريقة الدفع أولاً');
    
    try {
      const wallet = wallets.find(w => w.id === Number(selectedWalletId));
      if (!wallet) throw new Error('المحفظة غير موجودة');

      // 1. تسجيل الفاتورة
      await db.sales.add({
        items: cart,
        total: totalAmount,
        paymentMethod: wallet.name,
        date: new Date().toISOString()
      });

      // 2. تحديث رصيد المحفظة (وارد)
      let fee = 0;
      // لو الدفع فودافون أو إنستاباي، بنخصم عمولة 1% من المبلغ اللي بيدخل
      if (wallet.type === 'wallet' || wallet.type === 'bank') {
        fee = totalAmount * 0.01;
      }
      
      const newBalance = wallet.balance + totalAmount;
      
      await db.wallets.update(wallet.id, { balance: newBalance });

      // 3. تسجيل العملية في سجل المحافظ
      await db.transactions.add({
        type: 'in',
        amount: totalAmount,
        fee: fee,
        walletId: wallet.id,
        note: 'بيع إكسسوارات',
        date: new Date().toISOString()
      });

      // 4. خصم الكميات من المخزون
      for (const item of cart) {
        const p = products.find(prod => prod.id === item.id);
        await db.products.update(item.id, { stock: p.stock - item.qty });
      }

      toast.success('تمت عملية البيع بنجاح');
      setCart([]); // تفريغ الفاتورة
      setIsCheckoutOpen(false);
      setSelectedWalletId('');
      loadData(); // تحديث الشاشة

    } catch (error) {
      toast.error('حدث خطأ أثناء الدفع');
    }
  };

  return (
    <div className="p-2 space-y-6">
      
      {/* قسم إضافة منتج جديد */}
      <div className="card bg-[#e6f7f6]">
        <h3 className="font-bold text-[#0b2b40] mb-3">إضافة إكسسوار جديد</h3>
        <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-2">
          <input placeholder="اسم المنتج" className="p-2 rounded-lg border col-span-2" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <input placeholder="سعر الشراء" type="number" className="p-2 rounded-lg border" value={newProduct.buyPrice} onChange={e => setNewProduct({...newProduct, buyPrice: e.target.value})} />
          <input placeholder="سعر البيع" type="number" className="p-2 rounded-lg border" value={newProduct.sellPrice} onChange={e => setNewProduct({...newProduct, sellPrice: e.target.value})} />
          <input placeholder="الكمية" type="number" className="p-2 rounded-lg border col-span-2" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
          <button type="submit" className="col-span-2 bg-[#0d9488] text-white py-2 rounded-lg font-bold mt-1">حفظ المنتج</button>
        </form>
      </div>

      {/* شبكة المنتجات */}
      <div>
        <h3 className="font-bold text-lg mb-2 text-[#0b2b40]">المنتجات المتاحة</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.map(p => (
            <div key={p.id} onClick={() => addToCart(p)} className="card cursor-pointer hover:border-[#0d9488] border-2 border-transparent transition-all">
              <h4 className="font-bold text-sm mb-1">{p.name}</h4>
              <p className="text-[#0d9488] font-bold text-lg">{p.sellPrice} ج.م</p>
              <p className="text-xs text-gray-500">المخزون: {p.stock}</p>
            </div>
          ))}
        </div>
      </div>

      {/* شريط الفاتورة السفلي (بيظهر لو في منتجات في السلة) */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-[#0b2b40] text-white p-4 rounded-2xl flex justify-between items-center shadow-xl z-40">
          <div>
            <p className="text-sm text-gray-300">الإجمالي ({cart.length} أصناف)</p>
            <p className="font-bold text-xl">{totalAmount} ج.م</p>
          </div>
          <button onClick={() => setIsCheckoutOpen(true)} className="bg-[#0d9488] px-6 py-2 rounded-xl font-bold">
            الدفع
          </button>
        </div>
      )}

      {/* شاشة اختيار طريقة الدفع */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-24">
            <h3 className="font-bold text-xl mb-4 text-center">اختر طريقة الدفع</h3>
            
            <div className="space-y-2 mb-6">
              {wallets.map(w => (
                <div 
                  key={w.id} 
                  onClick={() => setSelectedWalletId(w.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer flex justify-between items-center ${selectedWalletId === w.id ? 'border-[#0d9488] bg-[#e6f7f6]' : 'border-gray-200'}`}
                >
                  <span className="font-bold">{w.name}</span>
                  <span className="text-sm text-gray-500">{w.balance} ج.م</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={handleCheckout} className="flex-1 bg-[#0d9488] text-white py-3 rounded-xl font-bold">تأكيد الدفع</button>
              <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
