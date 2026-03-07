# SmartShield – AI Powered Insurance for Gig Workers

## Problem Statement

India’s gig economy relies heavily on platform-based delivery partners working for services like Swiggy, Zomato, Zepto, Amazon, and other delivery platforms. These workers depend on daily earnings to support their livelihood.

However, external disruptions such as heavy rainfall, extreme heat, floods, severe pollution, and unexpected curfews can significantly reduce their ability to work. During such events, delivery operations slow down or completely stop, leading to a loss of income for these workers.

Currently, gig workers do not have any financial protection against income loss caused by environmental or social disruptions. When these events occur, workers bear the full financial burden without any safety net.

This project aims to address this problem by providing an AI-powered parametric insurance platform that protects gig workers from income loss during such disruptions.

---

## Solution

Our solution is **SmartShield**, an AI-powered parametric insurance platform designed specifically for gig economy delivery workers.

The platform automatically monitors external conditions such as weather, pollution levels, and city disruptions using external data sources. When a predefined disruption event occurs, the system automatically triggers insurance claims and provides compensation for the income lost during that period.

The platform operates on a **weekly premium model**, which aligns with the weekly earning cycle of gig workers. AI is used to assess risk levels and dynamically adjust insurance premiums based on environmental and location-based factors.

This ensures gig workers receive financial protection in a fast, automated, and transparent way without needing to manually file complex insurance claims.

---

## Target Persona

The primary users of this platform are **food delivery partners working with platforms such as Swiggy and Zomato**.

These workers operate in urban environments and rely on completing deliveries throughout the day to earn income. Their work is highly dependent on environmental conditions such as weather, pollution levels, and city restrictions.

During extreme weather events or city disruptions, delivery activity reduces drastically, causing workers to lose a significant portion of their weekly earnings.

SmartShield is designed to provide a safety net for these workers by offering affordable weekly insurance coverage for income loss caused by external disruptions.

---

## Application Workflow

1. The delivery worker registers on the SmartShield platform.
2. The worker provides basic information such as location, delivery platform, and working area.
3. The system performs an AI-based risk assessment based on environmental and historical disruption data.
4. Based on the calculated risk level, the system generates a **weekly insurance premium**.
5. The worker purchases the weekly insurance policy.
6. The system continuously monitors disruption triggers using external APIs such as weather and pollution data.
7. If a disruption event occurs (e.g., heavy rainfall or severe pollution), the system automatically triggers a claim.
8. The fraud detection module verifies the legitimacy of the claim using location and activity validation.
9. Once verified, the system automatically processes the payout to compensate the worker for the income loss.

---

## AI Integration

Artificial Intelligence plays a key role in multiple components of the system:

### Risk Prediction
AI models analyze environmental data such as weather patterns, pollution levels, and historical disruptions to estimate the risk level for specific locations.

### Dynamic Premium Calculation
Based on the calculated risk level, AI dynamically adjusts the weekly insurance premium. Workers in high-risk areas may pay slightly higher premiums, while workers in safer zones receive lower premiums.

### Fraud Detection
AI-based anomaly detection is used to detect suspicious claims such as:
- Fake disruption claims
- GPS spoofing
- Duplicate claims

This ensures that only valid claims are approved and processed.

---

## Tech Stack

Frontend  
React (Web application for workers and administrators)

Backend  
Node.js / Express.js for handling APIs and system logic

AI / Machine Learning  
Python with machine learning libraries for risk prediction and fraud detection

Database  
MongoDB for storing user data, policies, and claim records

External APIs  
Weather APIs for monitoring environmental conditions  
Air Quality APIs for pollution data

Payment Integration  
Razorpay or UPI payment sandbox for simulated payout processing

---

## Future Scope

The platform can be further expanded with additional capabilities such as:

- Integration with delivery platforms like Swiggy or Zomato for real-time delivery activity data
- Advanced AI models for predicting city-wide disruption risks
- Smart dashboards for insurers showing claim analytics and disruption trends
- Mobile application for easier access by gig workers
- Expansion to other gig economy sectors such as e-commerce and grocery delivery

SmartShield aims to build a reliable financial safety net for gig workers and strengthen the resilience of India’s growing gig economy.
