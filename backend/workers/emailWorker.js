import dotenv from 'dotenv';
dotenv.config();

import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { createRedisConnection } from '../config/redis.js';
import prisma from '../config/prisma.js';

async function startWorker() {
  console.log('Starting Email Worker...');

  // Initialize Nodemailer Transporter: Uses Real SMTP (e.g. Gmail) if configured in .env, otherwise Ethereal Sandbox
  let transporter;
  let testAccount;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail = process.env.SMTP_HOST?.includes('gmail') || process.env.SMTP_USER?.endsWith('@gmail.com');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || (isGmail ? 'smtp.gmail.com' : 'smtp.mailtrap.io'),
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`[SMTP] Using Real SMTP Server (${process.env.SMTP_HOST || 'Gmail'}) for ${process.env.SMTP_USER}`);
  } else if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS
      }
    });
    console.log(`[SMTP Sandbox] Fixed Ethereal account initialized: ${process.env.ETHEREAL_USER}`);
  } else {
    try {
      testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[SMTP Sandbox] Ethereal test account initialized: ${testAccount.user}`);
    } catch (e) {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'rosetta.rowe85@ethereal.email',
          pass: 'hEmU3yB8canaBqFWw6'
        }
      });
      console.log('[SMTP Sandbox] Using default Ethereal fallback transporter.');
    }
  }

  // Helper function to send email to a single recipient
  async function processRecipientEmail(recipient, campaignName) {
    console.log(`Sending email to ${recipient.email} for campaign ${campaignName}`);
    try {
      const info = await transporter.sendMail({
        from: `"Mini ReachInbox" <${process.env.SMTP_USER || testAccount?.user || 'noreply@minireachinbox.com'}>`,
        to: recipient.email,
        subject: `You've got a message: ${campaignName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 8px;">
            <h2 style="color: #00B04F;">Hello!</h2>
            <p>You have received a new message from the campaign <strong>${campaignName}</strong>.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">Best regards,<br>The Mini ReachInbox Team</p>
          </div>
        `
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      console.log(`[Success] Email sent via Real SMTP to ${recipient.email}.`);

      await prisma.recipient.update({
        where: { id: recipient.id },
        data: {
          status: 'SENT',
          etherealPreviewUrl: previewUrl,
          sentAt: new Date()
        }
      });
    } catch (error) {
      console.error(`[Error] Failed to send email to ${recipient.email}:`, error.message);
      await prisma.recipient.update({
        where: { id: recipient.id },
        data: {
          status: 'FAILED',
          errorMessage: error.message
        }
      });
    }
  }

  // BullMQ Worker setup
  try {
    const connection = createRedisConnection();
    const worker = new Worker('emailQueue', async (job) => {
      const { recipientId, email, campaignName } = job.data;
      const recipient = await prisma.recipient.findUnique({ where: { id: recipientId } });
      if (recipient && recipient.status === 'PENDING') {
        await processRecipientEmail(recipient, campaignName);
      }
    }, { connection });

    worker.on('ready', () => console.log('BullMQ Worker is ready!'));
    worker.on('error', () => {}); // silent error event when offline
  } catch (e) {
    console.log('BullMQ worker offline, using direct worker processor.');
  }

  // Track processing recipient IDs to prevent duplicate sending
  const processingIds = new Set();

  // Direct interval worker loop (processes any PENDING emails due for delivery)
  setInterval(async () => {
    try {
      const pendingRecipients = await prisma.recipient.findMany({
        where: { status: 'PENDING' },
        include: { campaign: true }
      });

      const now = new Date();
      for (const recipient of pendingRecipients) {
        if (processingIds.has(recipient.id)) continue;
        const scheduledAt = new Date(recipient.campaign?.scheduledAt || 0);
        // Process if scheduled time is reached or within current buffer
        if (scheduledAt.getTime() <= now.getTime() + 10 * 60 * 1000) {
          processingIds.add(recipient.id);
          try {
            await processRecipientEmail(recipient, recipient.campaign?.name || 'Email Campaign');
          } finally {
            processingIds.delete(recipient.id);
          }
        }
      }
    } catch (err) {
      // quiet database check errors
    }
  }, 3000);

  console.log('Email Worker active and monitoring pending jobs...');
}

startWorker().catch((err) => console.warn('Email worker notice:', err.message));
