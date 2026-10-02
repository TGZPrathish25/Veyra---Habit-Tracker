/** Daily recurring task CRUD, occurrences, completion toggle — route definitions. */
import { Router } from 'express';
import { tasksController } from './tasks.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const tasksRouter = Router();

// All task routes require authentication
tasksRouter.use(authenticate);

// Task definition templates CRUD
tasksRouter.get('/', (req, res, next) => tasksController.listTasks(req, res, next));
tasksRouter.post('/', (req, res, next) => tasksController.createTask(req, res, next));
tasksRouter.patch('/:id', (req, res, next) => tasksController.updateTask(req, res, next));
tasksRouter.delete('/:id', (req, res, next) => tasksController.deleteTask(req, res, next));

// Occurrences and completion toggle
tasksRouter.get('/occurrences', (req, res, next) => tasksController.getOccurrences(req, res, next));
tasksRouter.post('/occurrences/:id/toggle', (req, res, next) => tasksController.toggleOccurrence(req, res, next));
