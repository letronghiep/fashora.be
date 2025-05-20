'use strict';
const { SuccessResponse } = require('../core/success.response');
const { getLowSaleProductsService } = require('../services/inventory.service');

const getLowSaleProducts = async (req, res, next) => {

    new SuccessResponse({
        message: 'Get low sale products successfully',
        metadata: await getLowSaleProductsService({
            page: req.query.page,
            limit: req.query.limit
        })
    }).send(res);
}

module.exports = {
    getLowSaleProducts
}

