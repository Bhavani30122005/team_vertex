# VERITY Security Threat Model & Risk Analysis

## 1. Threat Assumptions & Boundaries

VERITY is designed to mitigate common academic fraud mechanisms while explicitly acknowledging hardware and browser limitations.

---

## 2. Threat Vector Matrix & Mitigations

| Threat Vector | Attack Description | VERITY Defense Mechanism | Status |
| :--- | :--- | :--- | :--- |
| **Static Photo Spoofing** | Holding a printed photo of an enrolled student in front of camera | 3D Passive Liveness Challenge (head rotation & specular reflection check) | Mitigated |
| **2D Video Playback** | Playing a recorded video of a student on a phone/tablet | Micro-gesture randomization (*"Blink twice, turn head left"*) | Mitigated |
| **Static QR Screenshot Sharing** | Student taking a photo of the QR code and texting it to absent friends | 15-Second Dynamic Rotating HMAC Tokens | Mitigated |
| **GPS Location Spoofing** | Student using fake location apps or browser overrides | Geofence GPS Accuracy Filter + Optional Wi-Fi BSSID triangulation. Flagged for **Pending Review** | Reviewable |
| **Duplicate / Replay Check-in** | Submitting multiple HTTP check-in requests for same session | MySQL `UNIQUE(session_id, student_id)` constraint + Nonce consumption | Eliminated |
| **Identity Proxy (Wrong Person)** | A friend scanning the QR code and presenting their face | **Layer 3 Strict Face Matching**: Match confidence < 85% causes instant rejection | Eliminated |

---

## 3. Known Security Limitations & Future Scope

1. **Browser GPS Limitation**: HTML5 Geolocation relies on OS/browser reporting. While VERITY flags accuracy > 15m for faculty review, dedicated hardware (BLE Beacons or NFC tags at classroom doors) provides higher physical assurance.
2. **Deepfake Attacks**: High-end generative real-time deepfakes require GPU-intensive 3D depth sensors (IR structured light). VERITY flags unexpected liveness scores for manual faculty adjudication rather than automated silent rejection.
