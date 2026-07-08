import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const razorpayOrderId = 'order_O8j7VnQnZ3nJ2x';
const razorpayPaymentId = 'pay_O8j8TzHwY4mL3o';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'ELcpaoh66lBVCQ48T9KZCwF2';

console.log('Using key secret:', keySecret);

// Compute signature
const generated_signature = crypto
  .createHmac('sha256', keySecret)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest('hex');

console.log('Generated signature:', generated_signature);

// Verify comparison
const signatureToVerify = generated_signature;
const isMatch = (generated_signature === signatureToVerify);
console.log('Signature verification matches:', isMatch);

if (!isMatch) {
  console.error('Test failed!');
  process.exit(1);
} else {
  console.log('Test passed successfully!');
}
