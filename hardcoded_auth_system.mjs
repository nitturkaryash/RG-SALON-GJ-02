/**
 * Hardcoded Authentication System
 * This system works completely independently of Supabase
 * Multiple admin credentials for guaranteed access
 */

// Hardcoded user database - completely independent of Supabase
const HARDCODED_USERS = {
  // Primary admin accounts
  'admin': {
    username: 'admin',
    password: 'admin',
    id: 'hardcoded-admin-001',
    role: 'admin',
    email: 'admin@salon.local',
    is_active: true,
    source: 'hardcoded',
    permissions: ['all']
  },
  'admin123': {
    username: 'admin123',
    password: 'admin123',
    id: 'hardcoded-admin-002',
    role: 'admin',
    email: 'admin123@salon.local',
    is_active: true,
    source: 'hardcoded',
    permissions: ['all']
  },
  'salon_admin': {
    username: 'salon_admin',
    password: 'password123',
    id: 'hardcoded-admin-003',
    role: 'admin',
    email: 'salon_admin@salon.local',
    is_active: true,
    source: 'hardcoded',
    permissions: ['all']
  },
  'test_user': {
    username: 'test_user',
    password: 'test123',
    id: 'hardcoded-user-001',
    role: 'user',
    email: 'test@salon.local',
    is_active: true,
    source: 'hardcoded',
    permissions: ['read', 'write']
  },
  'super_admin': {
    username: 'super_admin',
    password: 'super123',
    id: 'hardcoded-super-001',
    role: 'super_admin',
    email: 'super@salon.local',
    is_active: true,
    source: 'hardcoded',
    permissions: ['all', 'system_admin']
  }
};

/**
 * Hardcoded Authentication Function
 * Returns user if credentials match, null otherwise
 */
function authenticateUser(username, password) {
  console.log(`🔐 Attempting hardcoded authentication for: ${username}`);
  
  // Check if user exists
  if (!HARDCODED_USERS[username]) {
    console.log(`❌ User '${username}' not found in hardcoded database`);
    return null;
  }
  
  const user = HARDCODED_USERS[username];
  
  // Check if account is active
  if (!user.is_active) {
    console.log(`❌ Account '${username}' is inactive`);
    return null;
  }
  
  // Check password
  if (user.password !== password) {
    console.log(`❌ Invalid password for user '${username}'`);
    return null;
  }
  
  console.log(`✅ Authentication successful for '${username}' (${user.role})`);
  
  // Return user without password
  const { password: _, ...safeUser } = user;
  return {
    ...safeUser,
    authenticated_at: new Date().toISOString(),
    session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

/**
 * List all available hardcoded users
 */
function listAvailableUsers() {
  console.log('\n👥 Available Hardcoded Users:');
  console.log('=' .repeat(50));
  
  Object.values(HARDCODED_USERS).forEach((user, index) => {
    console.log(`${index + 1}. Username: ${user.username}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Status: ${user.is_active ? 'Active' : 'Inactive'}`);
    console.log('');
  });
}

/**
 * Test all hardcoded credentials
 */
function testAllCredentials() {
  console.log('\n🧪 Testing All Hardcoded Credentials...');
  console.log('=' .repeat(50));
  
  const results = [];
  
  Object.values(HARDCODED_USERS).forEach(user => {
    const result = authenticateUser(user.username, user.password);
    results.push({
      username: user.username,
      password: user.password,
      success: result !== null,
      role: user.role,
      result: result
    });
  });
  
  console.log('\n📊 Test Results:');
  results.forEach(test => {
    const status = test.success ? '✅ PASSED' : '❌ FAILED';
    console.log(`   ${test.username}/${test.password}: ${status} (${test.role})`);
  });
  
  return results;
}

/**
 * Create a session for a user
 */
function createUserSession(username, password) {
  const user = authenticateUser(username, password);
  
  if (!user) {
    return {
      success: false,
      error: 'Authentication failed',
      user: null,
      session: null
    };
  }
  
  const session = {
    session_id: user.session_id,
    user_id: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    created_at: user.authenticated_at,
    expires_at: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(), // 24 hours
    source: 'hardcoded_auth'
  };
  
  return {
    success: true,
    user: user,
    session: session,
    token: `hardcoded_token_${user.session_id}`
  };
}

/**
 * Validate a session
 */
function validateSession(sessionId) {
  // In a real system, you'd check against a session store
  // For hardcoded system, we'll just validate the format
  if (sessionId && sessionId.startsWith('session_')) {
    return {
      valid: true,
      message: 'Hardcoded session valid'
    };
  }
  
  return {
    valid: false,
    message: 'Invalid session format'
  };
}

/**
 * Main demonstration function
 */
function demonstrateHardcodedAuth() {
  console.log('🔒 HARDCODED AUTHENTICATION SYSTEM');
  console.log('=' .repeat(60));
  console.log('This system works completely independently of Supabase');
  console.log('All credentials are hardcoded and guaranteed to work');
  console.log('');
  
  // List available users
  listAvailableUsers();
  
  // Test all credentials
  const testResults = testAllCredentials();
  
  // Demonstrate session creation
  console.log('\n🔑 Creating Session Examples:');
  console.log('=' .repeat(50));
  
  // Test primary admin login
  const adminSession = createUserSession('admin', 'admin');
  if (adminSession.success) {
    console.log('✅ Admin session created successfully');
    console.log(`   Session ID: ${adminSession.session.session_id}`);
    console.log(`   Token: ${adminSession.token}`);
    console.log(`   Role: ${adminSession.user.role}`);
    console.log(`   Permissions: ${adminSession.user.permissions.join(', ')}`);
  }
  
  // Test alternative admin login
  console.log('');
  const altAdminSession = createUserSession('salon_admin', 'password123');
  if (altAdminSession.success) {
    console.log('✅ Alternative admin session created successfully');
    console.log(`   Username: ${altAdminSession.user.username}`);
    console.log(`   Role: ${altAdminSession.user.role}`);
  }
  
  // Test invalid login
  console.log('');
  const invalidSession = createUserSession('wrong', 'wrong');
  if (!invalidSession.success) {
    console.log('✅ Invalid credentials correctly rejected');
    console.log(`   Error: ${invalidSession.error}`);
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('=' .repeat(50));
  console.log(`✅ Total users available: ${Object.keys(HARDCODED_USERS).length}`);
  console.log(`✅ Working credentials: ${testResults.filter(r => r.success).length}`);
  console.log('✅ No Supabase dependency');
  console.log('✅ Always available');
  
  console.log('\n🚀 RECOMMENDED CREDENTIALS:');
  console.log('  Primary: admin / admin');
  console.log('  Alternative: salon_admin / password123');
  console.log('  Super Admin: super_admin / super123');
  
  return {
    totalUsers: Object.keys(HARDCODED_USERS).length,
    workingCredentials: testResults.filter(r => r.success).length,
    recommendedLogins: [
      { username: 'admin', password: 'admin', role: 'admin' },
      { username: 'salon_admin', password: 'password123', role: 'admin' },
      { username: 'super_admin', password: 'super123', role: 'super_admin' }
    ]
  };
}

// Export functions for use in other modules
export {
  authenticateUser,
  listAvailableUsers,
  testAllCredentials,
  createUserSession,
  validateSession,
  demonstrateHardcodedAuth,
  HARDCODED_USERS
};

// Run demonstration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateHardcodedAuth();
} 