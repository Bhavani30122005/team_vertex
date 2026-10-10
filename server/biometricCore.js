/**
 * VERITY Server-Side Biometric Verification Engine
 * Implements strict fail-closed 128-D normalized embedding matching,
 * multi-face count detection, 5-frame temporal consistency, and enrollment uniqueness checks.
 */

const SIMILARITY_THRESHOLD = 0.82;
const INTER_FRAME_CONSISTENCY_THRESHOLD = 0.85;

/**
 * L2 Normalize a 128-dimensional embedding vector.
 * Returns null if vector is missing, wrong dimension, zero-length, or contains NaN/Infinity.
 */
function normalizeEmbedding(vec) {
  if (!vec || !Array.isArray(vec) || vec.length !== 128) {
    return null;
  }
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    const val = vec[i];
    if (val === null || val === undefined || isNaN(val) || !isFinite(val)) {
      return null;
    }
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq);
  if (norm === 0 || isNaN(norm) || !isFinite(norm)) {
    return null;
  }
  return vec.map(v => v / norm);
}

/**
 * Calculate Cosine Similarity between two 128-D vectors.
 * Returns 0.0 on invalid or non-matching inputs.
 */
function cosineSimilarity(vec1, vec2) {
  const norm1 = normalizeEmbedding(vec1);
  const norm2 = normalizeEmbedding(vec2);
  if (!norm1 || !norm2) {
    return 0.0;
  }
  let dot = 0;
  for (let i = 0; i < 128; i++) {
    dot += norm1[i] * norm2[i];
  }
  if (isNaN(dot) || !isFinite(dot)) {
    return 0.0;
  }
  return dot;
}

/**
 * Perform 5-Frame Temporal Biometric Verification.
 */
function verifyMultiFrame(enrolledEmbedding, frames) {
  try {
    const normEnrolled = normalizeEmbedding(enrolledEmbedding);
    if (!normEnrolled) {
      return {
        passed: false,
        status: 'rejected',
        score: 0.0,
        reason: 'REJECTED: Missing, zero, NaN, or corrupted enrolled student template embedding'
      };
    }

    if (!frames || !Array.isArray(frames) || frames.length < 5) {
      return {
        passed: false,
        status: 'rejected',
        score: 0.0,
        reason: `REJECTED: Minimum 5 frames required for temporal biometric verification. Received ${frames ? frames.length : 0}`
      };
    }

    const frameScores = [];
    const normFrameVectors = [];

    for (let i = 0; i < 5; i++) {
      const frame = frames[i];
      if (!frame) {
        return {
          passed: false,
          status: 'rejected',
          score: 0.0,
          reason: `REJECTED: Frame ${i + 1} is missing or invalid`
        };
      }

      const facesCount = typeof frame.detectedFacesCount === 'number' ? frame.detectedFacesCount : 1;
      if (facesCount === 0) {
        return {
          passed: false,
          status: 'rejected',
          score: 0.0,
          reason: `REJECTED: Exactly one face required in frame. Found 0 faces`
        };
      } else if (facesCount > 1) {
        return {
          passed: false,
          status: 'rejected',
          score: 0.0,
          reason: `REJECTED: Exactly one face required in frame. Found ${facesCount} faces`
        };
      }

      const normVec = normalizeEmbedding(frame.embedding || frame.vector_embedding);
      if (!normVec) {
        return {
          passed: false,
          status: 'rejected',
          score: 0.0,
          reason: `REJECTED: Zero, NaN, missing or invalid embedding size in frame ${i + 1}`
        };
      }

      const score = cosineSimilarity(normEnrolled, normVec);
      frameScores.push(score);
      normFrameVectors.push(normVec);
    }

    // Inter-frame face switching check
    for (let i = 0; i < normFrameVectors.length - 1; i++) {
      const interSim = cosineSimilarity(normFrameVectors[i], normFrameVectors[i + 1]);
      if (interSim < INTER_FRAME_CONSISTENCY_THRESHOLD) {
        return {
          passed: false,
          status: 'rejected',
          score: 0.0,
          reason: `REJECTED: Face switching detected between frame ${i + 1} and ${i + 2}`
        };
      }
    }

    // Median similarity score & majority pass
    const sortedScores = [...frameScores].sort((a, b) => a - b);
    const medianScore = sortedScores[2];
    const passingFramesCount = frameScores.filter(s => s >= SIMILARITY_THRESHOLD).length;

    const passed = medianScore >= SIMILARITY_THRESHOLD && passingFramesCount >= 3;

    return {
      passed,
      status: passed ? 'verified' : 'rejected',
      score: Math.round(medianScore * 1000) / 1000,
      passingFrames: passingFramesCount,
      reason: passed
        ? `Verification successful. All 5 frames verified. Median similarity: ${(medianScore * 100).toFixed(1)}%`
        : `REJECTED: Biometric similarity (${(medianScore * 100).toFixed(1)}%) below required threshold (${(SIMILARITY_THRESHOLD * 100).toFixed(1)}%)`
    };

  } catch (err) {
    // FAIL CLOSED ON EXCEPTION
    return {
      passed: false,
      status: 'rejected',
      score: 0.0,
      reason: `REJECTED: Fail closed server exception: ${err.message}`
    };
  }
}

/**
 * Check if a candidate enrollment embedding matches any existing student's template.
 */
function checkEnrollmentUniqueness(candidateEmbedding, existingTemplatesMap) {
  const normCandidate = normalizeEmbedding(candidateEmbedding);
  if (!normCandidate) {
    return { valid: false, reason: 'REJECTED: Invalid candidate enrollment embedding' };
  }

  for (const [studentId, templateVec] of Object.entries(existingTemplatesMap || {})) {
    const sim = cosineSimilarity(normCandidate, templateVec);
    if (sim >= SIMILARITY_THRESHOLD) {
      return {
        valid: false,
        matchedStudentId: studentId,
        reason: `REJECTED: Enrolled face matches an existing student template (${studentId}) in database`
      };
    }
  }

  return { valid: true };
}

module.exports = {
  SIMILARITY_THRESHOLD,
  INTER_FRAME_CONSISTENCY_THRESHOLD,
  normalizeEmbedding,
  cosineSimilarity,
  verifyMultiFrame,
  checkEnrollmentUniqueness
};
