# JusHostIt - Technical Appendix

## 1. Executive Summary: The JusHostIt Control Plane

JusHostIt is a multi-tenant, infrastructure-agnostic hosting platform built on a foundation of cloud-native principles, zero-trust security, and automated billing. Our core innovation is a decoupled **Control Plane** that orchestrates customer workloads, enforces business logic, and manages the entire lifecycle of a site without manual intervention.

- **Technology:** Kubernetes, Firebase, Stripe, Next.js
- **Key Differentiator:** We treat billing state as the **single source of truth** for infrastructure entitlement, enabling automated, real-time enforcement of contracts, plans, and budgets.
- **Target Market:** Developers, agencies, and businesses who require enterprise-grade security, cost control, and compliance without the overhead of managing cloud infrastructure.

---

## 2. Core Architectural Pillars

Our architecture is built on three distinct, decoupled planes:

| Plane          | Responsibility                           | Technologies                               |
| -------------- | ---------------------------------------- | ------------------------------------------ |
| **App Plane**  | User Interface (Dashboard, Admin)        | Next.js, React, ShadCN, Tailwind           |
| **Control Plane**  | State, Auth, Billing, Business Logic | Firebase (Firestore, Auth), Cloud Functions |
| **Infra Plane**    | Workload Execution, Isolation, Metering  | Kubernetes, Prometheus, Stripe Billing     |

This separation of concerns is critical for security, scalability, and auditability. The App Plane **never** directly communicates with the Infrastructure Plane. All actions are mediated and authorized by the Control Plane.

---

## 3. The Lifecycle of a Customer Site

This event-driven workflow is the heart of JusHostIt's automation.

1.  **Signup & Plan Selection:**
    - A user signs up via passwordless authentication (Google SSO or magic link).
    - They select a plan (e.g., Starter, Pro) on the pricing page.

2.  **Stripe Checkout:**
    - The user is redirected to a secure Stripe Checkout session, created by our backend.
    - The session metadata includes the user's unique ID (`uid`) and selected `plan`.

3.  **Webhook → Activation:**
    - Upon successful payment, Stripe sends a `checkout.session.completed` webhook to our backend.
    - Our webhook handler verifies the signature and updates the user's document in Firestore, setting `subscriptionStatus: "active"`.

4.  **Firestore Trigger → Provisioning:**
    - The `onUpdate` Firestore trigger on the user document detects the status change to `active`.
    - It invokes a Cloud Function to automatically provision the user's infrastructure in Kubernetes (e.g., creates a dedicated namespace, applies resource quotas).

5.  **Dashboard Access:**
    - The user is now granted access to the dashboard. An authorization gate (`useAuthGate`) verifies on every load that the user is authenticated and their `subscriptionStatus` is `active`.

---

## 4. Billing, Cost Control, and Revenue Protection

Our billing system is designed for both self-serve SaaS and enterprise contracts, providing hard guarantees against unpaid usage and surprise costs.

### A. Usage Metering

- **Source:** Prometheus scrapes real-time metrics (CPU, memory, bandwidth) from every container in the Kubernetes cluster.
- **Aggregation:** A scheduled Cloud Function (`Usage Aggregator`) queries Prometheus every 5 minutes.
- **Reporting:** The aggregator pushes summed usage data to both **Firestore** (for dashboard visibility) and **Stripe Metered Billing** (for invoicing).

### B. Dunning & Auto-Suspension (The "Self-Healing" Loop)

When a recurring payment fails:

1.  **Stripe `invoice.payment_failed` Webhook:** Fires immediately.
2.  **Firestore Update:** Our webhook handler sets the user's `subscriptionStatus` to `"past_due"`.
3.  **Grace Period:** The user sees a warning banner in the UI but service is not interrupted. Stripe automatically retries the payment.
4.  **Automatic Suspension:** If payment is not recovered after a defined period (e.g., 7 days), a daily scheduled Cloud Function sets the user's status to `"suspended"`.
5.  **Infra Enforcement:** An `onUpdate` trigger on the user document detects the `"suspended"` status and scales the user's Kubernetes deployments to zero, taking their sites offline.

### C. Auto-Recovery

- If the customer updates their payment method and Stripe successfully processes the payment, a `payment_succeeded` webhook fires.
- Our webhook handler sets the status back to `"active"`, which triggers the enforcement function to automatically scale the user's deployments back up. **No human intervention is required.**

### D. Hard Caps & Budget Enforcement

- For enterprise or usage-based plans, customers can set a monthly budget.
- The `Usage Aggregator` function compares `currentSpend` against the `monthlyBudget`.
- **Throttling:** If the budget is exceeded, the enforcement function applies a stricter `LimitRange` to the user's namespace, throttling CPU/memory without causing downtime.
- **Suspension:** If the budget is *severely* exceeded (e.g., >120%), the namespace is suspended.

---

## 5. Security, Compliance, and Enterprise Readiness

JusHostIt is built to meet the standards of SOC 2, ISO 27001, and enterprise procurement.

- **Zero-Trust Access:** All actions are denied by default. Access and entitlements are explicitly granted based on authenticated identity and billing status.
- **Immutable Audit Logs:** All administrative actions and significant system events (provisioning, suspension, role changes) are recorded as immutable documents in a dedicated Firestore collection.
- **Infrastructure as Code (IaC):** All infrastructure (Kubernetes clusters, firewall rules, cloud services) is defined in Terraform, stored in version control, and deployed via an automated CI/CD pipeline.
- **PCI DSS Compliance:** We do not store, process, or transmit any cardholder data. All payment handling is delegated to Stripe, a certified PCI Level 1 Service Provider.
- **Enterprise Contracts:** The platform supports invoiced (Net-30) billing, enabling sales-led enterprise contracts. Billing type is a property of the user object, allowing dunning policies to be adjusted without forking the codebase.
