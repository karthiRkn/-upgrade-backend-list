import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Check if we have any products
    const productCount = await prisma.product.count();
    
    if (productCount === 0) {
      console.log('🌱 Seeding database...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
    } else {
      console.log(`✅ Database already has ${productCount} products`);
    }
    
    console.log('✅ Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default initDatabase;