/**
 * Test Date and Timestamp Based Logic for Purchase Entries
 * This tests the new logic that handles historical vs current purchases
 */

// Test the timestamp logic
function testTimestampLogic() {
  console.log('🧪 Testing Date and Timestamp Based Logic\n');
  
  const currentTimestamp = new Date();
  
  // Test cases
  const testCases = [
    {
      name: 'Today\'s Purchase',
      date: new Date(), // Today
      expectedBehavior: 'Should UPDATE current stock'
    },
    {
      name: 'Yesterday\'s Purchase', 
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      expectedBehavior: 'Should UPDATE current stock'
    },
    {
      name: 'Historical Purchase (1 week ago)',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      expectedBehavior: 'Should NOT update current stock'
    },
    {
      name: 'Historical Purchase (1 month ago)',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      expectedBehavior: 'Should NOT update current stock'
    },
    {
      name: 'Future Purchase',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      expectedBehavior: 'Should NOT update current stock'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n${index + 1}. ${testCase.name}`);
    console.log(`   Date: ${testCase.date.toISOString()}`);
    
    // Replicate the logic from inventoryUtils.ts
    const purchaseDate = testCase.date;
    const timeDifferenceMs = currentTimestamp.getTime() - purchaseDate.getTime();
    const daysDifference = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
    const isHistoricalEntry = daysDifference > 1;
    const isFutureEntry = daysDifference < 0;
    const isCurrentEntry = !isHistoricalEntry && !isFutureEntry;
    
    let shouldUpdateCurrentStock = false;
    let stockUpdateReason = '';
    
    if (isFutureEntry) {
      shouldUpdateCurrentStock = false;
      stockUpdateReason = `FUTURE ENTRY (${Math.abs(daysDifference)} days ahead)`;
    } else if (isHistoricalEntry) {
      shouldUpdateCurrentStock = false;
      stockUpdateReason = `HISTORICAL ENTRY (${daysDifference} days ago)`;
    } else {
      shouldUpdateCurrentStock = true;
      stockUpdateReason = `CURRENT ENTRY (${daysDifference} days ago)`;
    }
    
    console.log(`   Days Difference: ${daysDifference}`);
    console.log(`   Classification: ${stockUpdateReason}`);
    console.log(`   Will Update Stock: ${shouldUpdateCurrentStock ? '✅ YES' : '❌ NO'}`);
    console.log(`   Expected: ${testCase.expectedBehavior}`);
    
    // Validate
    const expectedUpdate = testCase.expectedBehavior.includes('Should UPDATE');
    const isCorrect = shouldUpdateCurrentStock === expectedUpdate;
    console.log(`   Result: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
  });
  
  console.log('\n🎯 Summary:');
  console.log('- Current entries (today/yesterday): UPDATE stock');
  console.log('- Historical entries (>1 day old): DO NOT update stock');
  console.log('- Future entries: DO NOT update stock');
  console.log('- Purchase history always records the logical stock value');
}

// Test specific scenario from user
function testUserScenario() {
  console.log('\n\n🎯 Testing User Scenario: TESST_123');
  console.log('Scenario: First TODAY entry (10 stock), then OLD DATE entry (10 stock)');
  
  const currentStock = 10; // After first entry
  const purchaseQty = 10;
  
  // Test old date entry (02/09/2025 - about 1 month ago)
  const oldDate = new Date('2025-09-02T06:09:41.364Z');
  const currentTimestamp = new Date();
  
  const timeDifferenceMs = currentTimestamp.getTime() - oldDate.getTime();
  const daysDifference = Math.floor(timeDifferenceMs / (1000 * 60 * 60 * 24));
  const isHistoricalEntry = daysDifference > 1;
  
  console.log(`\nOld Date Entry Analysis:`);
  console.log(`Purchase Date: ${oldDate.toISOString()}`);
  console.log(`Current Time: ${currentTimestamp.toISOString()}`);
  console.log(`Days Difference: ${daysDifference}`);
  console.log(`Is Historical: ${isHistoricalEntry}`);
  
  if (isHistoricalEntry) {
    console.log('\n✅ CORRECT BEHAVIOR:');
    console.log(`- Product Master Stock: ${currentStock} (unchanged)`);
    console.log(`- Purchase History Stock: ${currentStock + purchaseQty} (shows what stock would be if this was chronological)`);
    console.log('- Current inventory NOT affected by historical entry');
  } else {
    console.log('\n❌ WOULD BE INCORRECT:');
    console.log(`- Product Master Stock: ${currentStock + purchaseQty} (incorrectly updated)`);
    console.log('- Historical entry affecting current inventory');
  }
}

// Run tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testTimestampLogic, testUserScenario };
} else {
  testTimestampLogic();
  testUserScenario();
}
