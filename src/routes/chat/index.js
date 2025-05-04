'use strict'
const express = require('express')
const router = express.Router()
const { authentication } = require('../../middlewares/authentication')
const { createChat, getChat } = require('../../controllers/chat.controller')
const {asyncHandler} = require('../../helpers/asyncHandler')
router.use(authentication)
router.post('/', asyncHandler(createChat));
router.get('/', asyncHandler(getChat));
module.exports = router
