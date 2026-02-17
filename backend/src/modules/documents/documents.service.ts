
import * as DocumentsQueries from './documents.queries.js';

export class DocumentsService {
    static async getMyDocuments(partyId: number) {
        return await DocumentsQueries.getDocumentsByParty(partyId);
    }

    static async uploadDocument(data: any) {
        return await DocumentsQueries.createDocument(data);
    }

    static async removeDocument(id: number, partyId: number) {
        return await DocumentsQueries.deleteDocument(id, partyId);
    }
}
