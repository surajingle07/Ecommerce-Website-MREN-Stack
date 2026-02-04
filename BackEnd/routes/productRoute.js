import express from 'express';
import { addProduct, deleteProduct, getAllProduct, updateProduct } from '../controllers/productController.js';
import { isAdmin, isAuthenticated } from '../middleware/isAuthenticate.js';
import { multipleUpload } from '../middleware/multer.js';
const router=express.Router()

router.post('/add',isAuthenticated,isAdmin,multipleUpload ,addProduct)
router.get("/getallProducts",getAllProduct)

router.delete('/delete/:productId',isAuthenticated,isAdmin,deleteProduct)
router.put('/update/:productId',isAuthenticated,isAdmin,multipleUpload ,updateProduct)
router.delete('/delete/:productId',isAdmin,isAuthenticated,deleteProduct)
router.put('/update/:productId',isAdmin,isAuthenticated,multipleUpload,updateProduct)
export default router