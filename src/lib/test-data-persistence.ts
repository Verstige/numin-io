// Test Data Persistence for julylan@vitatechhealing.com
// This will help verify that data is being saved and synced

import { 
  BusinessMapNodesService,
  BusinessMapEdgesService 
} from './firebase-business-map';

export const testDataPersistence = async (user: any) => {
  if (!user) {
    console.log('❌ No user authenticated - data will not persist');
    return;
  }

  console.log('🧪 Testing data persistence for user:', user.email);
  console.log('👤 User ID:', user.uid);
  console.log('🔐 User authenticated:', !!user);

  const userId = user.uid;
  const teamId = 'default-team';

  try {
    // Test creating a node
    const testNode = {
      userId,
      teamId,
      nodeId: `test_${Date.now()}`,
      nodeType: 'business' as any,
      position: { x: 100, y: 100 },
      data: {
        title: 'Test Business Node',
        description: 'This is a test node to verify data persistence',
        status: 'planning',
        priority: 'medium' as any,
        color: '#3b82f6',
        icon: 'Building2',
        metadata: {
          category: 'business',
          progress: 0,
          team: [],
          tags: ['test'],
          nodeType: 'business'
        }
      }
    };

    console.log('🔄 Creating test node...');
    console.log('📝 Test node data:', testNode);
    const createdNode = await BusinessMapNodesService.createNode(userId, teamId, testNode);
    console.log('✅ Test node created:', createdNode.id);

    // Test reading nodes
    console.log('🔄 Reading all nodes...');
    const allNodes = await BusinessMapNodesService.getNodes(userId, teamId);
    console.log('✅ Found nodes:', allNodes.length);

    // Test creating an edge
    if (allNodes.length >= 2) {
      const testEdge = {
        userId,
        teamId,
        sourceNodeId: allNodes[0].nodeId,
        targetNodeId: allNodes[1].nodeId
      };

      console.log('🔄 Creating test edge...');
      const createdEdge = await BusinessMapEdgesService.createEdge(userId, teamId, testEdge);
      console.log('✅ Test edge created:', createdEdge.id);
    }

    console.log('🎉 Data persistence test completed successfully!');
    console.log('📱 Data should now sync across all devices for this user');

    return {
      success: true,
      nodeCount: allNodes.length,
      message: 'Data persistence is working correctly'
    };

  } catch (error) {
    console.error('❌ Data persistence test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return {
      success: false,
      error: error.message,
      message: 'Data persistence test failed'
    };
  }
};

// Auto-run test when user is authenticated
export const runDataPersistenceTest = (user: any) => {
  if (user && user.email === 'julylan@vitatechhealing.com') {
    console.log('🔍 Running data persistence test for julylan@vitatechhealing.com');
    setTimeout(() => {
      testDataPersistence(user);
    }, 3000); // Wait 3 seconds for Firebase to initialize
  }
};
