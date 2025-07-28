import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Railway-ready build process...');

try {
  // Step 1: Build the client
  console.log('📦 Building client...');
  if (fs.existsSync('client')) {
    process.chdir('client');
    
    // Install client dependencies if node_modules doesn't exist
    if (!fs.existsSync('node_modules')) {
      console.log('📥 Installing client dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    // Build the client
    execSync('npm run build', { stdio: 'inherit' });
    process.chdir('..');
    console.log('✅ Client build complete');
  } else {
    console.log('⚠️  Client directory not found, skipping client build');
  }

  // Step 2: Verify server.js exists
  if (fs.existsSync('server.js')) {
    console.log('✅ Server file ready');
  } else {
    console.log('❌ server.js not found');
    process.exit(1);
  }

  // Step 3: Create production info
  const buildInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    environment: 'production'
  };
  
  fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));
  console.log('✅ Build info created');

  console.log('🎉 Build process completed successfully!');
  console.log('📋 Ready for Railway deployment with:');
  console.log('   - Express server on port 8080');
  console.log('   - Client build served from client/dist');
  console.log('   - Health check at /api/health');
  console.log('   - Login endpoint at /api/auth/login');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}