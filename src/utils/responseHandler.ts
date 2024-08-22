import { Response } from 'express';

export const handleResponse = (res: Response, statusCode: number, data: any): void => {
  res.status(statusCode).json(data);
};