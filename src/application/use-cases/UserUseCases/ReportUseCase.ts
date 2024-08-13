import { UserRepository } from "../../../domain/repositories/UserRepository";
import { IReport } from "../../../infrastructure/data/ReportModel";

export class ReportReasonUseCase {
  async execute(): Promise<any>{
    const reasons =['Spam', 'Inappropriate Content', 'Harassment', 'False Information', 'Other'];
    return reasons 
  }
}


export class ReportPostUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string, postId: string, reason: string): Promise<IReport> {
    if (!userId || !postId || !reason) {
      throw new Error('All parameters (userId, postId, reason) are required');
    }
    try {
      const newReport = await this.userRepository.reportPost(userId, postId, reason);
      return newReport;
    } catch (error:any) {
      throw new Error(`Failed to report post: ${error.message}`);
    }
  }
}