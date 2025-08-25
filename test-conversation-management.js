// Test script to verify conversation management fixes
// Run this in browser console on the chat page

console.log('🧪 Starting Conversation Management Tests...');

// Test 1: Check if multiple API calls are being made
let apiCallCount = 0;
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0].includes('/api/conversations')) {
    apiCallCount++;
    console.log(`📡 API Call #${apiCallCount}: ${args[0]}`);
  }
  return originalFetch.apply(this, args);
};

// Test 2: Monitor for page reloads
let reloadCount = 0;
const originalReload = window.location.reload;
window.location.reload = function() {
  reloadCount++;
  console.log(`🔄 Page Reload #${reloadCount}`);
  return originalReload.apply(this, arguments);
};

// Test 3: Monitor router navigation
let navigationCount = 0;
const originalPushState = history.pushState;
history.pushState = function() {
  navigationCount++;
  console.log(`🧭 Navigation #${navigationCount}: ${arguments[2]}`);
  return originalPushState.apply(this, arguments);
};

// Test functions
window.testConversationManagement = {
  // Reset counters
  reset: () => {
    apiCallCount = 0;
    reloadCount = 0;
    navigationCount = 0;
    console.log('🔄 Counters reset');
  },
  
  // Get current stats
  getStats: () => {
    return {
      apiCalls: apiCallCount,
      reloads: reloadCount,
      navigations: navigationCount
    };
  },
  
  // Test conversation creation
  testCreate: async () => {
    console.log('🧪 Testing conversation creation...');
    const beforeStats = window.testConversationManagement.getStats();
    
    // Simulate clicking new conversation button
    const newButton = document.querySelector('button[class*="bg-gradient-to-r"]');
    if (newButton) {
      newButton.click();
      
      // Wait for operation to complete
      setTimeout(() => {
        const afterStats = window.testConversationManagement.getStats();
        console.log('📊 Create Test Results:', {
          before: beforeStats,
          after: afterStats,
          apiCallsAdded: afterStats.apiCalls - beforeStats.apiCalls,
          reloadsAdded: afterStats.reloads - beforeStats.reloads,
          navigationsAdded: afterStats.navigations - beforeStats.navigations
        });
      }, 2000);
    } else {
      console.log('❌ New conversation button not found');
    }
  },
  
  // Test conversation deletion
  testDelete: async () => {
    console.log('🧪 Testing conversation deletion...');
    const beforeStats = window.testConversationManagement.getStats();
    
    // Find a delete button
    const deleteButton = document.querySelector('button[title="Delete conversation"]');
    if (deleteButton) {
      deleteButton.click();
      
      // Wait for operation to complete
      setTimeout(() => {
        const afterStats = window.testConversationManagement.getStats();
        console.log('📊 Delete Test Results:', {
          before: beforeStats,
          after: afterStats,
          apiCallsAdded: afterStats.apiCalls - beforeStats.apiCalls,
          reloadsAdded: afterStats.reloads - beforeStats.reloads,
          navigationsAdded: afterStats.navigations - beforeStats.navigations
        });
      }, 2000);
    } else {
      console.log('❌ Delete button not found');
    }
  },
  
  // Test conversation renaming
  testRename: async () => {
    console.log('🧪 Testing conversation renaming...');
    const beforeStats = window.testConversationManagement.getStats();
    
    // Find an edit button
    const editButton = document.querySelector('button[title="Edit conversation"]');
    if (editButton) {
      editButton.click();
      
      // Wait a bit then simulate typing
      setTimeout(() => {
        const input = document.querySelector('input[class*="bg-[#0f0c29]"]');
        if (input) {
          input.value = 'Test Renamed Conversation';
          input.blur(); // Trigger save
          
          // Wait for operation to complete
          setTimeout(() => {
            const afterStats = window.testConversationManagement.getStats();
            console.log('📊 Rename Test Results:', {
              before: beforeStats,
              after: afterStats,
              apiCallsAdded: afterStats.apiCalls - beforeStats.apiCalls,
              reloadsAdded: afterStats.reloads - beforeStats.reloads,
              navigationsAdded: afterStats.navigations - beforeStats.navigations
            });
          }, 2000);
        }
      }, 500);
    } else {
      console.log('❌ Edit button not found');
    }
  },
  
  // Run all tests
  runAllTests: async () => {
    console.log('🚀 Running all conversation management tests...');
    window.testConversationManagement.reset();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await window.testConversationManagement.testCreate();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await window.testConversationManagement.testRename();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    await window.testConversationManagement.testDelete();
    
    setTimeout(() => {
      const finalStats = window.testConversationManagement.getStats();
      console.log('🏁 Final Test Results:', finalStats);
      
      // Analyze results
      if (finalStats.reloads === 0) {
        console.log('✅ SUCCESS: No page reloads detected');
      } else {
        console.log('❌ ISSUE: Page reloads detected:', finalStats.reloads);
      }
      
      if (finalStats.apiCalls <= 6) { // Reasonable number for 3 operations
        console.log('✅ SUCCESS: API calls within expected range');
      } else {
        console.log('❌ ISSUE: Too many API calls:', finalStats.apiCalls);
      }
    }, 10000);
  }
};

console.log('✅ Test utilities loaded. Use window.testConversationManagement.runAllTests() to start testing.');
console.log('📋 Available methods:');
console.log('  - reset(): Reset counters');
console.log('  - getStats(): Get current stats');
console.log('  - testCreate(): Test conversation creation');
console.log('  - testDelete(): Test conversation deletion');
console.log('  - testRename(): Test conversation renaming');
console.log('  - runAllTests(): Run all tests automatically');
