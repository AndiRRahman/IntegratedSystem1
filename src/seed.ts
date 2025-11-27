// src/seed.ts
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { products } from './lib/data'; // Mengambil data produk Anda

// 1. Konfigurasi Environment Variables agar Admin SDK terhubung ke Emulator
// Pastikan port ini sesuai dengan firebase.json Anda
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = 'studio-2940845017-cd507'; // Project ID dari firebaseConfig

async function seedData() {
  console.log("🌱 Memulai proses seeding dengan Admin SDK (Bypassing Rules)...");

  // 2. Inisialisasi App (Admin SDK otomatis membaca env vars di atas)
  const app = initializeApp({
    projectId: process.env.GCLOUD_PROJECT,
  });
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  // 3. Buat Akun Admin
  const adminEmail = "admin@admin.com";
  const adminPassword = "password123";

  try {
    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(adminEmail);
        console.log("ℹ️ User admin sudah ada, memperbarui data...");
    } catch (e) {
        console.log(`Creating admin user: ${adminEmail}...`);
        userRecord = await auth.createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: "Super Admin",
            emailVerified: true
        });
    }

    const adminUid = userRecord.uid;

    await db.collection("users").doc(adminUid).set({
      id: adminUid,
      name: "Super Admin",
      email: adminEmail,
      role: "ADMIN",
      createdAt: new Date().toISOString()
    }, { merge: true });

    await db.collection("roles_admin").doc(adminUid).set({
      active: true
    });

    console.log("✅ Akun & Role Admin berhasil diset!");
  } catch (error: any) {
    console.error("❌ Gagal memproses akun admin:", error);
  }

  console.log(`Seeding ${products.length} produk...`);
  const batch = db.batch();

  products.forEach((product) => {
    const productRef = db.collection("products").doc(product.id);
    batch.set(productRef, {
      ...product,
      price: Number(product.price), 
      stock: Number(product.stock),
      createdAt: new Date().toISOString()
    }, { merge: true });
  });

  await batch.commit();
  console.log("✅ Data Produk berhasil dimasukkan!");
  console.log("🎉 Seeding selesai!");
}

seedData().catch((err) => {
  console.error("Error seeding data:", err);
  process.exit(1);
});