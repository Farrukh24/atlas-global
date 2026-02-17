export interface Review {
    id: number;
    load_id: number;
    reviewer_party_id: number;
    subject_party_id: number;
    rating_score: number;
    review_text?: string;
    created_at: Date;
    updated_at: Date;
}
