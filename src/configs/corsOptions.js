// const { StatusCodes } = require('http-status-codes');
// const ApiError = require('../utils/ApiError');
// const allowedOrigins = require('./allowedOrigins');

// const corsOptions = {
//     origin: (origin, callback) => {
//         if (allowedOrigins.indexOf(origin) !== -1 || !origin)
//             callback(null, true);
//         else
//             callback(
//                 new ApiError(
//                     StatusCodes.INTERNAL_SERVER_ERROR,
//                     'Not allowed by CORS'
//                 )
//             );
//     },
//     optionsSuccessStatus: StatusCodes.OK,
// };
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true, // access-control-allow-credentials:true
};
module.exports = corsOptions;
