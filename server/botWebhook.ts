import { Router } from "express";
import axios from "axios";

const router = Router();

const BOT_WEBHOOK_URL = "http://localhost:5000/webhook";

router.post("/telegram", async (req, res) => {
  try {
    const update = req.body;
    
    // Forward the update to the bot webhook server
    await axios.post(BOT_WEBHOOK_URL, update, {
      timeout: 5000,
    });
    
    res.json({ ok: true });
  } catch (error) {
    console.error("Error forwarding webhook:", error);
    res.json({ ok: false, error: String(error) });
  }
});

export default router;
