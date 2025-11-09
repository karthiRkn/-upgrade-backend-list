import { Request, Response } from 'express';
import prisma from '../config/database';

export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({ where: { email } });
    
    if (existing) {
      if (existing.active) {
        return res.status(400).json({ error: 'Email already subscribed' });
      } else {
        // Reactivate subscription
        await prisma.subscriber.update({
          where: { email },
          data: { active: true }
        });
        return res.json({ message: 'Subscription reactivated successfully' });
      }
    }

    // Create new subscriber
    await prisma.subscriber.create({
      data: { email }
    });

    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
  } catch (error: any) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    await prisma.subscriber.update({
      where: { email },
      data: { active: false }
    });

    res.json({ message: 'Successfully unsubscribed' });
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
