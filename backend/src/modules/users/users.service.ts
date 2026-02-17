
import * as UserQueries from './users.queries.js';

export class UsersService {
    static async getLanguage(partyId: number): Promise<string> {
        return await UserQueries.findUserLanguage(partyId);
    }

    static async updateLanguage(partyId: number, language: string): Promise<void> {
        await UserQueries.updateUserLanguage(partyId, language);
    }
}
