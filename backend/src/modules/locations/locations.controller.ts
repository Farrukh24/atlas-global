import { Request, Response, NextFunction } from 'express';
import { LocationsService } from './locations.service.js';

export class LocationsController {
    static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const location = await LocationsService.getLocation(Number(req.params.id));
            res.status(200).json({
                status: 'success',
                data: location
            });
        } catch (error) {
            next(error);
        }
    }

    static async searchNearby(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lng, lat, radius_km } = req.query;

            if (!lng || !lat) {
                res.status(400).json({
                    status: 'error',
                    message: 'lng and lat are required'
                });
                return;
            }

            const locations = await LocationsService.findNearby(
                Number(lng),
                Number(lat),
                Number(radius_km) || 50
            );

            res.status(200).json({
                status: 'success',
                results: locations.length,
                data: locations
            });
        } catch (error) {
            next(error);
        }
    }

    static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const location = await LocationsService.createOrFind(req.body);
            res.status(201).json({
                status: 'success',
                data: location
            });
        } catch (error) {
            next(error);
        }
    }
}
