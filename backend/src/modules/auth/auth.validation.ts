import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters')
    })
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        legal_name: z.string().min(2, 'Legal name is required'),
        type: z.enum(['shipper', 'carrier', 'broker']),
        tax_id: z.string().optional(),
        phone: z.string().optional()
    })
});
