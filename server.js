const express = require('express'); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express(); 
app.use(express.static('public'));

const BASE_URL = `http://${process.env.DOMAIN}`

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell, the price is a stripe ID
        price: 'price_1SzxomPefqjBIudBU0CNzD5d',
        // price: 'price_1SzxTbPefqjBIudBwRFvefU3',
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${BASE_URL}/success.html`,
    cancel_url: `${BASE_URL}/cancel.html`,
    customer_email: 'test@test.com' 
  });
 
  // buisness logic
  // create order
  // save session.id as key

  res.redirect(303, session.url);
});

const endpointSecret = process.env.ENDPOINT_SECRET;

// catches all stripe webhook events
app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  console.log(event.type);

if (event.type === 'checkout.session.completed') { 
    const session = event.data.object;
    
    console.log(`Checkout Session Completed!`);
    
    // --- COMMON FIELDS (Always there) ---
    console.log(`- Session ID: ${session.id}`);
    console.log(`- User ID (Yours): ${session.client_reference_id}`);
    console.log(`- Stripe Customer ID: ${session.customer}`); // 'cus_...'

    // --- ONE-TIME PAYMENT SPECIFIC ---
    // This will be NULL if it's a subscription
    if (session.payment_intent) {
        console.log(`   - Payment Intent ID: ${session.payment_intent}`); // 'pi_...'
        // buisness logic
        // update the order table and fulfil order
    }

    // --- SUBSCRIPTION SPECIFIC ---
    // This will be NULL if it's a one-time payment
    if (session.subscription) {
        console.log(`   - Subscription ID: ${session.subscription}`); // 'sub_...'
        // buisness logic
        // update order table
        // handle the subscriptions
    }

  } else if (event.type === 'invoice.paid') {
    // THIS IS THE "RENEWAL"
    const invoice = event.data.object;
    console.log(`Monthly Payment Received!`);
    console.log(`- Customer ID: ${invoice.customer}`);
    console.log(`- Subscription ID: ${invoice.subscription}`);
    console.log(`- Paid Until: ${new Date(invoice.lines.data[0].period.end * 1000)}`); 

  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;

    console.log(`Subscription Cancelled/Expired`);
    console.log(`- Subscription ID: ${subscription.id}`);
    console.log(`- Customer ID: ${subscription.customer}`);
  }

  response.send('ok');
});


// refund item
app.get('/refund', express.raw({type: 'application/json'}), async (request, response) => {
  const paymentIntent = 'pi_yesThisIsHardCodedLOL'

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntent,
  });

  response.send('ok');
});


// cancel subscription
app.get('/cancel', express.raw({type: 'application/json'}), async (request, response) => {
  const subId = 'sub_yesThisIsHardCodedLOL';
  
  subscription = await stripe.subscriptions.cancel(subId);

  response.send('ok');
})


app.listen(3000, () => console.log('Running on port 3000'));