import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AuthError } from '../../utils/errors.js';
import { LoginDTO, RegisterDTO, AuthResponse } from './auth.types.js';

export class AuthService {
    static async login(data: LoginDTO): Promise<AuthResponse> {
        const result = await query(
            `SELECT p.id, p.type, p.verification_status, p.account_status, u.password_hash, p.legal_name
       FROM parties p
       JOIN users u ON u.party_id = p.id
       WHERE u.email = $1 AND p.deleted_at IS NULL`,
            [data.email]
        );

        if (result.rows.length === 0) {
            throw new AuthError('Invalid email or password');
        }

        const party = result.rows[0];
        const isPasswordValid = await bcrypt.compare(data.password, party.password_hash);

        if (!isPasswordValid) {
            throw new AuthError('Invalid email or password');
        }

        if (party.account_status !== 'active') {
            throw new AuthError('Account is not active');
        }

        const token = jwt.sign(
            { partyId: party.id, type: party.type },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        return {
            token,
            user: {
                id: party.id,
                type: party.type,
                legal_name: party.legal_name,
                verification_status: party.verification_status
            }
        };
    }

    static async register(data: RegisterDTO): Promise<AuthResponse> {
        const existing = await query('SELECT id FROM users WHERE email = $1', [data.email]);
        if (existing.rows.length > 0) {
            throw new AuthError('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(data.password, 12);

        const partyResult = await query(
            `INSERT INTO parties (type, legal_name, tax_id, primary_contact_phone) 
       VALUES ($1, $2, $3, $4) RETURNING id, verification_status`,
            [data.type, data.legal_name, data.tax_id, data.phone]
        );

        const partyId = partyResult.rows[0].id;

        await query(
            `INSERT INTO users (party_id, email, password_hash) VALUES ($1, $2, $3)`,
            [partyId, data.email, hashedPassword]
        );

        const token = jwt.sign(
            { partyId, type: data.type },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        return {
            token,
            user: {
                id: partyId,
                type: data.type,
                legal_name: data.legal_name,
                verification_status: partyResult.rows[0].verification_status
            }
        };
    }
}
