const userRouter = require("./user");
const productRouter = require("./product");
const categoryRouter = require("./category");
const bcategoryRouter = require("./blogcategory");
const blogRouter = require("./blog");
const brandRouter = require("./brand");
const couponRouter = require("./coupon");
const orderRouter = require("./order");
const colorRouter = require("./color");
const enquiryRouter = require("./enquiry");
const configRouter = require("./config");
const menuRouter = require("./menu");
const shipRouter = require("./ship");
const retailRouter = require("./retail");
const uploadRouter = require("./upload");
const permissionRouter = require("./permission");
const sizeRouter = require("./size");
const lessonRouter = require("./lesson");
const questionRouter = require("./question");
const resultRouter = require("./result");
const quizRouter = require("./quiz");
const historyRouter = require("./history");
const lessoncategoryRouter = require("./lessoncategory");

const { notFound, errorHandler } = require("../middlewares/errorHandle");

const initRouter = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);
  app.use("/api/category", categoryRouter);
  app.use("/api/blogcategory", bcategoryRouter);
  app.use("/api/blog", blogRouter);
  app.use("/api/brand", brandRouter);
  app.use("/api/coupon", couponRouter);
  app.use("/api/order", orderRouter);
  app.use("/api/color", colorRouter);
  app.use("/api/enquiry", enquiryRouter);
  app.use("/api/config", configRouter);
  app.use("/api/menu", menuRouter);
  app.use("/api/ship", shipRouter);
  app.use("/api/retail", retailRouter);
  app.use("/api/upload", uploadRouter);
  app.use("/api/permission", permissionRouter);
  app.use("/api/size", sizeRouter);
  app.use("/api/lesson", lessonRouter);
  app.use("/api/question", questionRouter);
  app.use("/api/result", resultRouter);
  app.use("/api/quiz", quizRouter);
  app.use("/api/history", historyRouter);
  app.use("/api/lessoncategory", lessoncategoryRouter);
  app.use(notFound);
  app.use(errorHandler);
};

module.exports = initRouter;
