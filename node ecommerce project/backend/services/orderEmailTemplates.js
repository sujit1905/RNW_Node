const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const formatOrderId = (order) => String(order?._id || '').slice(-8).toUpperCase();

const formatItemsText = (order) =>
  (order?.items || [])
    .map((item) => `- ${item.name} (${item.size}) x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}`)
    .join('\n');

const formatItemsHtml = (order) =>
  (order?.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #eef0f4;">
        <td style="padding: 12px 0; font-family: sans-serif; font-size: 14px; color: #0b1220; line-height: 1.5;">
          <div style="font-weight: 600; color: #0b1530;">${item.name}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">Size: ${item.size} | Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; font-family: sans-serif; font-size: 14px; font-weight: 700; color: #0b1530; vertical-align: top;">
          ${formatCurrency(item.price * item.quantity)}
        </td>
      </tr>
    `
    )
    .join('');

const shippingSummaryText = (order) => {
  const s = order?.shippingAddress || {};
  return `${s.name || ''}, ${s.phone || ''}, ${s.address || ''}, ${s.city || ''}, ${s.state || ''} - ${s.pincode || ''}`;
};

const shippingSummaryHtml = (order) => {
  const s = order?.shippingAddress || {};
  return `${s.name || ''}, ${s.phone || ''}<br/>${s.address || ''}, ${s.city || ''}, ${s.state || ''} - ${s.pincode || ''}`;
};

const commonTextBlock = (order) => `
Order ID: ${formatOrderId(order)}
Items:
${formatItemsText(order)}

Items Total: ${formatCurrency(order.itemsPrice)}
Shipping: ${formatCurrency(order.shippingPrice)}
Grand Total: ${formatCurrency(order.totalPrice)}
Payment Method: ${String(order.paymentMethod || '').toUpperCase()}
Payment Status: ${String(order.paymentStatus || '').toUpperCase()}
Shipping Address: ${shippingSummaryText(order)}
`;

const commonHtmlBlock = (order) => `
  <div style="margin-top: 24px;">
    <div style="font-family: sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0b1530; margin-bottom: 8px; border-bottom: 2px solid #caa24a; padding-bottom: 6px;">
      Order Items
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 1px solid #caa24a;">
          <th style="text-align: left; font-family: sans-serif; font-size: 12px; font-weight: 700; color: #94a3b8; padding-bottom: 8px; text-transform: uppercase;">Item Details</th>
          <th style="text-align: right; font-family: sans-serif; font-size: 12px; font-weight: 700; color: #94a3b8; padding-bottom: 8px; text-transform: uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${formatItemsHtml(order)}
      </tbody>
    </table>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <tr style="font-family: sans-serif; font-size: 14px; color: #475569;">
        <td style="padding: 6px 0;">Subtotal</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0b1530;">${formatCurrency(order.itemsPrice)}</td>
      </tr>
      <tr style="font-family: sans-serif; font-size: 14px; color: #475569;">
        <td style="padding: 6px 0;">Shipping</td>
        <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #0b1530;">${formatCurrency(order.shippingPrice)}</td>
      </tr>
      <tr style="font-family: sans-serif; font-size: 16px; font-weight: 800; color: #caa24a;">
        <td style="padding: 12px 0 0; border-top: 2px solid #eef0f4;">Total Amount</td>
        <td style="padding: 12px 0 0; text-align: right; border-top: 2px solid #eef0f4; font-size: 18px; font-weight: 800;">${formatCurrency(order.totalPrice)}</td>
      </tr>
    </table>

    <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border: 1px solid #eef0f4; border-radius: 12px;">
      <div style="font-family: sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0b1530; margin-bottom: 8px;">
        Shipping Address & Payment
      </div>
      <div style="font-family: sans-serif; font-size: 13.5px; line-height: 1.5; color: #475569;">
        <strong style="color: #0b1530;">Delivery To:</strong><br/>
        ${shippingSummaryHtml(order)}
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eef0f4; font-family: sans-serif; font-size: 13px; color: #475569; display: flex; justify-content: space-between;">
        <span><strong style="color: #0b1530;">Payment Method:</strong> ${String(order.paymentMethod || '').toUpperCase()}</span>
        <span style="margin-left: 20px;"><strong style="color: #0b1530;">Status:</strong> ${String(order.paymentStatus || '').toUpperCase()}</span>
      </div>
    </div>
  </div>
`;

const emailHtmlTemplate = (title, bannerTitle, greeting, message, order, contentAfterMessage = '') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0b1220;">
  <div style="width: 100%; background-color: #fafafa; padding: 24px 12px; box-sizing: border-box;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eef0f4; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Top banner / header -->
      <div style="background-color: #0b1530; padding: 32px 24px; text-align: center; border-bottom: 3px solid #caa24a;">
        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px; font-family: inherit;">
          VELURA <span style="color: #caa24a;">Collection</span>
        </h1>
        <p style="color: #94a3b8; font-size: 13px; letter-spacing: 1px; margin: 0; text-transform: uppercase;">
          ${bannerTitle}
        </p>
      </div>

      <!-- Main body content -->
      <div style="padding: 32px 24px;">
        <div style="font-size: 18px; font-weight: 700; color: #0b1530; margin-bottom: 16px;">
          ${greeting}
        </div>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #caa24a; padding: 16px; border-radius: 4px 12px 12px 4px; margin-bottom: 24px; font-size: 15px; line-height: 1.6; color: #475569;">
          ${message}
        </div>

        ${contentAfterMessage}
      </div>

      <!-- Footer info -->
      <div style="background-color: #070d1e; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0 0 8px;">This is an automated notification regarding order <strong>#${formatOrderId(order)}</strong>.</p>
        <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} Velura Collection. All rights reserved.</p>
        <p style="margin: 0;">Need help? Feel free to contact our support team.</p>
      </div>

    </div>
  </div>
</body>
</html>
`;

export const buildOrderPlacedEmail = (order, user) => ({
  subject: `Order Confirmed - #${formatOrderId(order)}`,
  text: `Hi ${user?.name || 'Customer'},\n\nYour order has been placed successfully.\n${commonTextBlock(order)}\nThank you for shopping with us.`,
  html: emailHtmlTemplate(
    `Order Confirmed - #${formatOrderId(order)}`,
    'Order Confirmation',
    `Hi ${user?.name || 'Customer'},`,
    'Your order has been placed successfully. Thank you for shopping with us! Below is your order details summary.',
    order,
    commonHtmlBlock(order)
  ),
});

export const buildPaymentSuccessEmail = (order, user) => ({
  subject: `Payment Received - #${formatOrderId(order)}`,
  text: `Hi ${user?.name || 'Customer'},\n\nWe have received your payment for this order.\n${commonTextBlock(order)}\nYour order will be processed shortly.`,
  html: emailHtmlTemplate(
    `Payment Received - #${formatOrderId(order)}`,
    'Payment Success',
    `Hi ${user?.name || 'Customer'},`,
    'We have received your payment for this order. Below is your payment details summary. Your order will be processed shortly.',
    order,
    commonHtmlBlock(order)
  ),
});

export const buildStatusUpdateEmail = (order, user, previousStatus, newStatus) => ({
  subject: `Order Status Updated - #${formatOrderId(order)}`,
  text: `Hi ${user?.name || 'Customer'},\n\nYour order status changed from ${String(previousStatus || '').toUpperCase()} to ${String(newStatus || '').toUpperCase()}.\n${commonTextBlock(order)}`,
  html: emailHtmlTemplate(
    `Order Status Updated - #${formatOrderId(order)}`,
    'Order Status Update',
    `Hi ${user?.name || 'Customer'},`,
    `Your order status changed from <strong style="color: #0b1530;">${String(previousStatus || '').toUpperCase()}</strong> to <strong style="color: #caa24a;">${String(newStatus || '').toUpperCase()}</strong>. Below is your order summary.`,
    order,
    commonHtmlBlock(order)
  ),
});

export const buildCancellationRefundEmail = (order, user) => ({
  subject: `Order Cancelled / Refund Update - #${formatOrderId(order)}`,
  text: `Hi ${user?.name || 'Customer'},\n\nYour order has been cancelled. If payment was completed, refund will be processed to your original payment source as per policy.\n${commonTextBlock(order)}`,
  html: emailHtmlTemplate(
    `Order Cancelled / Refund Update - #${formatOrderId(order)}`,
    'Order Cancelled',
    `Hi ${user?.name || 'Customer'},`,
    'Your order has been cancelled. If payment was completed, refund will be processed to your original payment source as per policy.',
    order,
    commonHtmlBlock(order)
  ),
});
