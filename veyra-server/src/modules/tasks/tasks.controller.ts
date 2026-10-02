/** Daily recurring task CRUD, occurrences, completion toggle — request parsing and response formatting. */
import type { Request, Response, NextFunction } from 'express';
import { tasksService } from './tasks.service.js';
import {
  createTaskSchema,
  updateTaskSchema,
  getOccurrencesQuerySchema,
  toggleOccurrenceSchema,
} from './tasks.validators.js';

export class TasksController {
  async listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await tasksService.getTasks(req.user!.id);
      res.json({
        status: 'success',
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await tasksService.createTask(req.user!.id, data);
      res.status(201).json({
        status: 'success',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateTaskSchema.parse(req.body);
      const taskId = req.params.id as string;
      const task = await tasksService.updateTask(req.user!.id, taskId, data);
      res.json({
        status: 'success',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = req.params.id as string;
      await tasksService.deleteTask(req.user!.id, taskId);
      res.json({
        status: 'success',
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getOccurrences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = getOccurrencesQuerySchema.parse(req.query);
      const result = await tasksService.getDailyOccurrences(
        req.user!.id,
        query.date,
        req.user?.timezone || 'UTC'
      );
      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleOccurrence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = toggleOccurrenceSchema.parse(req.body);
      const occId = req.params.id as string;
      const result = await tasksService.toggleOccurrence(
        req.user!.id,
        occId,
        body.completed,
        req.user?.timezone || 'UTC'
      );
      res.json({
        status: 'success',
        data: result.occurrence,
        meta: {
          xpDelta: result.xpDelta,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tasksController = new TasksController();
