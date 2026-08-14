import 'dotenv/config';
import { db } from '../lib/db';
import { users, products, banners, paymentMethods, testimonials, settings, posts } from '../db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

const IMG = 'https://placehold.co/400x500/1a1a2e/F59E0B?text=';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ── Admin ──
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const rawPassword = process.env.ADMIN_PASSWORD || 'Admin123456';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!existing) {
    await db.insert(users).values({ email, password: hashedPassword, name: 'Admin', role: 'ADMIN' });
  }
  console.log(`✅ Admin: ${email}`);

  // ── Products ──
  const productData = [
    { name: 'Sauvage', brand: 'Dior', category: 'Fresh', gender: 'Men', price: 1850000, description: 'Fresh spicy with bergamot, pepper, and ambroxan.', sizes: '60ml,100ml,150ml', stock: 25, isBestSeller: true, tags: 'fresh,spicy', sizePrices: { '60ml': 1200000, '100ml': 1850000, '150ml': 2500000 } },
    { name: 'Bleu de Chanel', brand: 'Chanel', category: 'Woody', gender: 'Men', price: 1750000, description: 'Woody aromatic with citron, mint, and sandalwood.', sizes: '100ml,150ml', stock: 20, isBestSeller: true, tags: 'woody,aromatic', sizePrices: { '100ml': 1750000, '150ml': 2400000 } },
    { name: 'Tobacco Vanille', brand: 'Tom Ford', category: 'Amber', gender: 'Unisex', price: 4200000, description: 'Rich tobacco leaf, vanilla, cocoa, and dried fruits.', sizes: '50ml,100ml', stock: 12, isBestSeller: true, tags: 'amber,tobacco', sizePrices: { '50ml': 4200000, '100ml': 6500000 } },
    { name: 'Aventus', brand: 'Creed', category: 'Woody', gender: 'Men', price: 5500000, description: 'Smoky pineapple, birch, and musk.', sizes: '50ml,100ml', stock: 8, isBestSeller: true, tags: 'woody,fruity', sizePrices: { '50ml': 5500000, '100ml': 8000000 } },
    { name: 'Libre', brand: 'YSL', category: 'Floral', gender: 'Women', price: 1650000, description: 'Lavender, orange blossom, and musk.', sizes: '50ml,90ml', stock: 18, isBestSeller: false, tags: 'floral,lavender', sizePrices: { '50ml': 1650000, '90ml': 2200000 } },
    { name: 'Eros', brand: 'Versace', category: 'Fresh', gender: 'Men', price: 1200000, description: 'Mint, green apple, and tonka bean.', sizes: '50ml,100ml', stock: 30, isBestSeller: false, tags: 'fresh,mint', sizePrices: { '50ml': 1200000, '100ml': 1700000 } },
    { name: 'Acqua di Gio', brand: 'Giorgio Armani', category: 'Fresh', gender: 'Men', price: 1350000, description: 'Marine notes, jasmine, and cedar.', sizes: '50ml,100ml', stock: 25, isBestSeller: false, tags: 'fresh,marine', sizePrices: { '50ml': 1350000, '100ml': 1900000 } },
    { name: 'Omnia Amethyste', brand: 'Bvlgari', category: 'Floral', gender: 'Women', price: 950000, description: 'Iris, rose, and heliotrope.', sizes: '25ml,40ml,65ml', stock: 15, isBestSeller: false, tags: 'floral,iris', sizePrices: { '25ml': 650000, '40ml': 950000, '65ml': 1300000 } },
    { name: 'Boss Bottled', brand: 'Hugo Boss', category: 'Amber', gender: 'Men', price: 1100000, description: 'Apple, cinnamon, and sandalwood.', sizes: '50ml,100ml', stock: 22, isBestSeller: false, tags: 'amber,spicy', sizePrices: { '50ml': 1100000, '100ml': 1600000 } },
    { name: 'Le Male', brand: 'Jean Paul Gaultier', category: 'Amber', gender: 'Men', price: 1250000, description: 'Lavender, vanilla, and amber.', sizes: '75ml,125ml', stock: 18, isBestSeller: false, tags: 'amber,lavender', sizePrices: { '75ml': 1250000, '125ml': 1800000 } },
    { name: 'L\'Eau d\'Issey', brand: 'Issey Miyake', category: 'Floral', gender: 'Women', price: 1050000, description: 'Lotus, peony, and musk.', sizes: '50ml,100ml', stock: 14, isBestSeller: false, tags: 'floral,fresh', sizePrices: { '50ml': 1050000, '100ml': 1500000 } },
    { name: 'CK One', brand: 'Calvin Klein', category: 'Fresh', gender: 'Unisex', price: 650000, description: 'Pineapple, papaya, and musk.', sizes: '50ml,100ml,200ml', stock: 35, isBestSeller: false, tags: 'fresh,fruity', sizePrices: { '50ml': 450000, '100ml': 650000, '200ml': 950000 } },
    { name: 'Hero', brand: 'Burberry', category: 'Woody', gender: 'Men', price: 1450000, description: 'Lavender, cedar, and patchouli.', sizes: '50ml,100ml', stock: 16, isBestSeller: false, tags: 'woody,cedar', sizePrices: { '50ml': 1450000, '100ml': 2000000 } },
    { name: 'Flora Gorgeous Jasmine', brand: 'Gucci', category: 'Floral', gender: 'Women', price: 1500000, description: 'Jasmine, sandalwood, and mandarin.', sizes: '50ml,100ml', stock: 20, isBestSeller: false, tags: 'floral,jasmine', sizePrices: { '50ml': 1500000, '100ml': 2100000 } },
    { name: 'L\'Homme', brand: 'Prada', category: 'Fresh', gender: 'Men', price: 1550000, description: 'Iris, amber, and cedar.', sizes: '50ml,100ml', stock: 15, isBestSeller: false, tags: 'fresh,iris', sizePrices: { '50ml': 1550000, '100ml': 2200000 } },
    { name: 'Midnight Oud', brand: 'Arabian Oud', category: 'Amber', gender: 'Unisex', price: 450000, description: 'Rich oud wood blended with dark amber and vanilla.', sizes: '30ml,50ml,100ml', stock: 20, isBestSeller: false, tags: 'amber,oud', sizePrices: { '30ml': 350000, '50ml': 450000, '100ml': 750000 } },
  ];

  // Clear existing
  await db.delete(products);

  for (const p of productData) {
    const sizePrices = p.sizePrices || {}
    await db.insert(products).values({
      name: p.name,
      brand: p.brand,
      category: p.category,
      gender: p.gender,
      price: p.price,
      description: p.description,
      sizes: p.sizes,
      stock: p.stock,
      isBestSeller: p.isBestSeller,
      tags: p.tags,
      image: `${IMG}${encodeURIComponent(p.brand + ' ' + p.name)}`,
      stockData: JSON.stringify({ prices: sizePrices }),
    });
    console.log(`  📦 ${p.brand} ${p.name} — Rp ${p.price.toLocaleString('id-ID')} (${Object.entries(sizePrices).map(([k,v]) => `${k}:${v}`).join(', ')})`);
  }
  console.log(`✅ ${productData.length} products\n`);

  // ── Banners ──
  await db.delete(banners);
  await db.insert(banners).values([
    { title: 'New Arrivals — Discover Your Signature', image: `${IMG}New+Arrivals`, link: '/products', active: true, order: 1 },
    { title: 'Up to 30% Off Selected Fragrances', image: `${IMG}Sale`, link: '/products', active: true, order: 2 },
  ]);
  console.log('✅ 2 banners\n');

  // ── Payment Methods ──
  await db.delete(paymentMethods);
  await db.insert(paymentMethods).values([
    { type: 'qris', label: 'QRIS All Payments', qrisImageUrl: `${IMG}QRIS`, accountName: '', accountNumber: '', isActive: true },
    { type: 'transfer', label: 'BCA', accountName: 'PT Parfume Store', accountNumber: '1234567890', isActive: true },
    { type: 'transfer', label: 'Mandiri', accountName: 'PT Parfume Store', accountNumber: '0987654321', isActive: true },
  ]);
  console.log('✅ 3 payment methods\n');

  // ── Testimonials ──
  await db.delete(testimonials);
  await db.insert(testimonials).values([
    { name: 'Rina Susanti', role: 'Loyal Customer', content: 'Parfumnya tahan seharian! Wanginya lembut banget, nggak nyengat. Sudah repeat order 3 kali dan selalu puas.', rating: 5, avatar: 'https://placehold.co/80x80/1a1a2e/F59E0B?text=RS', proofImage: 'https://placehold.co/400x300/1a1a2e/F59E0B?text=Parfum+Me+Pakai' },
    { name: 'Andi Kurniawan', role: 'First Buyer', content: 'Packaging premium, wangi sesuai deskripsi. Pengiriman cepat banget, hari ini pesan besok sudah sampai. Recommended!', rating: 5, avatar: 'https://placehold.co/80x80/1a1a2e/F59E0B?text=AK', proofImage: 'https://placehold.co/400x300/1a1a2e/F59E0B?text=Unboxing' },
    { name: 'Maya Lesmana', role: 'Beauty Blogger', content: 'Sauvage-nya jadi favorit banget. Banyak yang nanya parfum apa yang dipakai. Wanginya sophisticated dan tahan lama.', rating: 5, avatar: 'https://placehold.co/80x80/1a1a2e/F59E0B?text=ML', proofImage: 'https://placehold.co/400x300/1a1a2e/F59E0B?text=Review+Photo' },
    { name: 'Budi Wahyudi', role: 'Customer', content: 'Pengiriman cepat, produk original. Harga juga lebih murah dibanding toko offline. Pasti balik lagi beli di sini.', rating: 4, avatar: 'https://placehold.co/80x80/1a1a2e/F59E0B?text=BW' },
    { name: 'Dewi Kartika', role: 'Repeat Buyer', content: 'Libre-nya authentic, wanginya exactly seperti yang di mall. Free ongkir juga jadi lebih hemat. Pelayanannya ramah sekali.', rating: 5, avatar: 'https://placehold.co/80x80/1a1a2e/F59E0B?text=DK' },
    { name: 'Fajar Nugroho', role: 'New Customer', content: 'Baru pertama kali beli parfum online, ternyata original! Aventus-nya wangi smoky pineapple, khas banget. Puas!', rating: 5, avatar: 'https://placehold.co/80x80/1a1a2e/F59E0B?text=FN' },
  ]);
  console.log('✅ 6 testimonials\n');

  // ── Blog Posts ──
  await db.delete(posts);
  await db.insert(posts).values([
    {
      title: 'Cara Merawat Parfum Agar Tahan Lama',
      slug: 'cara-merawat-parfum-agar-tahan-lama',
      excerpt: 'Tips jitu menjaga kualitas dan ketahanan parfum kesayangan Anda.',
      content: 'Parfum adalah investasi yang perlu dirawat agar tetap berkualitas. Berikut tips merawat parfum agar tahan lama:\n\n## 1. Simpan di Tempat yang Tepat\n\nSimpan parfum di tempat yang sejuk dan gelap, jauh dari sinar matahari langsung dan perubahan suhu ekstrem. Hindari menyimpannya di kamar mandi karena kelembapan bisa merusak komposisi aroma. Suhu ideal penyimpanan parfum adalah 15-20 derajat Celsius.\n\n## 2. Tutup Botol dengan Rapat\n\nSelalu tutup botol parfum dengan rapat setelah digunakan. Kontak dengan udara dapat mengoksidasi bahan-bahan dalam parfum dan mengubah aromanya. Jika Anda membiarkan botol terbuka terlalu lama, parfum bisa menjadi tengik dan kehilangan kualitasnya.\n\n## 3. Gunakan pada Pulse Point\n\nGunakan parfum pada pulse point seperti pergelangan tangan, belakang telinga, dan leher untuk hasil yang optimal. Pulse point menghasilkan panas tubuh yang membantu menyebarkan aroma parfum sepanjang hari.\n\n## 4. Rotasi Penggunaan\n\nJika Anda memiliki beberapa parfum, putar penggunaannya secara berkala. Hidung Anda bisa menjadi kebal terhadap satu aroma jika digunakan setiap hari. Dengan merotasi, Anda bisa menikmati setiap aroma dengan sensasi yang selalu segar.\n\n## 5. Jangan Semprot ke Arah Api\n\nHindari menyemprot parfum ke arah api atau sumber panas. Kandungan alkohol dalam parfum bisa terbakar. Semprotkan parfum dari jarak 15-20 cm ke kulit untuk hasil terbaik.\n\nDengan merawat parfum dengan benar, aromanya bisa bertahan lebih lama dan kualitasnya tetap terjaga. Lihat koleksi [parfum original](/products) kami untuk menemukan aroma yang tepat untuk Anda.',
      category: 'Care Tips',
      tags: 'merawat parfum, parfum tahan lama, tips parfum',
      published: true,
    },
    {
      title: 'Panduan Scent Family: Fresh, Floral, Woody, Amber',
      slug: 'panduan-scent-family-fresh-floral-woody-amber',
      excerpt: 'Kenali empat keluarga aroma utama dan temukan yang paling cocok untuk Anda.',
      content: 'Dunia parfum terbagi menjadi empat keluarga aroma utama. Memahami scent family membantu Anda memilih parfum yang sesuai dengan kepribadian dan preferensi Anda.\n\n## Fresh\n\nFresh memberikan kesan bersih dan menyegarkan dengan notes seperti citrus, mint, dan laut. Parfum fresh cocok untuk cuaca panas dan aktivitas outdoor. Contoh populer: [Dior Sauvage](/products) dengan kombinasi bergamot dan pepper yang segar.\n\n## Floral\n\nFloral menawarkan keharuman bunga yang elegan dan feminin. Rose, jasmine, dan lily adalah beberapa bunga yang paling sering digunakan. Floral sangat cocok untuk acara formal dan kencan. [YSL Libre](/products) adalah contoh floral modern yang maskulin sekaligus elegan.\n\n## Woody\n\nWoody memberikan kesan hangat dan maskulin dengan campuran sandalwood, cedar, dan vetiver. Aroma ini tahan lama dan cocok untuk musim dingin. [Chanel Bleu de Chanel](/products) adalah representasi sempurna dari scent family woody.\n\n## Amber\n\nAmber adalah keluarga yang paling kaya dan hangat, dengan notes vanilla, musk, dan rempah-rempah. Aroma ini sangat cocok untuk malam hari dan cuaca dingin. [Tom Ford Tobacco Vanille](/products) adalah ikon dari scent family amber.\n\nPilih scent family yang sesuai dengan kepribadian Anda, atau kumpulkan beberapa parfum dari berbagai family untuk berbagai kesempatan.',
      category: 'Scent Guide',
      tags: 'scent family, fresh, floral, woody, amber, panduan parfum',
      published: true,
    },
    {
      title: 'Perbedaan EDP, EDT, dan Eau de Parfum',
      slug: 'perbedaan-edp-edt-dan-eau-de-parfum',
      excerpt: 'Memahami konsentrasi aroma dan durasi ketahanan setiap jenis parfum.',
      content: 'Banyak orang bingung membedakan berbagai jenis parfum. Perbedaan utamanya terletak pada konsentrasi bahan aromatik dan durasi ketahanannya.\n\n## Eau de Cologne (EDC)\n\nEDC memiliki konsentrasi 2-5% dan sangat ringan. Cocok untuk penggunaan sehari-hari di cuaca panas. Ketahanan: 1-2 jam.\n\n## Eau de Toilette (EDT)\n\nEDT memiliki konsentrasi 5-15% dan merupakan pilihan paling populer. Cocok untuk aktivitas sehari-hari dan kantor. Ketahanan: 3-5 jam. Harganya lebih terjangkau dibandingkan EDP.\n\n## Eau de Parfum (EDP)\n\nEDP memiliki konsentrasi 15-20% dan lebih tahan lama. Cocok untuk acara formal dan malam hari. Ketahanan: 6-8 jam. [Dior Sauvage EDP](/products) adalah contoh EDP yang sangat populer.\n\n## Parfum / Extrait\n\nParfum atau Extrait memiliki konsentrasi 20-30% dan paling tahan lama. Aromanya intens dan memukau. Ketahanan: 8-12 jam. Harganya paling mahal namun sepadan dengan kualitasnya.\n\nPilih berdasarkan kebutuhan Anda. EDT untuk sehari-hari, EDP untuk acara spesial. Kunjungi [katalog parfum](/products) kami untuk melihat berbagai pilihan.',
      category: 'Scent Guide',
      tags: 'EDP, EDT, parfum, konsentrasi aroma, ketahanan parfum',
      published: true,
    },
    {
      title: '5 Parfum Best Seller untuk Pria',
      slug: '5-parfum-best-seller-untuk-pria',
      excerpt: 'Rekomendasi parfum pria paling populer yang wajib ada di koleksi Anda.',
      content: 'Memilih parfum pria yang tepat bisa jadi tantangan. Berikut 5 parfum best seller yang wajib ada di koleksi Anda:\n\n## 1. Dior Sauvage\n\nDior Sauvage menjadi salah satu parfum pria paling laris di dunia. Dengan kombinasi bergamot, pepper, dan ambroxan, parfum ini memberikan kesan segar namun maskulin. Cocok untuk segala occasion dari kantor hingga kencan.\n\n## 2. Bleu de Chanel\n\nBleu de Chanel menawarkan aroma woody aromatic yang sophisticated. Citron, mint, dan sandalwood menciptakan perpaduan yang sempurna untuk pria modern. Ketahannya yang luar biasa membuat banyak pria menjadikannya sebagai signature scent.\n\n## 3. Tom Ford Tobacco Vanille\n\nUntuk Anda yang suka aroma bold, Tom Ford Tobacco Vanille adalah pilihan yang tepat. Tobacco leaf, vanilla, dan cocoa menciptakan aroma yang hangat dan memikat. Sempurna untuk malam hari dan cuaca dingin.\n\n## 4. Creed Aventus\n\nCreed Aventus adalah parfum niche yang menjadi legenda. Smoky pineapple, birch, dan musk menciptakan aroma yang unik dan memikat. Parfum ini sangat cocok untuk pria yang ingin tampil berbeda.\n\n## 5. Versace Eros\n\nVersace Eros menawarkan aroma fresh yang energik. Mint, green apple, dan tonka bean menciptakan kombinasi yang cocok untuk pria muda dan aktif. Harganya juga lebih terjangkau dibandingkan parfum lainnya.\n\nSemua parfum ini tersedia di [katalog parfum pria](/products?gender=Men) kami. Pilih yang sesuai dengan kepribadian Anda!',
      category: 'Recommendation',
      tags: 'parfum pria, best seller, rekomendasi parfum, dior sauvage, bleu de chanel',
      published: true,
    },
    {
      title: 'Tips Memilih Parfum Sesuai Musim',
      slug: 'tips-memilih-parfum-sesuai-musim',
      excerpt: 'Panduan memilih aroma yang tepat untuk setiap musim dan cuaca.',
      content: 'Memilih parfum tidak hanya soal selera, tapi juga harus disesuaikan dengan musim. Berikut panduannya:\n\n## Musim Panas\n\nPilih parfum dengan aroma fresh dan light seperti citrus, aquatic, atau green. Aroma berat justru akan terasa menyengat di cuaca panas. [Dior Sauvage](/products) dengan aroma fresh spicy-nya cocok untuk musim panas.\n\n## Musim Hujan\n\nMusim hujan atau dingin adalah waktu yang tepat untuk parfum dengan aroma warm dan rich. Woody, amber, dan oriental sangat cocok karena memberikan kesan hangat dan nyaman. Aroma ini juga biasanya lebih tahan lama.\n\n## Tropis (Indonesia)\n\nDi Indonesia yang tropis, parfum fresh dan floral adalah pilihan sepanjang tahun. Namun, untuk acara malam atau ruangan ber-AC, woody dan amber bisa menjadi alternatif yang menarik.\n\n## Cuaca Dingin (AC)\n\nUntuk ruangan ber-AC atau daerah pegunungan, pilih parfum dengan base notes yang kuat seperti sandalwood, vanilla, atau musk. Aroma ini akan bertahan lebih lama di suhu dingin.\n\nKuncinya adalah bereksperimen dan menemukan apa yang paling cocok untuk Anda. Lihat koleksi [parfum fresh](/products?category=Fresh) dan [parfum woody](/products?category=Woody) kami.',
      category: 'Care Tips',
      tags: 'memilih parfum, parfum musim, parfum tropis, tips memilih parfum',
      published: true,
    },
    {
      title: 'Review: Dior Sauvage vs Bleu de Chanel',
      slug: 'review-dior-sauvage-vs-bleu-de-chanel',
      excerpt: 'Perbandingan dua parfum pria paling populer di dunia. Mana yang lebih cocok untuk Anda?',
      content: 'Dior Sauvage dan Bleu de Chanel adalah dua parfum pria paling populer di dunia. Keduanya masuk dalam kategori woody aromatic dan sangat sering dibandingkan. Berikut perbandingan lengkapnya:\n\n## Top Notes\n\n**Dior Sauvage:** Bergamot, pepper, elemi. Memberikan kesan segar dan spicy sejak awal.\n\n**Bleu de Chanel:** Citron, mint, pink pepper. Lebih fresh dan minty di awal.\n\n## Heart Notes\n\n**Dior Sauvage:** Lavender, Sichuan pepper, nutmeg. Warm dan spicy.\n\n**Bleu de Chanel:** Jasmine, nutmeg, fruit notes. Lebih floral dan smooth.\n\n## Base Notes\n\n**Dior Sauvage:** Ambroxan, cedar. Smoky dan maskulin.\n\n**Bleu de Chanel:** Sandalwood, incense, cedar. Lebih creamy dan sophisticated.\n\n## Ketahanan\n\n**Dior Sauvage EDT:** 6-7 jam. Proyeksi sedang.\n**Bleu de Chanel EDT:** 8-10 jam. Proyeksi kuat.\n\n## Kesimpulan\n\nPilih **Dior Sauvage** jika Anda suka aroma segar, spicy, dan bold. Cocok untuk kantor dan kencan.\n\nPilih **Bleu de Chanel** jika Anda suka aroma sophisticated, creamy, dan elegan. Cocok untuk acara formal dan sehari-hari.\n\nKeduanya tersedia di [katalog parfum pria](/products?gender=Men) kami. Percobaan langsung adalah cara terbaik untuk menentukan mana yang paling cocok untuk Anda.',
      category: 'Recommendation',
      tags: 'dior sauvage, bleu de chanel, review parfum, perbandingan parfum',
      published: true,
    },
    {
      title: 'Parfum Arabian: Panduan Lengkap untuk Pemula',
      slug: 'parfum-arabian-panduan-lengkap-untuk-pemula',
      excerpt: 'Mengenal parfum Arabian yang sedang tren. Aroma, harga, dan rekomendasi untuk pemula.',
      content: 'Parfum Arabian sedang menjadi tren di Indonesia. Dengan aroma yang kaya dan tahan lama, parfum ini menawarkan alternatif menarik dari parfum Eropa. Berikut panduan lengkapnya:\n\n## Apa Itu Parfum Arabian?\n\nParfum Arabian adalah parfum yang terinspirasi dari tradisi wewangian Timur Tengah. Ciri khasnya adalah penggunaan rempah-rempah, oud (kayu gaharu), musk, dan amber. Aromanya lebih intense dan tahan lama dibandingkan parfum Eropa.\n\n## Ciri Khas Aroma\n\n- **Oud:** Aroma kayu yang smoky dan complex. Ini adalah signature scent parfum Arabian.\n- **Musk:** Aroma bersih dan lembut yang menjadi base notes.\n- **Rempah:** Cinnamon, cardamom, saffron memberikan kesan hangat dan eksotis.\n- **Amber:** Aroma manis dan hangat yang memikat.\n\n## Kelebihan\n\n1. **Ketahanan lama:** 8-12 jam, bahkan bisa seharian.\n2. **Proyeksi kuat:** Aroma bisa tercium dari jarak jauh.\n3. **Harga terjangkau:** Banyak pilihan parfum Arabian berkualitas dengan harga Rp 100-300 ribu.\n4. **Unik:** Tidak banyak orang yang pakai, jadi Anda terlihat berbeda.\n\n## Tips untuk Pemula\n\nMulai dengan aroma yang lebih ringan seperti **fresh oriental** sebelum mencoba oud yang intense. Gunakan dalam jumlah sedikit karena aromanya sangat kuat. Cocok untuk malam hari dan acara formal.\n\n## Rekomendasi\n\nCoba koleksi [parfum kami](/products?category=Amber) untuk menemukan aroma yang sesuai dengan selera Anda.',
      category: 'Scent Guide',
      tags: 'parfum arabian, parfum arab, oud, panduan parfum pemula',
      published: true,
    },
    {
      title: 'Gift Guide: Parfum untuk Pacar',
      slug: 'gift-guide-parfum-untuk-pacar',
      excerpt: 'Panduan memilih parfum sebagai hadiah untuk pacar. Tips memilih aroma yang disukai.',
      content: 'Memberikan parfum sebagai hadiah untuk pacar adalah pilihan yang sempurna. Namun, memilih parfum untuk orang lain bisa jadi tantangan. Berikut panduannya:\n\n## Kenali Selera Pacar Anda\n\nPerhatikan parfum apa yang biasa dipakai pacar Anda. Apakah aroma fresh, floral, woody, atau amber? Jika Anda tidak yakin, tanyakan secara tidak langsung atau perhatikan parfum yang ada di raknya.\n\n## Parfum untuk Pacar Wanita\n\n- **Fresh:** Cocok untuk yang aktif dan sporty. Contoh: floral fresh.\n- **Floral:** Pilihan aman untuk wanita. Cocok untuk semua usia.\n- **Sweet:** Vanilla, caramel, berry. Cocok untuk yang feminin dan romantis.\n\n## Parfum untuk Pacar Pria\n\n- **Fresh:** Segar dan maskulin. Cocok untuk pria aktif.\n- **Woody:** Hangat dan sophisticated. Cocok untuk pria dewasa.\n- **Spicy:** Bold dan confident. Cocok untuk pria yang suka tampil beda.\n\n## Tips Memberikan Hadiah\n\n1. **Kemas dengan rapi** — Kotak parfum yang bagus menambah kesan mewah.\n2. **Sertakan catatan kecil** — Tulis pesan singkat yang personal.\n3. **Jangan paksa selera Anda** — Pilih yang disukai pacar, bukan yang Anda suka.\n4. **Beli dari toko terpercaya** — Pastikan parfum original dan bergaransi.\n\n## Budget\n\n- **Rp 100-300 ribu:** Parfum Arabian berkualitas.\n- **Rp 300-800 ribu:** Parfum branded populer.\n- **Rp 800 ribu+:** Parfum premium dan niche.\n\nLihat koleksi [parfum hadiah](/products) kami untuk menemukan hadiah sempurna untuk pacar Anda.',
      category: 'Recommendation',
      tags: 'parfum hadiah, kado pacar, gift guide, parfum valentine',
      published: true,
    },
  ]);
  console.log('✅ 8 blog posts\n');

  // ── Settings ──
  const settingsData: Record<string, string> = {
    store_name: 'Parfume Store',
    store_slogan: 'Premium fragrances for every occasion. Authentic, long-lasting, and beautifully crafted.',
    support_email: 'hello@parfumestore.com',
  };
  for (const [key, value] of Object.entries(settingsData)) {
    const [ex] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (ex) { await db.update(settings).set({ value }).where(eq(settings.key, key)); }
    else { await db.insert(settings).values({ key, value }); }
  }
  console.log('✅ 3 settings\n');

  console.log('🎉 Seed complete!');
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
