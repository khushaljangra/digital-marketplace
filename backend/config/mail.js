import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars immediately for ES Module import order safety in monorepos
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

let transporter = null;

const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const smtpHost = process.env.SMTP_HOST || (smtpUser ? 'smtp.gmail.com' : null);
const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
const smtpFrom = process.env.SMTP_FROM || (smtpUser ? `"Digital Marketplace" <${smtpUser}>` : '"Digital Marketplace" <noreply@digitalmarketplace.com>');

if (smtpHost && smtpUser && smtpPass) {
  const isGmail = smtpHost.includes('gmail.com');
  const transportConfig = isGmail 
    ? {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }
    : {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      };

  transporter = nodemailer.createTransport(transportConfig);
  console.log(`SMTP Mail Server Configured (${isGmail ? 'Gmail Service' : `${smtpHost}:${smtpPort}`})`);
} else {
  console.log('SMTP credentials missing. Mail will be logged to system console.');
}

const sendMailViaVercelBridge = async (toEmail, subject, htmlContent) => {
  const vercelUrl = process.env.VERCEL_MAILER_URL || 'https://codewithkj.vercel.app';
  const securityToken = process.env.EMAIL_SECURITY_TOKEN || 'kj_secure_mail_token_2026';

  try {
    const response = await fetch(`${vercelUrl}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-email-token': securityToken,
      },
      body: JSON.stringify({
        to: toEmail,
        subject,
        html: htmlContent,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log(`Email successfully sent via Vercel bridge to ${toEmail}`);
      return true;
    } else {
      console.error('Failed to send email via Vercel bridge:', data.error || 'Unknown error');
      return false;
    }
  } catch (err) {
    console.error('Error calling Vercel mailer bridge:', err.message);
    return false;
  }
};

/**
 * Send purchase confirmation email
 * @param {string} toEmail - Recipient email
 * @param {string} userName - Name of user
 * @param {Object} order - Order details
 * @param {Array} downloadLinks - Array of { title, downloadUrl } objects
 */
export const sendPurchaseEmail = async (toEmail, userName, order, downloadLinks) => {
  const itemsListHtml = order.items
    .map((item) => `<li><strong>${item.titleAtPurchase}</strong> - INR ${item.priceAtPurchase}</li>`)
    .join('');

  const linksHtml = downloadLinks
    .map(
      (link) =>
        `<div style="margin: 15px 0; padding: 12px; background: #f0f4f9; border-radius: 6px;">
          <h4 style="margin: 0 0 5px 0; color: #1e293b;">${link.title}</h4>
          <a href="${link.downloadUrl}" style="background: #2563eb; color: white; padding: 6px 12px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 14px; font-weight: bold;">Download Project</a>
          <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b;">Link expires in 15 minutes. Download from your dashboard anytime.</p>
        </div>`
    )
    .join('');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Purchase Confirmation</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for shopping at Digital Project Marketplace! Your payment was successful, and your projects are ready for download.</p>
      
      <h3>Order Details</h3>
      <p><strong>Order ID:</strong> ${order.razorpayOrderId}</p>
      <p><strong>Total Amount Paid:</strong> INR ${order.totalAmount}</p>
      <ul>
        ${itemsListHtml}
      </ul>

      <h3>Download Links</h3>
      <p>Click the buttons below to download your files:</p>
      ${linksHtml}

      <p style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 13px; color: #94a3b8;">
        Need help? Reply to this email or visit our Support Chat.
      </p>
    </div>
  `;

  const subject = `Your Purchase Confirmation - Order ${order.razorpayOrderId || order._id}`;

  if (smtpUser && smtpPass) {
    const sent = await sendMailViaVercelBridge(toEmail, subject, htmlContent);
    if (sent) return;
  }

  if (transporter) {
    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`Purchase confirmation email successfully sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending purchase email:', error.message);
    }
  } else {
    // Log to console for local testing
    console.log('\n--- EMAIL SENT (MOCK) ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Your Purchase Confirmation - Order ${order.razorpayOrderId}`);
    console.log(`Total Paid: INR ${order.totalAmount}`);
    console.log('Download Links generated:');
    downloadLinks.forEach((link) => {
      console.log(` - ${link.title}: ${link.downloadUrl}`);
    });
    console.log('-------------------------\n');
  }
};

/**
 * Broadcast new project notification to subscribers
 * @param {Array} subscribersList - Subscriber array
 * @param {Object} project - The project details
 */
export const sendNewProjectEmail = async (subscribersList, project) => {
  if (!subscribersList || subscribersList.length === 0) return;

  const emails = subscribersList.map((s) => s.email);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
      <h2 style="color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">🚀 New Source Code Available!</h2>
      <p>Hello Developer,</p>
      <p>We are excited to announce that a new production-ready project is now live on our marketplace!</p>
      
      <div style="margin: 20px 0; padding: 20px; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #1e293b;">${project.title}</h3>
        <p style="color: #64748b; font-size: 14px;">${project.description ? project.description.slice(0, 180) : ''}...</p>
        <p><strong>Category:</strong> <span style="text-transform: capitalize;">${project.category}</span></p>
        <p><strong>Price:</strong> INR ${project.price}</p>
        
        <a href="https://codewithkj.vercel.app/projects/${project._id}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 10px;">View Project Details</a>
      </div>

      <p style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8;">
        You received this email because you subscribed to our newsletter. If you wish to unsubscribe, contact support at tempphone300@gmail.com.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: smtpFrom,
        bcc: emails,
        subject: `🚀 New Launch: ${project.title} is now available!`,
        html: htmlContent,
      });
      console.log(`New project broadcast email successfully sent to ${emails.length} subscribers.`);
    } catch (error) {
      console.error('Error broadcasting new project email:', error.message);
    }
  } else {
    console.log('\n--- NEW PROJECT BROADCAST EMAIL (MOCK) ---');
    console.log(`BCC: ${emails.join(', ')}`);
    console.log(`Subject: New Launch: ${project.title}`);
    console.log(`Link: https://codewithkj.vercel.app/projects/${project._id}`);
    console.log('-------------------------------------------\n');
  }
};

/**
 * Broadcast new coupon notification to subscribers
 * @param {Array} subscribersList - Subscriber array
 * @param {Object} coupon - The coupon details
 */
export const sendNewCouponEmail = async (subscribersList, coupon) => {
  if (!subscribersList || subscribersList.length === 0) return;

  const emails = subscribersList.map((s) => s.email);

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
      <h2 style="color: #10b981; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">🎉 Exclusive Discount Coupon Created!</h2>
      <p>Hello Developer,</p>
      <p>Here is an exclusive coupon code for your next purchase on our marketplace!</p>
      
      <div style="margin: 20px 0; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center;">
        <p style="margin: 0 0 10px 0; color: #166534; font-size: 14px; font-weight: 600;">USE COUPON CODE AT CHECKOUT</p>
        <span style="font-size: 32px; font-weight: 800; color: #047857; letter-spacing: 2px; background: #d1fae5; padding: 8px 24px; border-radius: 8px; border: 2px dashed #059669; display: inline-block;">${coupon.code}</span>
        
        <p style="margin: 15px 0 0 0; color: #065f46; font-size: 15px;">
          Get <strong>${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `INR ${coupon.discountValue} OFF`}</strong>!
        </p>
        <p style="margin: 5px 0 0 0; color: #047857; font-size: 12px;">
          Valid until: ${new Date(coupon.expiryDate).toLocaleDateString()}
        </p>
      </div>

      <p style="text-align: center; margin-top: 20px;">
        <a href="https://codewithkj.vercel.app/projects" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Browse Projects Directory</a>
      </p>

      <p style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8;">
        You received this email because you subscribed to our newsletter. If you wish to unsubscribe, contact support at tempphone300@gmail.com.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: smtpFrom,
        bcc: emails,
        subject: `🎉 Exclusive offer: Get discount using code ${coupon.code}!`,
        html: htmlContent,
      });
      console.log(`New coupon broadcast email successfully sent to ${emails.length} subscribers.`);
    } catch (error) {
      console.error('Error broadcasting new coupon email:', error.message);
    }
  } else {
    console.log('\n--- NEW COUPON BROADCAST EMAIL (MOCK) ---');
    console.log(`BCC: ${emails.join(', ')}`);
    console.log(`Subject: Discount coupon code ${coupon.code}!`);
    console.log(`Discount: ${coupon.discountValue}`);
    console.log('-----------------------------------------\n');
  }
};

/**
 * Send One-Time Password (OTP) email for login
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 */
export const sendOtpEmail = async (toEmail, otp) => {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; color: #334155; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
      <h2 style="color: #2563eb; margin-top: 0;">Login Verification Code</h2>
      <p>Hello,</p>
      <p>Use the following One-Time Password (OTP) to log in to your account. This code is valid for 10 minutes and should not be shared with anyone.</p>
      
      <div style="margin: 24px 0; text-align: center;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e293b; background: #f1f5f9; padding: 12px 24px; border-radius: 6px; border: 1px dashed #cbd5e1;">${otp}</span>
      </div>
      
      <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">If you did not request this login code, you can safely ignore this email.</p>
    </div>
  `;

  const subject = `Your Login OTP: ${otp}`;

  if (smtpUser && smtpPass) {
    const sent = await sendMailViaVercelBridge(toEmail, subject, htmlContent);
    if (sent) return true;
  }

  if (!transporter) {
    console.log(`\n--- OTP LOGIN EMAIL (MOCK SIMULATOR) ---`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Your Login OTP: ${otp}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`-----------------------------------------\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: toEmail,
      subject: `Your Login OTP: ${otp}`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    return false;
  }
};

/**
 * Send purchase rejection email
 * @param {string} toEmail - Recipient email
 * @param {string} userName - Name of user
 * @param {Object} order - Order details
 */
export const sendRejectionEmail = async (toEmail, userName, order) => {
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #334155; line-height: 1.6;">
      <h2 style="color: #dc2626; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Payment Verification Failed</h2>
      <p>Hello ${userName},</p>
      <p>We were unable to verify the transaction details (UTR/Reference Number) submitted for your order.</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px;">
        <p style="margin: 0;"><strong>Order ID:</strong> ${order.razorpayOrderId || order._id}</p>
        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Rejected / Unverified</p>
      </div>

      <p>Please double-check the UTR number and verify that the payment went through. If you believe this is a mistake, please reach out to our support chat or reply directly to this email with a screenshot of your payment receipt.</p>
      
      <p style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 13px; color: #94a3b8;">
        Need help? Reply to this email or visit our Support Chat.
      </p>
    </div>
  `;

  const subject = `Payment Verification Failed - Order ${order.razorpayOrderId || order._id}`;

  if (smtpUser && smtpPass) {
    const sent = await sendMailViaVercelBridge(toEmail, subject, htmlContent);
    if (sent) return;
  }

  if (transporter) {
    try {
      await transporter.sendMail({
        from: smtpFrom,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`Rejection email successfully sent to ${toEmail}`);
    } catch (error) {
      console.error('Error sending rejection email:', error.message);
    }
  } else {
    console.log('\n--- EMAIL SENT (REJECTION MOCK) ---');
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Payment Verification Failed - Order ${order.razorpayOrderId || order._id}`);
    console.log('-----------------------------------\n');
  }
};
