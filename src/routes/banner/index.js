const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/banner.controller');
const { authentication } = require('../../middlewares/authentication');

// Public routes
router.get('/', bannerController.getBanners);
router.get('/:bannerId', bannerController.getBannerById);

// Protected routes (require authentication)
router.post('/', authentication, bannerController.createBanner);
router.put('/:bannerId', authentication, bannerController.updateBanner);
router.delete('/:bannerId', authentication, bannerController.deleteBanner);

module.exports = router; 