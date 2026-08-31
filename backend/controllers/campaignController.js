import { Readable } from 'stream';
import csvParser from 'csv-parser';
import prisma from '../config/prisma.js';
import { emailQueue } from '../queue/emailQueue.js';

export const scheduleCampaign = async (req, res) => {
  try {
    const { name, scheduledAt, to, toEmail, emails: bodyEmails } = req.body;
    const file = req.file;
    const userId = req.user.userId;

    if (!name || !scheduledAt) {
      return res.status(400).json({ message: 'Campaign subject and scheduledAt date are required' });
    }

    const scheduleDate = new Date(scheduledAt);
    if (isNaN(scheduleDate.getTime())) {
      return res.status(400).json({ message: 'Invalid scheduledAt date format' });
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let rawText = '';

    if (file) {
      rawText += file.buffer.toString('utf-8') + ' ';
    }
    if (to) rawText += to + ' ';
    if (toEmail) rawText += toEmail + ' ';
    if (bodyEmails) rawText += bodyEmails + ' ';

    const matchedEmails = rawText.match(emailRegex) || [];
    const emails = [...new Set(matchedEmails.map(e => e.trim().toLowerCase()))];

    if (emails.length === 0) {
      return res.status(400).json({ message: 'Please enter a recipient email address or upload a CSV file' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        scheduledAt: scheduleDate,
        userId,
        status: 'PROCESSING'
      }
    });

    const recipientData = emails.map(email => ({
      campaignId: campaign.id,
      email,
      status: 'PENDING'
    }));

    await prisma.recipient.createMany({
      data: recipientData
    });

    // Return response immediately to frontend (50ms execution time)
    res.status(201).json({
      message: 'Campaign scheduled successfully',
      campaign,
      recipientCount: emails.length
    });

    // Asynchronously enqueue background jobs without blocking response
    const delay = Math.max(0, scheduleDate.getTime() - Date.now());
    prisma.recipient.findMany({ where: { campaignId: campaign.id } }).then(recipients => {
      for (const recipient of recipients) {
        emailQueue.add(
          'send-email',
          {
            recipientId: recipient.id,
            email: recipient.email,
            campaignName: campaign.name
          },
          { delay }
        ).catch(() => {});
      }
    }).catch(() => {});

  } catch (error) {
    console.error('Schedule campaign error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};
