'use strict'
const express = require('express')
const router = express.Router()
const { optionalAuth } = require('../../middlewares/authentication')
const { createChat, getChat } = require('../../controllers/chat.controller')
const {asyncHandler} = require('../../helpers/asyncHandler')

router.use(optionalAuth)
router.post('/', asyncHandler(createChat));
router.get('/', asyncHandler(getChat));
module.exports = router
