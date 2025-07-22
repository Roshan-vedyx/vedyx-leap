// runSeeder.js - Enhanced with debugging
import { config } from 'dotenv';
import { seedDatabase } from './sampleDataSeeder.js';

// Load environment variables
config();

console.log('🔧 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Firebase project from env:', process.env.VITE_FIREBASE_PROJECT_ID || 'NOT SET');

// Add some delay to ensure Firebase is properly initialized
await new Promise(resolve => setTimeout(resolve, 1000));

console.log('🌱 Starting database seeding...');

seedDatabase()
  .then(() => {
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed with error:', err.code || 'NO_CODE');
    console.error('Error message:', err.message);
    
    // Provide specific troubleshooting based on error type
    if (err.message && err.message.includes('Invalid resource field value')) {
      console.error('\n🔍 TROUBLESHOOTING TIPS:');
      console.error('1. Check your Firebase project configuration');
      console.error('2. Verify your .env file contains correct Firebase credentials');
      console.error('3. Make sure FIREBASE_PROJECT_ID or GOOGLE_CLOUD_PROJECT is set');
      console.error('4. Run the diagnostic script: node firebaseDiagnostic.js');
      console.error('5. Check Firestore Security Rules allow writes');
    }
    
    if (err.code === 'permission-denied') {
      console.error('\n🔒 This is a Firestore Security Rules issue');
      console.error('Update your rules to allow writes or use proper authentication');
    }
    
    // Print full error details for debugging
    console.error('\n🐛 Full error details:');
    console.error(err);
    
    process.exit(1);
  });