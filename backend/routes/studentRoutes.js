import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  enrollBiometrics
} from '../controllers/studentController.js';

const router = express.Router();

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id/biometrics')
  .post(enrollBiometrics)
  .put(enrollBiometrics);

router.route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

export default router;
