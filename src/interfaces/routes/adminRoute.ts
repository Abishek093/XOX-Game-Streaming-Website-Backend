import { Router } from 'express';
import {verifyLogin,getUsers, blockUnblockUser } from '../controllers/admin/adminAuthController'
const adminRouter = Router();


adminRouter.post('/login', verifyLogin);
adminRouter.get('/users', getUsers);
adminRouter.patch('/users/:id/block', blockUnblockUser);



export default adminRouter;