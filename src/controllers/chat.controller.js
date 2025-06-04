'use strict'
const { SuccessResponse } = require('../core/success.response')
const { createChatContext, getChatContext } = require('../services/chat.service')
const { AuthFailureError } = require('../core/error.response')

const createChat = async(req, res, next) => {
    if (!req.user) {
        throw new AuthFailureError('Vui lòng đăng nhập để sử dụng tính năng chat')
    }

    new SuccessResponse({
        message: 'Create chat success',
        statusCode: 200,
        metadata: await createChatContext({
            content: req.body.content,
            userId: req.user.userId
        })
    }).send(res)
}

const getChat = async(req, res, next) => {
    new SuccessResponse({
        message: 'Get chat context success',
        statusCode: 200,
        metadata: await getChatContext({ userId: req.user.userId })
    }).send(res)
}

module.exports = {
    createChat,
    getChat
};
