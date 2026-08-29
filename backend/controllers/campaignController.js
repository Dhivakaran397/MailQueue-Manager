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
        status: 'PENDING'
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

    const createdRecipients = await prisma.recipient.findMany({
      where: { campaignId: campaign.id }
    });

    const delay = Math.max(0, scheduleDate.getTime() - Date.now());

    // Schedule emails
    for (const recipient of createdRecipients) {
      let jobId = `job-${recipient.id}`;
      try {
        const job = await emailQueue.add(
          'send-email',
          {
            recipientId: recipient.id,
            email: recipient.email,
            campaignName: campaign.name
          },
          { delay }
        );
        if (job?.id) jobId = job.id;
      } catch (err) {
        console.warn(`[Queue Warning] Could not enqueue job for ${recipient.email}:`, err.message);
      }

      await prisma.recipient.update({
        where: { id: recipient.id },
        data: { jobId }
      });
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: 'PROCESSING' }
    });

    res.status(201).json({
      message: 'Campaign scheduled successfully',
      campaign: updatedCampaign,
      recipientCount: emails.length
    });
  } catch (error) {
    console.error('Schedule campaign error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
