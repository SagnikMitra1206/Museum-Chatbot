import cron from "node-cron";
import { db } from "../config/db.js";

cron.schedule("0 0 * * *", () => {

    const today = new Date();

    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const todayName = weekdays[today.getDay()];

    db.query(
        "UPDATE shows SET available_tickets = total_tickets WHERE day_of_week=?",
        [todayName],
        (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(`${todayName} tickets reset.`);
            }
        }
    );

});