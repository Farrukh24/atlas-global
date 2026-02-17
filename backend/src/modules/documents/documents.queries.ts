
import { query } from '../../config/database.js';

export const getDocumentsByParty = async (partyId: number) => {
    const result = await query(
        `SELECT * FROM documents 
         WHERE owner_party_id = $1 
         ORDER BY created_at DESC`,
        [partyId]
    );
    return result.rows;
};

export const createDocument = async (data: any) => {
    const { owner_party_id, document_type, reference_number, issuing_authority, expiry_date, file_url, mime_type } = data;
    const result = await query(
        `INSERT INTO documents (
            owner_party_id, document_type, reference_number, issuing_authority, 
            expiry_date, file_url, mime_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [owner_party_id, document_type, reference_number, issuing_authority, expiry_date, file_url, mime_type]
    );
    return result.rows[0];
};

export const deleteDocument = async (id: number, partyId: number) => {
    await query(
        `DELETE FROM documents WHERE id = $1 AND owner_party_id = $2`,
        [id, partyId]
    );
};
