import { Request, Response } from 'express';
import { VerifyUserUseCase } from '../../../application/use-cases/Admin/CreateAdminUseCase';
import { MongoAdminRepository } from '../../../infrastructure/repositories/Admin/MongoAdminRepository';
import { handleResponse } from '../../../utils/responseHandler';
import UserModel from '../../../infrastructure/data/UserModel';
import PostModel from '../../../infrastructure/data/PostModel';
import ReportModel from '../../../infrastructure/data/ReportModel';

const adminRepository = new MongoAdminRepository();
const verifyUserUseCase = new VerifyUserUseCase(adminRepository);



export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const authenticatedUser = await verifyUserUseCase.execute(email, password);
    handleResponse(res, 200, authenticatedUser);
  } catch (error) {
    console.error('Error in verifyLogin:', error);
    if (error instanceof Error) {
      handleResponse(res, 401, error.message);
    } else {
      handleResponse(res, 401, 'An unknown error occurred');
    }
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await UserModel.find({}, 'email username isVerified isGoogleUser isBlocked').exec();
    const simplifiedUsers = users.map(user => ({
      _id: user.id,
      email: user.email,
      username: user.username,
      isVerified: user.isVerified,
      isGoogleUser: user.isGoogleUser,
      isBlocked: user.isBlocked
    }));
    handleResponse(res, 200, simplifiedUsers);
  } catch (error) {
    console.error('Error in getUsers:', error);
    handleResponse(res, 500, 'Failed to fetch users');
  }
};


export const blockUnblockUser = async (req: Request, res: Response): Promise<void> => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return handleResponse(res, 404, 'User not found');
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    handleResponse(res, 200, { id: user.id, isBlocked: user.isBlocked });
  } catch (error) {
    console.error('Error in blockUnblockUser:', error);
    handleResponse(res, 500, 'Internal Server Error');
  }
};

export const fetchReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reportedPosts = await ReportModel.aggregate([
      {
        $match: { 
          targetType: 'post',
          status: 'pending' 
        }
      },
      {
        $group: {
          _id: '$targetId',
          reportCount: { $sum: 1 },
          reports: { $push: '$$ROOT' }
        }
      },
      {
        $match: { reportCount: { $gt: 2 } }
      }
    ]);

    const results = await Promise.all(
      reportedPosts.map(async (report) => {
        const post = await PostModel.findById(report._id)
          .select('title content author')
          .populate('author', 'username');
        return {
          post,
          reportCount: report.reportCount,
          reports: report.reports
        };
      })
    );

    handleResponse(res, 200, { results });
  } catch (error) {
    console.error('Error in fetchReports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};


export const resolveReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const reports = await ReportModel.find({ targetId: postId, targetType: 'post' });

    if (reports.length === 0) {
      res.status(404).json({ message: 'No reports found for this post' });
      return;
    }

    await ReportModel.updateMany({ targetId: postId, targetType: 'post' }, { status: 'resolved' });

    res.status(200).json({ message: 'All reports for this post have been resolved', reports });
  } catch (error) {
    console.error('Error resolving reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteReportedPost = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Delete request received'); // Check if this is printed in the backend logs
    const { postId } = req.params;
    console.log('Received postId:', postId);  // Debug log to check postId

    const reports = await ReportModel.find({ targetId: postId, targetType: 'post' });
    console.log('Found reports:', reports);  // Debug log to check found reports

    if (reports.length === 0) {
      console.log('No reports found for this post');  // Debug log for no reports
      res.status(404).json({ message: 'No reports found for this post' });
      return;
    }

    const updateResult = await ReportModel.updateMany({ targetId: postId, targetType: 'post' }, { status: 'resolved' });
    console.log('Reports update result:', updateResult);  // Debug log to check update result

    const deleteResult = await PostModel.findByIdAndDelete(postId);
    console.log('Post delete result:', deleteResult);  // Debug log to check post deletion

    res.status(200).json({ message: 'Post deleted and all associated reports have been resolved', reports });
  } catch (error) {
    console.error('Error deleting post and resolving reports:', error);  // Debug log for errors
    res.status(500).json({ message: 'Internal server error' });
  }
};