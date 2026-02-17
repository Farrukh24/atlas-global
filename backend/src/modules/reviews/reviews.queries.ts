
import { query } from '../../config/database.js';

export const findReviewsBySubject = async (subjectId: number) => {
  const result = await query(
    `SELECT r.*, p.legal_name as reviewer_name 
         FROM reviews r
         JOIN parties p ON r.reviewer_party_id = p.id
         WHERE r.subject_party_id = $1
         ORDER BY r.created_at DESC`,
    [subjectId]
  );
  return result.rows;
};

export const getRatingStats = async (subjectId: number) => {
  const result = await query(
    `SELECT 
            AVG(rating)::numeric(10,1) as average_rating,
            COUNT(*) as total_reviews
         FROM reviews
         WHERE subject_party_id = $1`,
    [subjectId]
  );
  return result.rows[0];
};

export const createReview = async (data: {
  shipment_id?: number;
  reviewer_party_id: number;
  subject_party_id: number;
  rating: number;
  comment?: string;
}) => {
  const { shipment_id, reviewer_party_id, subject_party_id, rating, comment } = data;
  const result = await query(
    `INSERT INTO reviews (shipment_id, reviewer_party_id, subject_party_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [shipment_id, reviewer_party_id, subject_party_id, rating, comment]
  );
  return result.rows[0];
};
