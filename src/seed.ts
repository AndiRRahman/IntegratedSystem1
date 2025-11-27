// src/seed.ts
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { PlaceHolderImages } from './lib/placeholder-images';
import type { Product } from './lib/definitions';

// 1. Konfigurasi Environment Variables agar Admin SDK terhubung ke Emulator
// Pastikan port ini sesuai dengan firebase.json Anda
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'studio-2940845017-cd507'; // Project ID dari firebaseConfig

const getProductImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    return {
      imageUrl: 'https://picsum.photos/seed/default/600/800',
      imageHint: 'default image',
      description: 'A default product image.',
    };
  }
  return { imageUrl: image.imageUrl, imageHint: image.imageHint, description: image.description };
};

const products: Omit<Product, 'id'>[] = [
  { name: 'Modern Chair', price: 180, stock: 15, category: 'Furniture', ...getProductImage('product-1') },
  { name: 'Sleek Laptop', price: 1200, stock: 8, category: 'Electronics', ...getProductImage('product-2') },
  { name: 'Ceramic Mugs', price: 25, stock: 50, category: 'Homeware', ...getProductImage('product-3') },
  { name: 'Travel Backpack', price: 75, stock: 30, category: 'Accessories', ...getProductImage('product-4') },
  { name: 'Smart Watch', price: 250, stock: 22, category: 'Electronics', ...getProductImage('product-5') },
  { name: 'Noise-Cancelling Headphones', price: 350, stock: 12, category: 'Electronics', ...getProductImage('product-6') },
];

async function seedData() {
  console.log("🌱 Memulai proses seeding dengan Admin SDK (Bypassing Rules)...");

  // 2. Inisialisasi App (Admin SDK otomatis membaca env vars di atas)
  const app = initializeApp({
    projectId: process.env.GCLOUD_PROJECT,
  });
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 3. Hapus data lama (opsional, tapi bagus untuk seeding bersih)
  console.log("🔥 Menghapus data produk lama...");
  const productsCollection = await db.collection('products').get();
  const deleteBatch = db.batch();
  productsCollection.docs.forEach(doc => deleteBatch.delete(doc.ref));
  await deleteBatch.commit();
  console.log("🔥 Data produk lama berhasil dihapus.");


  // 4. Buat Akun Admin
  const adminEmail = "admin@admin.com";
  const adminPassword = "AdminEcommervUMI"; // Ganti password sesuai permintaan

  try {
    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(adminEmail);
        console.log("ℹ️ User admin sudah ada, memperbarui data...");
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        console.log(`✨ Membuat user admin baru: ${adminEmail}...`);
        userRecord = await auth.createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: "Super Admin",
            emailVerified: true
        });
      } else {
        throw e; // Lemparkan error lain
      }
    }

    const adminUid = userRecord.uid;

    const userDocRef = db.collection("users").doc(adminUid);
    const adminRoleRef = db.collection("roles_admin").doc(adminUid);

    const writeBatch = db.batch();
    writeBatch.set(userDocRef, {
      id: adminUid,
      name: "Super Admin",
      email: adminEmail,
      role: "ADMIN",
      createdAt: new Date().toISOString()
    }, { merge: true });
    writeBatch.set(adminRoleRef, { active: true });

    await writeBatch.commit();

    console.log("✅ Akun & Role Admin berhasil diset!");
  } catch (error: any) {
    console.error("❌ Gagal memproses akun admin:", error);
  }

  // 5. Seed Produk
  console.log(`🌱 Seeding ${products.length} produk...`);
  const productsBatch = db.batch();

  products.forEach((product) => {
    // Firebase akan otomatis generate ID jika kita menggunakan .doc() tanpa parameter
    const productRef = db.collection("products").doc(); 
    productsBatch.set(productRef, {
      id: productRef.id, // Menyimpan ID yang di-generate
      ...product,
      price: Number(product.price), 
      stock: Number(product.stock),
      createdAt: new Date().toISOString()
    });
  });

  await productsBatch.commit();
  console.log("✅ Data Produk berhasil dimasukkan!");
  console.log("🎉 Seeding selesai!");
  process.exit(0); // Keluar dari skrip setelah selesai
}

seedData().catch((err) => {
  console.error("❌ Error seeding data:", err);
  process.exit(1);
});
