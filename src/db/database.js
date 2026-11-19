import Dexie from 'dexie';

// إنشاء قاعدة البيانات
export const db = new Dexie('FazlakaDB');

// تعريف الجداول (المحافظ، المنتجات، المبيعات، المكن)
db.version(1).stores({
  wallets: '++id, name, balance, limitTotal, type', // المحافظ
  transactions: '++id, type, amount, walletId, note, date', // العمليات (وارد/صادر)
  products: '++id, name, buyPrice, sellPrice, stock', // المنتجات (إكسسوارات)
  sales: '++id, items, total, paymentMethod, date' // المبيعات
});

// دالة بتشتغل أول ما البرنامج يفتح عشان تضيف المحافظ الأساسية لو مفيش حاجة
export const seedDatabase = async () => {
  const count = await db.wallets.count();
  if (count === 0) {
    await db.wallets.bulkAdd([
      { name: 'الدرج (نقدية)', balance: 0, limitTotal: 0, type: 'cash' },
      { name: 'فودافون كاش', balance: 0, limitTotal: 200000, type: 'wallet' },
      { name: 'إنستاباي', balance: 0, limitTotal: 400000, type: 'bank' }
    ]);
  }
};
