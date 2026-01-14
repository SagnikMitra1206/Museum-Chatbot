import { v4 as uuidv4 } from "uuid";
import { sessionClient, projectId } from "../config/dialogflow.js";
import { db } from "../config/db.js";

export async function handleDialogflow(req, res) {
  let { message, sessionId } = req.body;
  if (!sessionId) sessionId = uuidv4();

  try {
    const sessionPath =
      sessionClient.projectAgentSessionPath(projectId, sessionId);

    const [response] = await sessionClient.detectIntent({
      session: sessionPath,
      queryInput: {
        text: { text: message, languageCode: "en-US" },
      },
    });

    const intent = response.queryResult.intent?.displayName;

    // Book Tickets by Date
    if (intent === "Book Tickets by Date") {
      const date =
        response.queryResult.parameters?.fields?.date?.stringValue;

      if (!date)
        return res.json({ reply: "Please tell me the date." });

      const day = new Date(date).toLocaleString("en-US", {
        weekday: "long",
      });

      db.query(
        `SELECT * FROM shows WHERE LOWER(day_of_week)=LOWER(?)`,
        [day],
        (err, results) => {
          if (err || !results.length)
            return res.json({ reply: `No shows on ${day}` });

          res.json({
            reply: `Shows available on ${day}:`,
            options: results,
          });
        }
      );
      return;
    }

    res.json({ reply: response.queryResult.fulfillmentText });
  } catch (err) {
    console.error("Dialogflow error:", err);
    res.status(500).json({ reply: "Dialogflow failed" });
  }
}
