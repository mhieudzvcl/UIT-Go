import express from 'express'
import {
  createTripHandler,
  getTripHandler,
  completeTripHandler,
} from '../controllers/trip.controller.js'

const router = express.Router()
router.post('/', createTripHandler)
router.get('/:id', getTripHandler)
router.post('/:id/complete', completeTripHandler)

export default router
