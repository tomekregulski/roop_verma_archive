const router = require('express').Router();
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const { User } = require('../models');

router.post('/charge', async (req, res) => {
  console.log('stripe-routes.js 9 | route reached', req.body);
  let { amount, id } = req.body;
  console.log('stripe-routes.js 10 | amount and id', amount, id);
  try {
    const payment = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'USD',
      description: 'Your Company Description',
      payment_method: id,
      confirm: true,
    });
    console.log('stripe-routes.js 19 | payment', payment);
    res.json({
      message: 'Payment Successful',
      success: true,
    });
  } catch (error) {
    console.log('stripe-routes.js 17 | error', error);
    res.json({
      message: 'Payment Failed',
      success: false,
    });
  }
});

router.post('/subscribe', async (req, res) => {
  console.log('receive subscription request');

  const { id, email, first_name, last_name, payment_method } = req.body;

  const customer = await stripe.customers.create({
    name: `${first_name} ${last_name}`,
    email: email,
    payment_method: payment_method,
    invoice_settings: {
      default_payment_method: payment_method,
    },
  });
  console.log(customer);

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ plan: 'price_1KJRMLBlr8UFcXJyfuwrkYVC' }],
    expand: ['latest_invoice.payment_intent'],
  });

  console.log(subscription);

  const status = subscription['latest_invoice']['payment_intent']['status'];
  const client_secret =
    subscription['latest_invoice']['payment_intent']['client_secret'];

  const userData = await User.update(
    {
      stripe_id: customer.id,
      subscription_id: subscription.id,
      subscription_active: true,
    },
    {
      where: {
        id: id,
      },
    }
  );

  const user = { id, email, first_name, last_name };

  const token = jwt.sign(user, 'YOUR_SECRET_KEY', { expiresIn: '100h' });

  res.status(200).json({
    message: 'Logged in successfully',
    token,
    client_secret,
    status,
    userData,
  });
});

router.post('/cancel-subscription', async (req, res) => {
  console.log('cancelling subscription...');

  const customer_id = req.body.customer_id;

  const customer = await stripe.customers.retrieve(customer_id);

  console.log(customer);

  let subscriptions = await stripe.subscriptions.list();

  subscriptions = subscriptions.data;

  const delSub = subscriptions.filter(
    (subscription) => subscription.customer === customer_id
  );

  const deleted = await stripe.subscriptions.del(delSub[0].id);

  console.log(deleted);
  res.json({ message: 'cancelled' });
});

module.exports = router;
