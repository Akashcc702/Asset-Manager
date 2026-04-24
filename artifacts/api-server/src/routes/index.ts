import { Router, type IRouter } from "express";
import healthRouter from "./health";
import agentRouter from "./agent";
import paymentsRouter from "./payments";
import activityRouter from "./activity";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(agentRouter);
router.use(paymentsRouter);
router.use(activityRouter);
router.use(dashboardRouter);

export default router;
