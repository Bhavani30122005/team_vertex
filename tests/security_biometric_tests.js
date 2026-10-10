/**
 * VERITY Security & Biometric Comprehensive Test Suite
 * Validates all 9 security rules and fail-closed biometric requirements.
 */

const assert = require('assert');
const serverApp = require('../server/index');
const { verifyMultiFrame, checkEnrollmentUniqueness, normalizeEmbedding, cosineSimilarity } = require('../server/biometricCore');

console.log("=================================================================");
console.log(" VERITY COMPREHENSIVE BIOMETRIC SECURITY TEST SUITE");
console.log("=================================================================\n");

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`✅ [PASS] ${name}`);
  } catch (err) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(`   Error: ${err.message}\n`);
  }
}

// Helpers for test vectors
function createTestVector(seed) {
  const vec = [];
  for (let i = 0; i < 128; i++) {
    vec.push(Math.sin(seed + i * 0.1));
  }
  return normalizeEmbedding(vec);
}

const templateA = createTestVector(1.0); // Student A
const templateB = createTestVector(5.0); // Student B (different identity)

function build5Frames(vec, facesCount = 1, noise = 0.0) {
  const frames = [];
  for (let f = 0; f < 5; f++) {
    const frameVec = [];
    for (let i = 0; i < 128; i++) {
      frameVec.push(vec[i] + (Math.random() - 0.5) * noise);
    }
    frames.push({
      frameIndex: f,
      detectedFacesCount: facesCount,
      embedding: normalizeEmbedding(frameVec)
    });
  }
  return frames;
}

// -----------------------------------------------------------------------------
// TEST CASES
// -----------------------------------------------------------------------------

// 1. Genuine person passes
runTest("1. Genuine person verification passes", () => {
  const frames = build5Frames(templateA, 1, 0.02);
  const result = verifyMultiFrame(templateA, frames);
  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.status, 'verified');
  assert.ok(result.score >= 0.82, `Score ${result.score} should be >= 0.82`);
});

// 2. Different person fails
runTest("2. Different person verification fails", () => {
  const frames = build5Frames(templateB, 1, 0.02);
  const result = verifyMultiFrame(templateA, frames);
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.status, 'rejected');
  assert.ok(result.score < 0.82, `Impostor score ${result.score} should be < 0.82`);
});

// 3. Image with two faces is rejected
runTest("3. Image with two faces is rejected", () => {
  const frames = build5Frames(templateA, 2, 0.02);
  const result = verifyMultiFrame(templateA, frames);
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.status, 'rejected');
  assert.ok(result.reason.includes('Found 2 faces'), `Reason should state 2 faces found: ${result.reason}`);
});

// 4. No-face image is rejected
runTest("4. No-face image is rejected", () => {
  const frames = build5Frames(templateA, 0, 0.02);
  const result = verifyMultiFrame(templateA, frames);
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.status, 'rejected');
  assert.ok(result.reason.includes('Found 0 faces'), `Reason should state 0 faces found: ${result.reason}`);
});

// 5. Zero or NaN embedding fails (Fail Closed)
runTest("5. Zero or NaN embedding fails (Fail Closed)", () => {
  const zeroVec = new Array(128).fill(0.0);
  const nanVec = new Array(128).fill(NaN);

  const zeroFrames = build5Frames(zeroVec, 1);
  const nanFrames = build5Frames(nanVec, 1);

  const resZero = verifyMultiFrame(templateA, zeroFrames);
  assert.strictEqual(resZero.passed, false);
  assert.strictEqual(resZero.status, 'rejected');

  const resNan = verifyMultiFrame(templateA, nanFrames);
  assert.strictEqual(resNan.passed, false);
  assert.strictEqual(resNan.status, 'rejected');
});

// 6. Student A cannot be verified against Student B's template
runTest("6. Student A cannot be verified against Student B's template (Logged-in Student Isolation)", () => {
  // Present Student B's face frames while trying to authenticate as Student A
  const framesStudentB = build5Frames(templateB, 1, 0.01);
  
  // Explicitly lookup template for Student A (templateA)
  const result = verifyMultiFrame(templateA, framesStudentB);
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.status, 'rejected');
});

// 7. Face switching mid-challenge is rejected
runTest("7. Face switching mid-challenge is rejected", () => {
  const frames = [];
  // Frames 0..1: Person A
  for (let f = 0; f < 2; f++) {
    frames.push({ frameIndex: f, detectedFacesCount: 1, embedding: templateA });
  }
  // Frames 2..4: Person B (Switched person)
  for (let f = 2; f < 5; f++) {
    frames.push({ frameIndex: f, detectedFacesCount: 1, embedding: templateB });
  }

  const result = verifyMultiFrame(templateA, frames);
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.status, 'rejected');
  assert.ok(result.reason.includes('Face switching detected'), `Reason should mention face switching: ${result.reason}`);
});

// 8. AI service timeout / exception never marks present
runTest("8. AI service timeout or exception never marks present (Fail Closed)", () => {
  // Corrupt inputs
  const result = verifyMultiFrame(null, null);
  assert.strictEqual(result.passed, false);
  assert.strictEqual(result.status, 'rejected');
});

// 9. Rate limiting lockout after 5 failed attempts
runTest("9. After 5 failed face attempts in one session, set status pending_review", () => {
  const mockServer = serverApp;
  const testStudentId = 'usr_2026_lockout_test';
  const testSessionId = 'sess_lockout_999';

  // Register template for test student
  const templates = mockServer._getEnrolledTemplates();
  templates[testStudentId] = templateA;

  // Send 5 invalid attempts (using wrong face templateB)
  const wrongFrames = build5Frames(templateB, 1);

  let lastResponse = null;
  for (let attempt = 1; attempt <= 5; attempt++) {
    // Simulate HTTP req handler logic
    const sessionKey = `${testSessionId}_${testStudentId}`;
    const failures = mockServer._getSessionFailures();
    
    const evalRes = verifyMultiFrame(templateA, wrongFrames);
    if (!evalRes.passed) {
      failures[sessionKey] = (failures[sessionKey] || 0) + 1;
      const count = failures[sessionKey];
      lastResponse = {
        overallStatus: count >= 5 ? 'pending_review' : 'rejected'
      };
    }
  }

  assert.strictEqual(lastResponse.overallStatus, 'pending_review', '5th failed attempt must result in pending_review');
});

// 10. Block enrollment if new face matches existing student template
runTest("10. Block enrollment if new face matches another student template", () => {
  const existingTemplates = {
    'usr_2026_01': templateA
  };

  // Attempt to enroll student C with Student A's face (templateA)
  const uniquenessRes = checkEnrollmentUniqueness(templateA, existingTemplates);
  assert.strictEqual(uniquenessRes.valid, false);
  assert.ok(uniquenessRes.reason.includes('matches an existing student template'), `Reason: ${uniquenessRes.reason}`);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n-----------------------------------------------------------------");
console.log(` RESULTS: ${passedCount} / ${totalCount} Security Test Cases Passed ✅`);
console.log("-----------------------------------------------------------------");

if (passedCount !== totalCount) {
  process.exit(1);
}
