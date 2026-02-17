import { Request, Response, NextFunction } from 'express';
import { LoadsService } from './loads.service.js';
import { AuthRequest } from '../../middleware/auth.js';
import { LoadSearchParams } from '../../types';

export class LoadsController {
    static async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const load = await LoadsService.getLoad(Number(req.params.id));
            res.status(200).json({ status: 'success', data: load });
        } catch (error) {
            next(error);
        }
    }

    static async search(req: Request, res: Response, next: NextFunction) {
        try {
            const params: LoadSearchParams = {
                origin_lat: req.query.origin_lat ? Number(req.query.origin_lat) : undefined,
                origin_lng: req.query.origin_lng ? Number(req.query.origin_lng) : undefined,
                radius_km: req.query.origin_radius_km ? Number(req.query.origin_radius_km) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : 50,
                page: req.query.page ? Number(req.query.page) : 1,
                shipper_party_id: req.query.shipper_party_id ? Number(req.query.shipper_party_id) : undefined,
                carrier_party_id: req.query.carrier_party_id ? Number(req.query.carrier_party_id) : undefined,
                status: req.query.status ? (req.query.status as string).split(',') as any[] : undefined,
                load_number: req.query.load_number ? String(req.query.load_number) : undefined,
                search: req.query.search ? String(req.query.search) : undefined,
                origin: req.query.origin ? String(req.query.origin) : undefined,
                destination: req.query.destination ? String(req.query.destination) : undefined,
                equipment_code: req.query.equipment_code ? String(req.query.equipment_code) : undefined,
                pickup_date: req.query.pickup_date ? String(req.query.pickup_date) : undefined
            };

            const loads = await LoadsService.findLoads(params);
            res.status(200).json({
                status: 'success',
                results: loads.length,
                data: loads
            });
        } catch (error) {
            next(error);
        }
    }

    static async post(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');

            // Force the shipper_party_id to be the logged-in user if they are a shipper
            // This prevents users from creating loads for other parties
            const loadData = {
                ...req.body,
                created_by_party_id: req.user.partyId,
                shipper_party_id: req.user.partyId
            };

            const load = await LoadsService.postLoad(loadData);
            res.status(201).json({ status: 'success', data: load });
        } catch (error) {
            next(error);
        }
    }

    static async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');

            const loadId = Number(req.params.id);
            const load = await LoadsService.updateLoad(loadId, req.body, req.user.partyId);

            res.status(200).json({ status: 'success', data: load });
        } catch (error) {
            next(error);
        }
    }

    static async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) throw new Error('Unauthorized');

            const loadId = Number(req.params.id);
            await LoadsService.deleteLoad(loadId, req.user.partyId);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
