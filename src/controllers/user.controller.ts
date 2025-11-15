import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMyList = async (req: AuthRequest, res: Response) => {
  try {
    const myList = await prisma.myList.findMany({
      where: { userId: req.userId! },
      include: {
        product: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            },
            _count: {
              select: { votes: true, comments: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const products = myList.map(item => ({
      ...item.product,
      voteCount: item.product._count.votes,
      commentCount: item.product._count.comments,
      _count: undefined
    }));

    res.json(products);
  } catch (error: any) {
    console.error('Get my list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, avatar } = (req as Request).body;

    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: { name, bio, avatar },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true
      }
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
