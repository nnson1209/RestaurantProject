const sql = require("mssql");

const config = {
  user: "sa",
  password: "root",
  server: "localhost",
  database: "SushiRestaurantManage",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  port: 1433,
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Kết nối SQL Server thành công");
    return pool;
  })
  .catch((err) => {
    console.error("Không thể kết nối tới SQL Server", err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
