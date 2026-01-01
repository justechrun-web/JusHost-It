
# JusHostIt - Beta to General Availability (GA) Launch Plan

**Version:** 1.0
**Status:** Approved for Execution
**Owner:** Founding Team

---

## 1. Guiding Principles

This launch is governed by three core principles: **Control, Validation, and Trust.**

1.  **Control:** We will control the rollout at every stage. No "big bang" launches. We onboard users deliberately to ensure platform stability and service quality.
2.  **Validation:** We will validate every core system—provisioning, billing, and security—with real users and real money before scaling.
3.  **Trust:** We will earn customer trust by being transparent, meeting our commitments (SLA), and demonstrating operational excellence from day one.

---

## 2. Launch Phases

The launch is structured in three distinct phases. Progress to the next phase is determined by meeting specific readiness gates, not by dates.

### Phase I: Internal Alpha (Current State)

*   **Goal:** Validate core functionality and deployment pipeline.
*   **Users:** Founding team only.
*   **Environment:** Production infrastructure, using dev/test Stripe accounts.
*   **Key Activities:**
    *   Deploy and test the complete Terraform stack.
    *   Run end-to-end tests on the provisioning worker (create, suspend, resume sites).
    *   Verify all admin and user roles function as per Firestore rules.
    *   Trigger and verify all audit log events.
    *   Generate mock usage data and test the `aggregateDailyUsage` function.

*   **Readiness Gate to Phase II:**
    *   [x] At least 10 successful site creation/deletion cycles completed.
    *   [x] All core UI flows in the admin and user dashboards are verified against the backend.
    *   [x] End-to-end billing cycle simulated successfully (usage report → Stripe invoice).

### Phase II: Private Beta (Invite-Only)

*   **Goal:** Validate the platform with trusted, friendly users and test real-world billing.
*   **Users:** 5-10 trusted beta customers (e.g., from personal network, advisors).
*   **Environment:** Production infrastructure with live Stripe keys.
*   **Offer:** Free service for the first month, then 50% discount for 6 months. Clear communication that this is a beta.
*   **Key Activities:**
    *   Onboard users manually. Provide high-touch support.
    *   Monitor `provisioning_jobs` and `billing_events` for any failures.
    *   **CRITICAL:** Manually verify first real Stripe usage records and invoices for accuracy.
    *   Rehearse incident response plan with a simulated outage.
    *   Collect feedback on user experience, documentation, and onboarding.

*   **Readiness Gate to Phase III:**
    *   [ ] First set of metered billing invoices successfully generated and paid via Stripe.
    *   [ ] At least one full billing cycle (e.g., 30 days) completed without major billing discrepancies.
    *   [x] Public Trust Center and SLA documents are live and reviewed.
    *   [ ] `status.jushostit.com` is operational and tested.
    *   [ ] No critical, un-remediated security vulnerabilities found.

### Phase III: General Availability (GA) - Public Launch

*   **Goal:** Open the platform to the public for self-service sign-ups and scale customer acquisition.
*   **Users:** Public.
*   **Environment:** Production.
*   **Key Activities:**
    *   Enable self-service sign-up on the website.
    *   Activate the official SLA (as defined in `sla.md`).
    *   Launch marketing and PR activities (e.g., Product Hunt, Hacker News, targeted outreach).
    *   Scale monitoring and support systems.
    *   Begin formal SOC 2 Type I audit process with a third-party firm.

---

## 3. Pre-Launch Readiness Checklist

### Technical

*   [x] **Terraform:** State is stored in a secure, remote backend (e.g., GCS bucket with versioning and encryption).
*   [x] **Kubernetes:** Controller is deployed with RBAC and resource quotas configured.
*   [x] **Firebase:** Firestore rules are locked down. Cloud Functions have been deployed and tested.
*   [x] **Stripe:** Live and test mode API keys are in Secret Manager. Webhook endpoint is configured and secret is secured.
*   [x] **Monitoring:** Alerts are configured for provisioning job failures, high resource usage, and function errors.
*   [x] **Backups:** Firestore point-in-time recovery (PITR) is enabled.

### Legal & Compliance

*   [x] Terms of Service and Privacy Policy are published.
*   [x] Public Trust Center and SLA pages are live.
*   [x] All compliance documents (`security-questionnaire.md`, etc.) are ready for distribution.

### Business & Operations

*   [x] Pricing page is live and accurate.
*   [x] Support channels (e.g., support ticket system) are operational.
*   [x] Incident response roles are assigned (e.g., Incident Commander).

---

This plan provides the structure for a disciplined, successful launch. By following these phases and gates, JusHostIt will enter the market not as a fragile startup, but as a stable, trustworthy platform from day one.
