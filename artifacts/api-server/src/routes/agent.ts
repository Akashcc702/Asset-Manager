import { Router, type IRouter } from "express";
import { parseIntent } from "../services/agentParser";
import { logAction } from "../services/activityLogger";

const router: IRouter = Router();

router.post("/agent/parse", async (req, res) => {
  const prompt = typeof req.body?.prompt === "string" ? req.body.prompt : "";
  if (!prompt.trim()) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }
  const parsed = parseIntent(prompt);
  // Log the parse so the activity feed reflects every agent step.
  await logAction({
    actionType: "intent_parsed",
    actionSummary: `Parsed prompt into "${parsed.title}" for ${parsed.currency} ${parsed.amount}`,
    actionPayload: parsed,
  });
  res.json(parsed);
});

export default router;
