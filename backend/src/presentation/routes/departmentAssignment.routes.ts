import { Router } from 'express';
import { DepartmentAssignmentController } from '../controllers/DepartmentAssignmentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { 
  assignDepartmentValidators,
  unassignDepartmentValidators 
} from '../validators/departmentAssignment.validator';

const router = Router();
const departmentAssignmentController = new DepartmentAssignmentController();

/**
 * @route   PUT /api/v1/users/:id/assign-department
 * @desc    Asignar un departamento a un usuario
 * @access  Admin
 */
router.put(
  '/:id/assign-department',
  authMiddleware,
  roleMiddleware(['admin']),
  assignDepartmentValidators,
  departmentAssignmentController.assignDepartment
);

/**
 * @route   DELETE /api/v1/users/:id/unassign-department
 * @desc    Desasignar el departamento de un usuario
 * @access  Admin
 */
router.delete(
  '/:id/unassign-department',
  authMiddleware,
  roleMiddleware(['admin']),
  unassignDepartmentValidators,
  departmentAssignmentController.unassignDepartment
);

export default router;