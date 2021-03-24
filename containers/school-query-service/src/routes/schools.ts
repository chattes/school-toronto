import express from 'express';
import {
  getSchoolByIdController,
  getSchoolsByAreaController
} from '../domain/schools/controllers';
const router = express.Router();

/* GET home page. */
router.get('/:schoolid', async function (req, res, next) {
  return await getSchoolByIdController.executeImpl(req, res);
});

router.post('/area', async function (req, res, next) {
  return await getSchoolsByAreaController.executeImpl(req, res);
});

export default router;
