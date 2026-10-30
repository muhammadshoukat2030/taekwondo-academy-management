import express from 'express';
import {
  getCertificates,
  getCertificateById,
  issueCertificate
} from '../controllers/certificateController.js';

const router = express.Router();

router.route('/')
  .get(getCertificates)
  .post(issueCertificate);

router.get('/:id', getCertificateById);

export default router;
