import { Request, Response } from 'express';
import { ReportPostUseCase, ReportReasonUseCase } from '../../../application/use-cases/UserUseCases/ReportUseCase';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';

const userRepository = new MongoUserRepository();
const reportReasonUseCase = new ReportReasonUseCase()
const reportPostUseCase = new ReportPostUseCase(userRepository)


export const reportReasons = async (req: Request, res: Response): Promise<void> => {
  const reasons = await reportReasonUseCase.execute()
  res.json(reasons)
}


export const reportPost = async (req: Request, res: Response) => {
  try {
    const { userId, postId, reason } = req.body;
    if (!userId || !postId || !reason) {
      return res.status(400).json({ error: 'userId, postId, and reason are required.' });
    }
    const report = await reportPostUseCase.execute(userId, postId, reason);
    return res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    console.error('Error reporting post:', error);
    return res.status(500).json({ error: 'An error occurred while reporting the post.' });
  }
};
