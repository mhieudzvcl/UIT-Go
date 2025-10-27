import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createTripHandler, completeTripHandler, getTripHandler } from '../controllers/trip.controller.js';

const router = express.Router();

router.post('/', createTripHandler);
router.post('/:id/complete', completeTripHandler);
router.get('/:id',  getTripHandler);

export default router;
