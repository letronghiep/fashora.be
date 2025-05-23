const dev = {
  app: {
    port: process.env.DEV_APP_PORT,
  },
  db: {
    host: process.env.DEV_DB_HOST,
    port: process.env.DEV_DB_PORT,
    name: process.env.DEV_DB_NAME,
    password: process.env.DEV_DB_PASS,
    clusterName: process.env.DEV_CLUSTER_NAME,
  },
};

const pro = {
  app: {
    port: process.env.PRO_APP_PORT || 3056,
  },
  db: {
    host: process.env.PRO_DB_HOST,
    port: process.env.PRO_DB_PORT,
    name: process.env.PRO_DB_NAME,
    password: process.env.PRO_DB_PASS,
    clusterName: process.env.PRO_CLUSTER_NAME,
  },
};
const config = { dev, pro };
const env = process.env.NODE_ENV || "dev";
module.exports = config[env];
