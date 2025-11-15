import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, sort = 'createdAt', order = 'desc' } = (req as Request).query;
    
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { tagline: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        votes: true,
        comments: true,
        _count: {
          select: { votes: true, comments: true }
        }
      },
      orderBy: { [sort as string]: order }
    });

    // Check if current user has voted
    const productsWithVoteStatus = products.map(product => ({
      ...product,
      voteCount: product._count.votes,
      commentCount: product._count.comments,
      hasVoted: req.userId ? product.votes.some(vote => vote.userId === req.userId) : false,
      votes: undefined,
      _count: undefined
    }));

    res.json(productsWithVoteStatus);
  } catch (error: any) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = (req as Request).params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, bio: true }
        },
        votes: true,
        comments: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            },
            replies: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true }
                }
              }
            }
          },
          where: { parentId: null },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { votes: true, comments: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productWithStatus = {
      ...product,
      voteCount: product._count.votes,
      commentCount: product._count.comments,
      hasVoted: req.userId ? product.votes.some(vote => vote.userId === req.userId) : false,
      votes: undefined,
      _count: undefined
    };

    res.json(productWithStatus);
  } catch (error: any) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, tagline, description, website, logo, images, category } = (req as Request).body;

    if (!name || !tagline || !description || !website || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        tagline,
        description,
        website,
        logo,
        images: JSON.stringify(images || []),
        category,
        userId: req.userId!
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const voteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = (req as Request).params;

    // Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_productId: {
          userId: req.userId!,
          productId: id
        }
      }
    });

    if (existingVote) {
      // Unvote
      await prisma.vote.delete({
        where: { id: existingVote.id }
      });

      // Add to MyList if not already there
      await prisma.myList.deleteMany({
        where: {
          userId: req.userId!,
          productId: id
        }
      });

      return res.json({ message: 'Vote removed', voted: false });
    } else {
      // Vote
      await prisma.vote.create({
        data: {
          userId: req.userId!,
          productId: id
        }
      });

      // Add to MyList
      await prisma.myList.upsert({
        where: {
          userId_productId: {
            userId: req.userId!,
            productId: id
          }
        },
        create: {
          userId: req.userId!,
          productId: id
        },
        update: {}
      });

      return res.json({ message: 'Vote added', voted: true });
    }
  } catch (error: any) {
    console.error('Vote product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = (req as Request).params;
    const { content, parentId } = (req as Request).body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.userId!,
        productId: id,
        parentId: parentId || null
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    res.status(201).json(comment);
  } catch (error: any) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
