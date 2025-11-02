import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { createTripHandler, completeTripHandler, getTripHandler } from '../controllers/trip.controller.js';

const router = express.Router();

router.post('/', verifyToken, createTripHandler);
router.post('/:id/complete', verifyToken, completeTripHandler);
router.get('/:id', verifyToken, getTripHandler);

export default router;
