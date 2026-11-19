import { prisma } from './src/lib/prisma';

async function testDb() {
  console.log('Kiểm tra kết nối PostgreSQL...');
  try {
    const userCount = await prisma.user.count();
    console.log('✅ Kết nối PostgreSQL thành công! Số lượng user trong CSDL:', userCount);
    const users = await prisma.user.findMany({ select: { username: true, role: true } });
    console.log('Danh sách users:', users);
  } catch (err: any) {
    console.error('❌ LỖI KẾT NỐI POSTGRESQL:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

testDb();

