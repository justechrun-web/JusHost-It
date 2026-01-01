# JusHostIt - Enterprise Security Questionnaire (Self-Assessment)

**Last Updated:** [Current Date]

## Introduction

This document provides answers to common security and compliance questions regarding the JusHostIt platform. Our architecture is designed with a security-first, compliance-ready mindset, aligning with best practices for SOC 2 and enterprise-grade security.

---

## A. Information Security & Governance

| ID | Question | Answer |
|----|----------|--------|
| A.1 | Do you have a formal information security program? | Yes. JusHostIt maintains a formal information security program aligned with industry best practices and frameworks such as the AICPA Trust Services Criteria (used for SOC 2). |
| A.2 | Have you designated an individual responsible for information security? | Yes. While we are a lean team, security is a core responsibility of the founding team, with a designated lead for overseeing the security program, risk management, and compliance initiatives. |
| A.3 | Do you have a set of information security policies? | Yes. Our internal security policies govern key areas including Access Control, Change Management, Incident Response, and Data Governance. These are reviewed and updated annually. |
| A.4 | Do you conduct regular risk assessments? | Yes. We conduct formal risk assessments at least annually to identify, analyze, and mitigate risks to the platform and customer data. |
| A.5 | Do you conduct background checks on employees? | Yes. All employees undergo background checks prior to employment, in accordance with local laws and regulations. |
| A.6 | Do you provide security awareness training to employees? | Yes. All employees are required to complete security awareness training upon hiring and annually thereafter. |

---

## B. Access Control

| ID | Question | Answer |
|----|----------|--------|
| B.1 | How do you enforce access control to production systems? | Access to production infrastructure is strictly limited based on the principle of least privilege. We leverage Google Cloud IAM with fine-grained roles. All administrative access requires multi-factor authentication (MFA). Direct access is restricted; all changes are deployed via an automated CI/CD pipeline. |
| B.2 | How is customer access to the platform managed? | Customer access is managed via Firebase Authentication. Platform access is gated by subscription status (`active` or `trialing`), which is stored in Firestore and updated exclusively by server-side processes (e.g., Stripe webhooks). This ensures that only paying customers can access core services. |
| B.3 | Is Multi-Factor Authentication (MFA) supported? | Yes. MFA is mandatory for all internal employees with access to production systems. It is also a required security control for customer accounts with administrative privileges on the JusHostIt platform. |
| B.4 | Do you have a process for reviewing user access rights? | Yes. Access rights to sensitive systems are reviewed on a quarterly basis. An automated process flags accounts with privileged access for manual review to ensure permissions remain appropriate. |
| B.5 | How are privileged activities logged and monitored? | All privileged user actions (e.g., role changes, site suspensions) are executed via secure Cloud Functions, which verify the caller's admin privileges. Every action generates an immutable record in an audit log collection in Firestore. This log tracks the action, the actor, the target, and the timestamp. |
| B.6 | Do you support Single Sign-On (SSO)? | Yes. We support SAML 2.0-based SSO for enterprise customers, allowing them to integrate with their identity providers (e.g., Okta, Azure AD). |
| B.7 | How do you handle account recovery? | Account recovery follows strict, auditable procedures. For standard users, we use Firebase's secure password reset flow. For administrators who have lost MFA access, a formal identity verification and recovery workflow is initiated by our support team. |

---

## C. Infrastructure & Network Security

| ID | Question | Answer |
|----|----------|--------|
| C.1 | Describe your hosting environment. | JusHostIt is built on Google Cloud Platform (GCP). Our infrastructure is defined using Terraform (Infrastructure as Code) to ensure repeatability, auditability, and control over our environment. |
| C.2 | How do you isolate customer environments? | We use a multi-tenant architecture with strong logical isolation. Customer workloads are run in containerized environments on Google Kubernetes Engine (GKE). Each customer organization is assigned a dedicated Kubernetes namespace, with strict network policies and resource quotas applied to enforce isolation at the network and compute levels. |
| C.3 | How do you protect your network from external threats? | Our infrastructure is protected by GCP's multi-layered security, including firewalls, DDoS mitigation, and intrusion detection systems. All network traffic is encrypted in transit by default using TLS 1.2 or higher. |
| C.4 | Do you perform vulnerability scanning? | Yes. We employ automated vulnerability scanning of our container images and cloud infrastructure to identify and remediate potential security weaknesses as part of our CI/CD process. |

---

## D. Application & Data Security

| ID | Question | Answer |
|----|----------|--------|
| D.1 | How do you secure data in transit? | All data transmitted between the client, our application servers, and backend services is encrypted using TLS 1.2 or higher. |
| D.2 | How do you secure data at rest? | All customer data stored within Google Cloud services, including Firestore databases and storage buckets, is encrypted at rest by default using AES-256. |
| D.3 | How do you handle sensitive data like payment information? | We do not store, process, or transmit any customer cardholder data. All payment processing is delegated to Stripe, a PCI DSS Level 1 certified service provider. Our application only stores Stripe customer and subscription IDs, completely removing our infrastructure from PCI scope. |
| D.4 | Do you have a secure software development lifecycle (SDLC)? | Yes. We follow a secure SDLC where all code changes are managed through Git, require peer review (pull requests), and pass automated testing and security scans before being deployed via our CI/CD pipeline. |
| D.5 | How are application secrets managed? | Application secrets, such as API keys and database credentials, are managed using Google Cloud Secret Manager. They are never stored in source code or configuration files and are injected securely at runtime. |
| D.6 | Do you perform step-up authentication for sensitive actions? | Yes. Sensitive operations, such as modifying billing information or deleting a site, require users to re-authenticate if their session is not recent. This protects against session hijacking and unauthorized changes. |

---

## E. Change Management

| ID | Question | Answer |
|----|----------|--------|
| E.1 | Do you have a formal change management process? | Yes. All changes to the production environment, including application code and infrastructure (via Terraform), are managed through a formal change control process. Changes are tracked in Git pull requests, require peer review and approval, and are deployed via an automated CI/CD pipeline (GitHub Actions). |
| E.2 | How do you test changes before deploying to production? | We maintain separate development, staging, and production environments, all managed by Terraform to ensure consistency. All changes are automatically deployed and validated in a staging environment before being promoted to production. |

---

## F. Incident Response & Business Continuity

| ID | Question | Answer |
|----|----------|--------|
| F.1 | Do you have an incident response plan? | Yes. We have a formal incident response plan that outlines the roles, responsibilities, and procedures for detecting, responding to, and recovering from security incidents. |
| F.2 | How do you notify customers of a security breach? | In the event of a security breach affecting customer data, we will notify affected customers in accordance with our legal and contractual obligations, without undue delay. We maintain a public status page for broader service availability communication. |
| F.3 | Do you have a disaster recovery (DR) plan? | Yes. Our DR strategy is based on our use of Infrastructure as Code (Terraform) and managed cloud services. Our entire platform can be redeployed from scratch in a new GCP region if necessary. Databases have point-in-time recovery (PITR) enabled and are backed up automatically by GCP. |
| F.4 | What is your uptime commitment? | We provide a 99.9% monthly uptime commitment for our core platform services, as detailed in our public Service Level Agreement (SLA). |
