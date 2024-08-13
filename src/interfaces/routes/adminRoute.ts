import { Router } from 'express';
import {verifyLogin,getUsers, blockUnblockUser, fetchReports, resolveReport, deleteReportedPost } from '../controllers/admin/adminAuthController'
const adminRouter = Router();


adminRouter.post('/login', verifyLogin);
adminRouter.get('/users', getUsers);
adminRouter.patch('/users/:id/block', blockUnblockUser);

adminRouter.get('/fetch-reports', fetchReports);
adminRouter.patch('/resolve-report/:postId', resolveReport);
adminRouter.patch('/delete-post/:postId', deleteReportedPost);

export default adminRouter;