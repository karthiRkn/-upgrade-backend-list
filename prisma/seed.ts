import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('admin@123', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'John Doe',
      bio: 'Product enthusiast and indie maker',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      bio: 'Designer and developer',
    },
  });

  console.log('✅ Created 2 users');

  // Create products
  const products = [
    {
      name: 'AI Resume Builder',
      tagline: 'Create professional resumes with AI in minutes',
      description: 'Our AI-powered resume builder helps you create stunning, ATS-friendly resumes in minutes. Simply input your information and let our AI do the heavy lifting. Choose from multiple templates, customize colors, and export in PDF or Word format.',
      website: 'https://example.com/ai-resume',
      category: 'AI',
      userId: user1.id,
      images: JSON.stringify(['https://via.placeholder.com/400x300']),
    },
    {
      name: 'Designify AI',
      tagline: 'Generate logos, posters, and graphics with AI',
      description: 'Designify uses advanced AI to help you create professional designs without any design skills. Generate logos, social media posts, posters, and more. Perfect for startups and small businesses.',
      website: 'https://example.com/designify',
      category: 'Design',
      userId: user2.id,
      images: JSON.stringify(['https://via.placeholder.com/400x300']),
    },
    {
      name: 'TaskFlow Manager',
      tagline: 'Visual task management for teams',
      description: 'Collaborate with your team using intuitive boards, lists, and cards. Track progress, set deadlines, and manage projects effortlessly. Integrates with Slack, Google Drive, and more.',
      website: 'https://example.com/taskflow',
      category: 'Productivity',
      userId: user1.id,
      images: JSON.stringify(['https://via.placeholder.com/400x300']),
    },
    {
      name: 'CodeSnap',
      tagline: 'Beautiful code screenshots for developers',
      description: 'Turn your code into beautiful, shareable images. Perfect for social media, documentation, and presentations. Supports 50+ programming languages with customizable themes.',
      website: 'https://example.com/codesnap',
      category: 'Developer Tools',
      userId: user2.id,
      images: JSON.stringify(['https://via.placeholder.com/400x300']),
    },
    {
      name: 'EmailCraft',
      tagline: 'Email marketing made simple',
      description: 'Create, send, and track beautiful email campaigns. Drag-and-drop editor, automation workflows, and detailed analytics. Grow your audience and boost engagement.',
      website: 'https://example.com/emailcraft',
      category: 'Marketing',
      userId: user1.id,
      images: JSON.stringify(['https://via.placeholder.com/400x300']),
    },
    {
      name: 'MindMap Pro',
      tagline: 'Visual thinking and brainstorming tool',
      description: 'Organize your thoughts, plan projects, and brainstorm ideas with beautiful mind maps. Real-time collaboration, templates, and export options.',
      website: 'https://example.com/mindmap',
      category: 'Productivity',
      userId: user2.id,
      images: JSON.stringify(['https://via.placeholder.com/400x300']),
    },
  ];

  for (const productData of products) {
    await prisma.product.create({ data: productData });
  }

  console.log(`✅ Created ${products.length} products`);

  // Create some votes
  const allProducts = await prisma.product.findMany();
  
  for (const product of allProducts.slice(0, 3)) {
    await prisma.vote.create({
      data: {
        userId: user1.id,
        productId: product.id,
      },
    });

    await prisma.myList.create({
      data: {
        userId: user1.id,
        productId: product.id,
      },
    });
  }

  for (const product of allProducts.slice(1, 4)) {
    await prisma.vote.create({
      data: {
        userId: user2.id,
        productId: product.id,
      },
    });

    await prisma.myList.create({
      data: {
        userId: user2.id,
        productId: product.id,
      },
    });
  }

  console.log('✅ Created votes and lists');

  // Create some comments
  const comments = [
    {
      content: 'This is amazing! Been looking for something like this.',
      userId: user2.id,
      productId: allProducts[0].id,
    },
    {
      content: 'Great work! The UI is super clean.',
      userId: user1.id,
      productId: allProducts[1].id,
    },
    {
      content: 'Just tried it and it works perfectly! Highly recommend.',
      userId: user2.id,
      productId: allProducts[2].id,
    },
  ];

  for (const commentData of comments) {
    await prisma.comment.create({ data: commentData });
  }

  console.log('✅ Created comments');

  // Create newsletter subscribers
  await prisma.subscriber.createMany({
    data: [
      { email: 'subscriber1@example.com' },
      { email: 'subscriber2@example.com' },
      { email: 'subscriber3@example.com' },
    ],
  });

  console.log('✅ Created subscribers');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Test Users:');
  console.log('   Email: john@example.com | Password: password123');
  console.log('   Email: jane@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
