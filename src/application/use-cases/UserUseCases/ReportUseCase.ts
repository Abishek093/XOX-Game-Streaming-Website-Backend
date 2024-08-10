import { UserRepository } from "../../../domain/repositories/UserRepository";
import { IReport } from "../../../infrastructure/data/ReportModel";

export class ReportReasonUseCase {
  async execute(): Promise<any>{
    const reasons =['Spam', 'Inappropriate Content', 'Harassment', 'False Information', 'Other'];
    return reasons 
  }
}


export class ReportPostUseCase {
  constructor(private userRepository: UserRepository) { }
  async execute(userId:string, postId:string, reason:string):Promise<IReport>{
    const newReport = await this.userRepository.reportPost(userId, postId, reason)
    return newReport
  }
}