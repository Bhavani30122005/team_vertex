# Root Cause Analysis: Biometric Face Recognition Vulnerabilities

## Executive Summary
A critical security vulnerability allowed unauthorized check-ins and false face verification acceptances in the VERITY Smart Attendance Platform. Even when a different person's face was presented, or when multiple faces were present in the camera frame, the system verified attendance as authentic.

---

## Detailed Technical Root Causes

### 1. Client-Side Score Delegation & Server Trust Flaw (`server/index.js`)
* **Vulnerability**: The server verification endpoint `/api/v1/verification/verify` relied on `faceMatchScore` provided directly by the browser in the HTTP POST request payload (`req.body.faceMatchScore`).
* **Impact**: The client browser calculated or simulated the score locally and passed it to the server. Anyone could bypass verification by crafting a request with `faceMatchScore: 98.4`. The server did not perform server-side feature extraction or template matching against the database.

### 2. Mock AI Microservice Random Score Generation & Fixed Face Count (`ai_service/main.py`)
* **Vulnerability**: The AI microservice endpoint `/api/v1/face/compare` generated pseudo-random match percentages between `96.0%` and `99.5%` for all incoming image payloads unless the literal substring `"unmatched"` was in the Base64 image string.
* **Impact**: Real face features were ignored. Any image—whether showing a different person, two people, an empty room, or a photo—was awarded a ~98% match score. Furthermore, `detected_faces_count` was hardcoded to `1`, disabling multi-face detection and empty-frame validation.

### 3. Lack of Multi-Frame Consistency & Temporal Verification (`VerificationExperience.tsx`)
* **Vulnerability**: Verification evaluated only a single instant frame snapshot rather than requiring multi-frame consistency across time.
* **Impact**: Transient frames, face-switching mid-verification challenge, or single static photo reflection could pass verification without validating temporal stability across consecutive frames.

### 4. Permissive Fallbacks & Failure to Fail Closed (`src/utils/faceMatcher.ts`)
* **Vulnerability**: Catch blocks and error handlers in the frontend and fallback logic returned default passing scores (e.g. `94.8%` or `92.0%`) whenever canvas errors, network timeouts, or missing image attributes occurred.
* **Impact**: System violated the security principle of "Fail Closed". Any model exception, empty image, or network failure defaulted to marking the student present.

### 5. Absence of Enrollment Cross-Student Uniqueness Guards (`src/services/db.ts`)
* **Vulnerability**: Student enrollment (`registerStudentFace`) updated facial templates without verifying whether the new face matched an existing student's template in the database.
* **Impact**: Allowed duplicate face registration across multiple student accounts, enabling identity impersonation.

---

## Remediation Architecture

1. **Server-Side Enforcement**: All feature extraction, face detection, multi-face validation, normalization, and template distance calculations are executed **exclusively on the backend server**.
2. **Logged-in Student Template Isolation**: The server strictly queries the database for the enrolled template belonging **only** to `studentId`.
3. **Fail-Closed Architecture**: Missing, zero, NaN, wrong-size, unparseable embeddings, timeouts, or multi-face/zero-face frames immediately return `is_match: false` and reject check-in.
4. **5-Frame Temporal Consistency**: Verification requires 5 consecutive frames, enforcing exact single-face presence in every frame, median similarity threshold compliance, majority frame pass requirement, and face-switching inter-frame variance detection.
5. **Enrollment Uniqueness & Cross-Check**: Enrollment requires 5 consistent quality-checked frames, normalized embedding averaging, encryption, and cross-student duplicate embedding blocking.
6. **Rate Limiting & Lockout**: 5 failed face verification attempts in a single session automatically escalate the student's status to `pending_review`.
