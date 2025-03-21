import React, { useEffect } from "react";
import { gapi } from "gapi-script";


const GoogleCalendar = () => {
//   useEffect(() => {
//     const initClient = () => {
//       gapi.client.init({
//         apiKey: API_KEY,
//         clientId: CLIENT_ID,
//         discoveryDocs: DISCOVERY_DOCS,
//         scope: SCOPES,
//       }).then(() => {
//         return gapi.client.calendar.events.list({
//           calendarId: "primary",
//           timeMin: new Date().toISOString(),
//           showDeleted: false,
//           singleEvents: true,
//           orderBy: "startTime",
//         });
//       }).then(response => {
//         console.log("События:", response.result.items);
//       }).catch(error => console.log("Ошибка:", error));
//     };

//     gapi.load("client:auth2", initClient);
//   }, []);

//   return <div>Google Календарь подключен</div>;
};

export default GoogleCalendar;
