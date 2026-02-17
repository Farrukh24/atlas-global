import { getIO } from '../../config/socket.js';
import { TrackingService } from './tracking.service.js';

export const handleTrackingUpdate = async (loadId: number, eventData: any) => {
    const io = getIO();

    // Record the event in the database
    const event = await TrackingService.recordEvent({
        load_id: loadId,
        ...eventData
    });

    // Emit to all clients tracking this load
    io.to(`load_${loadId}`).emit('tracking_update', event);

    return event;
};
