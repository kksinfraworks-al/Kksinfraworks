async function testWorkflow() {
  const BASE = 'http://localhost:3000';

  console.log('--- 1. Login as Proprietor (Kalindra Kumar Singh) ---');
  const loginRes1 = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'kalindra', password: 'KKS@Admin2002' }),
  });
  const data1 = await loginRes1.json();
  if (!data1.token) throw new Error('Proprietor login failed');
  console.log('✓ Proprietor Logged In:', data1.user.name, 'Role:', data1.user.role);

  console.log('--- 2. Login as Site Manager (Ramesh Sharma) ---');
  const loginRes2 = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'sitemanager', password: 'KKS@Site2026' }),
  });
  const data2 = await loginRes2.json();
  if (!data2.token) throw new Error('Site Manager login failed');
  console.log('✓ Site Manager Logged In:', data2.user.name, 'Role:', data2.user.role);

  const token1 = data1.token;
  const token2 = data2.token;

  console.log('--- 3. User 1 (Proprietor) adds a new worker ---');
  const newWorkerRes = await fetch(`${BASE}/api/workers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      id: 'KKS015',
      name: 'Rampravesh Bind',
      fatherName: 'Kameshwar Bind',
      mobile: '9835999888',
      villageAddress: 'Village Bairia, Mairwa, Siwan, Bihar',
      workCategory: 'Shuttering Carpenter',
      skillLevel: 'Skilled',
      designation: 'Shuttering Mistri',
      rate: 750,
      assignedSiteId: 'SITE-01',
      status: 'active',
    }),
  });
  const createdWorker = await newWorkerRes.json();
  console.log('✓ Worker created:', createdWorker.name, 'ID:', createdWorker.id);

  console.log('--- 4. User 2 (Site Manager) marks attendance for new worker ---');
  const today = new Date().toISOString().split('T')[0];
  const attRes = await fetch(`${BASE}/api/attendance/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`,
    },
    body: JSON.stringify({
      siteId: 'SITE-01',
      date: today,
      records: [
        {
          workerId: 'KKS015',
          workerName: 'Rampravesh Bind',
          status: 'present',
          checkInTime: '08:00 AM',
          overtimeHours: 2,
          remarks: 'Beam shuttering line level',
        },
      ],
    }),
  });
  const attResult = await attRes.json();
  console.log('✓ User 2 marked attendance:', attResult.count, 'record(s)');

  console.log('--- 5. User 1 (Proprietor) records advance payment ---');
  const advRes = await fetch(`${BASE}/api/advances`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      workerId: 'KKS015',
      date: today,
      type: 'advance',
      amount: 1500,
      paymentMethod: 'UPI',
      purpose: 'Medicine advance for family',
      siteId: 'SITE-01',
      referenceNumber: 'UPI/TEST998811',
    }),
  });
  const createdAdv = await advRes.json();
  console.log('✓ User 1 recorded advance: ₹', createdAdv.amount, 'for', createdAdv.workerName);

  console.log('--- 6. User 2 (Site Manager) submits daily site report ---');
  const repRes = await fetch(`${BASE}/api/site-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`,
    },
    body: JSON.stringify({
      reportDate: today,
      siteId: 'SITE-01',
      workLocation: 'Block B: 1st Floor Beam Bottom Shuttering',
      workCategory: 'Beam Shuttering',
      workCompletedToday: 'Beam bottoms laid for grid 3 to 6',
      workInProgress: 'Side shuttering fixing',
      quantityCompleted: 120,
      unit: 'running ft',
      workersCount: 4,
      supervisorName: 'Ramesh Sharma',
      materialsUsed: '3.5m steel props, 12mm ply cut strips',
      hasProblemsOrDelays: false,
      descriptionHindiEnglish:
        'Block B: 1st Floor beam bottom shuttering completed for 120 running ft. Rebar placement ready to start.\n(ब्लॉक B: पहली मंजिल की बीम बॉटम शटरिंग 120 रनिंग फीट पूरी हुई।)',
    }),
  });
  const createdRep = await repRes.json();
  console.log('✓ User 2 submitted work report:', createdRep.workLocation);

  console.log('--- 7. User 2 (Site Manager) creates tomorrow plan ---');
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const planRes = await fetch(`${BASE}/api/next-day-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`,
    },
    body: JSON.stringify({
      planDate: tomorrow,
      siteId: 'SITE-01',
      expectedWork: 'Fix beam side shuttering and lay slab centering sheets',
      workLocation: 'Block B: 1st Floor Slab',
      expectedWorkersCount: 5,
      priority: 'high',
      assignedTeam: 'Rampravesh Mistri (Lead) + 4 helpers',
      materialsRequired: 'Shuttering plates 50 nos, adjustable props 30 nos',
      responsibleSupervisor: 'Ramesh Sharma',
      safetyPrecautions: 'Edge guard rails installed before slab centering',
    }),
  });
  const createdPlan = await planRes.json();
  console.log('✓ User 2 created tomorrow plan for:', createdPlan.planDate);

  console.log('--- 8. Confirm User 1 (Proprietor) sees User 2 data via SYNC ---');
  const syncRes = await fetch(`${BASE}/api/sync`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const syncData = await syncRes.json();

  const foundWorker = syncData.data.workers.find((w) => w.id === 'KKS015');
  const foundAtt = syncData.data.attendance.find((a) => a.workerId === 'KKS015' && a.date === today);
  const foundRep = syncData.data.siteReports.find((r) => r.id === createdRep.id);
  const foundPlan = syncData.data.nextDayPlans.find((p) => p.id === createdPlan.id);

  if (!foundWorker || !foundAtt || !foundRep || !foundPlan) {
    throw new Error('Sync verification failed! Records not found in shared online database.');
  }

  console.log('✓ Shared Online Database Verification Successful!');
  console.log('  - Worker synchronized:', foundWorker.name);
  console.log('  - Attendance synchronized:', foundAtt.status, 'OT:', foundAtt.overtimeHours);
  console.log('  - Site Report synchronized:', foundRep.workLocation);
  console.log('  - Tomorrow Plan synchronized:', foundPlan.expectedWork);
  console.log('=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

testWorkflow().catch((err) => {
  console.error('Workflow test failed:', err);
  process.exit(1);
});
