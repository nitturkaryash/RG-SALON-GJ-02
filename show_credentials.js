/**
 * Simple script to show all hardcoded credentials
 * Works with any Node.js version and avoids console display issues
 */

// Hardcoded user credentials - completely independent system
const CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin', 
    role: 'admin',
    id: 'admin-001'
  },
  salon_admin: {
    username: 'salon_admin',
    password: 'password123',
    role: 'admin', 
    id: 'admin-002'
  },
  super_admin: {
    username: 'super_admin',
    password: 'super123',
    role: 'super_admin',
    id: 'admin-003'
  },
  admin123: {
    username: 'admin123', 
    password: 'admin123',
    role: 'admin',
    id: 'admin-004'
  },
  test_user: {
    username: 'test_user',
    password: 'test123', 
    role: 'user',
    id: 'user-001'
  }
};

console.log('HARDCODED AUTHENTICATION CREDENTIALS');
console.log('=====================================');
console.log('These credentials work 100% of the time, no external dependencies');
console.log('');

console.log('ADMIN ACCOUNTS:');
console.log('---------------');
console.log('1. Username: admin');
console.log('   Password: admin');
console.log('   Role: admin');
console.log('');
console.log('2. Username: salon_admin');
console.log('   Password: password123');
console.log('   Role: admin');
console.log('');
console.log('3. Username: super_admin');
console.log('   Password: super123');
console.log('   Role: super_admin');
console.log('');
console.log('4. Username: admin123');
console.log('   Password: admin123');
console.log('   Role: admin');
console.log('');

console.log('TEST ACCOUNT:');
console.log('-------------');
console.log('5. Username: test_user');
console.log('   Password: test123');
console.log('   Role: user');
console.log('');

console.log('AUTHENTICATION TEST:');
console.log('-------------------');

function authenticate(username, password) {
  const user = CREDENTIALS[username];
  if (user && user.password === password) {
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        authenticated: true,
        session_id: 'session_' + Date.now(),
        source: 'hardcoded'
      }
    };
  }
  return { success: false, error: 'Invalid credentials' };
}

// Test primary admin login
const adminTest = authenticate('admin', 'admin');
console.log('Testing admin/admin:', adminTest.success ? 'SUCCESS' : 'FAILED');

// Test alternative admin login  
const altTest = authenticate('salon_admin', 'password123');
console.log('Testing salon_admin/password123:', altTest.success ? 'SUCCESS' : 'FAILED');

// Test super admin login
const superTest = authenticate('super_admin', 'super123');
console.log('Testing super_admin/super123:', superTest.success ? 'SUCCESS' : 'FAILED');

// Test invalid login
const invalidTest = authenticate('wrong', 'wrong');
console.log('Testing wrong/wrong:', invalidTest.success ? 'FAILED (should not work)' : 'SUCCESS (correctly rejected)');

console.log('');
console.log('SUMMARY:');
console.log('--------');
console.log('Total accounts: ' + Object.keys(CREDENTIALS).length);
console.log('System: 100% independent, no external dependencies');
console.log('Recommended: Use admin/admin for primary access');
console.log('Alternative: Use salon_admin/password123 or super_admin/super123');
console.log('');
console.log('READY TO USE - No Supabase required!');

// Export for use in other modules
module.exports = {
  CREDENTIALS,
  authenticate
}; 