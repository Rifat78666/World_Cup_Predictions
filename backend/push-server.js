import webpush from "web-push";

// VAPID keys should be generated once and configured in environment/secrets
const vapidKeys = webpush.generateVAPIDKeys();

console.log("=========================================");
console.log("Generated VAPID Public Key:\n", vapidKeys.publicKey);
console.log("\nGenerated VAPID Private Key:\n", vapidKeys.privateKey);
console.log("=========================================");

webpush.setVAPIDDetails(
  "mailto:your-email@example.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// This function takes a push subscription object sent by the PWA client
export const sendPushNotification = (subscription, title, body, url = "/") => {
  const payload = JSON.stringify({
    title,
    body,
    url
  });

  return webpush.sendNotification(subscription, payload)
    .then(res => {
      console.log("Push notification sent successfully!");
      return res;
    })
    .catch(err => {
      console.error("Failed to send push notification:", err);
      throw err;
    });
};
