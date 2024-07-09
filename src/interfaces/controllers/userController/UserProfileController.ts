import { Request, Response } from 'express';
import { UpdateUserUseCase } from '../../../application/use-cases/UserUseCases/UpdateUserUseCases';
import { MongoUserRepository } from '../../../infrastructure/repositories/MongoUserRepository';
import { log } from 'console';

const userRepository = new MongoUserRepository();
const updateUserUseCase = new UpdateUserUseCase(userRepository);

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    log("hello",req.params, req.body)
    const { id } = req.params; 
    const updateData = req.body;
    const updatedUser = await updateUserUseCase.execute(id, updateData);
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error: any) {
    log(error)
    res.status(500).json({ success: false, message: error.message });
  }
}