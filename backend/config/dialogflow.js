import dialogflow from "@google-cloud/dialogflow";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("./dialogflow-service-account.json", "utf-8")
);

if (!serviceAccount.project_id) {
  console.error("❌ Missing Dialogflow project_id");
  process.exit(1);
}

export const projectId = serviceAccount.project_id;

export const sessionClient = new dialogflow.SessionsClient({
  credentials: {
    client_email: serviceAccount.client_email,
    private_key: serviceAccount.private_key,
  },
});
