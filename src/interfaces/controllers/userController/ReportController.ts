import { Request, Response } from 'express';
import { ReportPostUseCase, ReportReasonUseCase } from '../../../application/use-cases/UserUseCases/ReportUseCase';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';

const userRepository = new MongoUserRepository();
const reportReasonUseCase = new ReportReasonUseCase()
const reportPostUseCase = new ReportPostUseCase(userRepository)


export const reportReasons = async (req: Request, res: Response):Promise<void> =>{
    const reasons = await reportReasonUseCase.execute()
    res.json(reasons)
}

export const reportPost = async(req: Request, res: Response) => {
    const {userId, postId, reason} = req.body
    console.log(userId, postId, reason)
    const report = await reportPostUseCase.execute(userId, postId, reason)
}