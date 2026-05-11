// const Razorpay = require("razorpay");

// const razorpay = new Razorpay({
//       key_id: 'rzp_test_aNNdd7yTcNuzYQ',
//       key_secret: 'O9jzpGZzixxQp1iNXSheMDuN'
   
// });

// module.exports = razorpay;



const Razorpay = require("razorpay");

module.exports = new Razorpay({
  key_id: 'rzp_test_aNNdd7yTcNuzYQ',
  key_secret: 'O9jzpGZzixxQp1iNXSheMDuN',
});