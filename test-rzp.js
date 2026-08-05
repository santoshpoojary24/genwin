import Razorpay from 'razorpay';

const instance = new Razorpay({
  key_id: 'rzp_test_TM0e930fFxpDsE',
  key_secret: 'PBtHsNjpKgOZD3nS98Gl7j1U'
});

instance.orders.create({
  amount: 50000,
  currency: "INR",
  receipt: "receipt#1"
}).then(order => {
  console.log("SUCCESS:", order);
}).catch(err => {
  console.error("ERROR:", err);
});
