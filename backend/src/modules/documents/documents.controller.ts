
import { DocumentsService } from './documents.service.js';

export const getMyDocuments = async (req: any, res: any) => {
    try {
        const partyId = req.user.partyId;
        const documents = await DocumentsService.getMyDocuments(partyId);
        res.json(documents);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadDocument = async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const partyId = req.user.partyId;
        const { document_type, reference_number, issuing_authority, expiry_date } = req.body;

        const doc = await DocumentsService.uploadDocument({
            owner_party_id: partyId,
            document_type,
            reference_number,
            issuing_authority,
            expiry_date: expiry_date ? new Date(expiry_date) : undefined,
            file_url: `/uploads/${req.file.filename}`, // In a real app, upload to S3 and get URL
            mime_type: req.file.mimetype
        });
        res.status(201).json(doc);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDocument = async (req: any, res: any) => {
    try {
        const partyId = req.user.partyId;
        await DocumentsService.removeDocument(parseInt(req.params.id), partyId);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
