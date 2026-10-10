# VERITY Biometric Privacy & Data Retention Policy

## 1. Zero Raw Image Storage Policy

VERITY operates under a strict **Zero Raw Photo Retention Guarantee**:

1. **No Raw Image Files Saved**: Live camera frames captured during attendance verification are processed in RAM memory only.
2. **Instant Discard**: Once the 128-dimensional mathematical vector distance is computed, the source camera frame is immediately purged from volatile memory.
3. **No Unencrypted Templates**: Enrolled facial templates are converted to irreversible 128-float mathematical embeddings and stored with AES-256 encryption.

---

## 2. Student Consent & Right to Erasure

- **Explicit Enrolment Consent**: Students must explicitly initiate biometric registration (`v1.0 Consent Policy`).
- **Data Deletion Workflow**: Upon graduation or account deletion, student facial vector embeddings are purged permanently from `face_templates` database table.
- **Explainable Decision Rationale**: Verification failures specify exact telemetry reasons (e.g. *"Face match 24.5% vs 85% required"*), ensuring transparent governance without automated black-box scoring.
