import { Request, Response } from 'express';
import { identifyContact } from '../services/contactService';

export const identify = async (req: Request, res: Response) => {
    try {
        const contact = await identifyContact(req.body);
        return res.status(200).json({ contact });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
};
