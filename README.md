To wrap up your setup, here is the professional documentation for the **Stripe** version of your payment gateway.

# Stripe Payment Gateway Sample

This repository demonstrates a robust Stripe integration using **Express**, supporting both one-time payments and recurring subscriptions via **Stripe Checkout**.

## Quick Start

### 1. Prerequisites

* **Docker** & **Docker Compose**
* **Stripe CLI** (Highly recommended for local webhook testing)
* A **Stripe Account** (set to Test Mode)

### 2. Configure Your Products in Stripe

Before running the code, you must define what you are selling in the [Stripe Dashboard](https://dashboard.stripe.com/test/products):

1. Navigate to **Product Catalog** -> **Add Product**.
2. Give your product a Name (e.g., "Premium Subscription").
3. Set the **Price** and select **Recurring** (for subscriptions) or **One-time**.
4. After saving, copy the **Price ID** (it starts with `price_...`).
5. Paste this ID into your `server.js` inside the `line_items` array.

### 3. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Vuuouiwons/stripe-payment-sample.git
cd stripe-payment-sample

# Configure Environment Variables
cp .env.example .env
```

> **Note:** Update your `.env` with your `STRIPE_SECRET_KEY` and `DOMAIN`.

### 4. Run the Application

```bash
docker compose up
```

Visit `http://localhost:3000` to start the checkout flow.

---

## Webhook Handling

Stripe uses webhooks to notify your server of events that happen outside your app (like a successful monthly renewal or a subscription cancellation).

### 1. Local Testing with Stripe CLI

Since your server is on `localhost`, Stripe cannot send it POST requests directly. Use the Stripe CLI to tunnel them:

```bash
# Login to your account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/webhook

```

### 2. Signing Secret

The CLI will output a **Webhook Signing Secret** (starts with `whsec_...`).
Add this to your `.env` as `ENDPOINT_SECRET` to allow your server to verify the authenticity of incoming events.
