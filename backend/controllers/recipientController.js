import prisma from '../config/prisma.js';

export const getRecipients = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause = {
      campaign: {
        userId
      }
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.email = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const recipientsPromise = prisma.recipient.findMany({
      where: whereClause,
      include: {
        campaign: {
          select: {
            name: true,
            scheduledAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNumber
    });

    const totalCountPromise = prisma.recipient.count({ where: whereClause });

    // Global counts for user
    const userAllRecipientsWhere = { campaign: { userId } };
    const globalTotalPromise = prisma.recipient.count({ where: userAllRecipientsWhere });
    const globalSentPromise = prisma.recipient.count({ where: { ...userAllRecipientsWhere, status: 'SENT' } });
    const globalPendingPromise = prisma.recipient.count({ where: { ...userAllRecipientsWhere, status: 'PENDING' } });
    const globalFailedPromise = prisma.recipient.count({ where: { ...userAllRecipientsWhere, status: 'FAILED' } });

    const [
      recipients,
      totalCount,
      globalTotal,
      globalSent,
      globalPending,
      globalFailed
    ] = await Promise.all([
      recipientsPromise,
      totalCountPromise,
      globalTotalPromise,
      globalSentPromise,
      globalPendingPromise,
      globalFailedPromise
    ]);

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.status(200).json({
      recipients,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        totalCount
      },
      counts: {
        total: globalTotal,
        sent: globalSent,
        pending: globalPending,
        failed: globalFailed
      }
    });
  } catch (error) {
    console.error('Get recipients error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
