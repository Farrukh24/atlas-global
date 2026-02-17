
import { query } from '../../config/database.js';

export const findUserLanguage = async (partyId: number): Promise<string> => {
    const result = await query(
        'SELECT language_preference FROM users WHERE party_id = $1',
        [partyId]
    );
    return result.rows[0]?.language_preference || 'ru';
};

export const updateUserLanguage = async (partyId: number, language: string): Promise<void> => {
    await query(
        'UPDATE users SET language_preference = $1 WHERE party_id = $2',
        [language, partyId]
    );
};
