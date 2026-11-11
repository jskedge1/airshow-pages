// Page code for /app (Airshow Hub app), added 11 Nov 2026.
// The app box (#html1) loads https://jskedge1.github.io/airshow-pages/app/index.html by website address.
// The app holds My Airshow Hub, the Airshow Forum and Show Day Live in frames and passes their messages
// up to this code, so one page answers all three:
//   { source: "ukag-hub" | "ukag-forum" | "ukag-showday", id, action, payload }   (asking)
//   { source, id, ok, data, error }                                               (answer)
//   { source: "ukag-forum", event: "session", data }  and  { source: "ukag-hub", event: "refresh" }
// The app's own messages use source "ukag-app" (ready, top). This code tells the app which tab to open
// (?tab=hub, forum or showday in the page address) and how tall the visitor's screen is.
// Backend: hub.web.js, hangar.web.js, forum.web.js and showday.web.js, the same modules the separate pages use.

import { authentication } from "wix-members-frontend";
import wixLocation from "wix-location-frontend";
import wixWindow from "wix-window-frontend";
import {
  getHub, addTrip, saveTrip, removeTrip, toggleMustSee, markUpdatesRead, saveNotify, addPastShow, removePastShow,
  createGroup, joinGroup, leaveGroup, saveGroup, listGroupMessages, sendGroupMessage, findMembers, toggleFollow,
  getFeed, feedLike, feedComment, feedReport, feedPost, createPoll, votePoll, setGoing, saveToolResult, removeSaved
} from "backend/hub.web";
import { getHangar, addSeen, removeSeen } from "backend/hangar.web";
// forum.web.js on the site has more functions than the old forum page code lists, so it is imported whole
// and only the actions named in FORUM_ACTIONS can be called.
import * as forumApi from "backend/forum.web";
import { getProgrammes, getShowDayMember, submitProgramme, getCrowdReports, addCrowdReport, confirmCrowdReport } from "backend/showday.web";

const BOX = "#html1";

// Only these actions can be called from the app.
const HUB = {
  getHub, addTrip, saveTrip, removeTrip, toggleMustSee, markUpdatesRead, saveNotify, addPastShow, removePastShow,
  createGroup, joinGroup, leaveGroup, saveGroup, listGroupMessages, sendGroupMessage, findMembers, toggleFollow,
  getFeed, feedLike, feedComment, feedReport, feedPost, createPoll, votePoll, setGoing, saveToolResult, removeSaved,
  getHangar, addSeen, removeSeen,
  // Share A Photo in the hub posts through the forum gallery upload
  startGalleryUpload: (p) => forumApi.startGalleryUpload(p),
  sendGalleryPiece: (p) => forumApi.sendGalleryPiece(p),
  finishGalleryUpload: (p) => forumApi.finishGalleryUpload(p)
};
// Every action forum-live.js (both forum looks) asks for.
const FORUM_ACTIONS = [
  "getSession", "listGroups", "listThreads", "getThread", "getProfile", "getMemberCard", "listMembers", "where",
  "createThread", "addComment", "toggleLike", "markAnswer", "report", "editPost", "deleteOwnPost", "setListing",
  "saveMyProfile", "uploadMyPhoto", "removeMyPhoto", "requestGroup", "toggleFollow", "followTarget", "listFollowing", "blockMember",
  "listChats", "getChat", "sendMessage", "hideChat", "reportChat", "reportedChats", "clearChatReport",
  "adminOverview", "adminAction", "getModSettings", "saveModSettings",
  "listGallery", "getGalleryPhoto", "startGalleryUpload", "sendGalleryPiece", "finishGalleryUpload",
  "editGalleryPhoto", "deleteGalleryPhoto", "toggleGalleryLike", "addGalleryComment"
];
const forumFn = (name) => (FORUM_ACTIONS.includes(name) && typeof forumApi[name] === "function" ? forumApi[name] : null);
const TABS = ["home", "hub", "forum", "showday", "more"];

$w.onReady(() => {
  const box = $w(BOX);
  const send = (msg) => box.postMessage(msg);

  const sendSession = async () => {
    const result = await forumApi.getSession();
    send({ source: "ukag-forum", event: "session", data: result.ok ? result.data : { member: null } });
    send({ source: "ukag-hub", event: "refresh" });
  };
  const loggedOut = () => {
    send({ source: "ukag-forum", event: "session", data: { member: null } });
    send({ source: "ukag-hub", event: "refresh" });
  };

  authentication.onLogin(() => { sendSession(); });
  authentication.onLogout(loggedOut);

  const promptLogin = (mode, source) => {
    authentication.promptLogin({ mode: mode === "signup" ? "signup" : "login", modal: true })
      .then(() => sendSession())
      .catch(() => { if (source === "ukag-hub") send({ source: "ukag-hub", event: "loginCancelled" }); });
  };

  const tellScreen = async () => {
    try {
      const r = await wixWindow.getBoundingRect();
      if (r && r.window) send({ source: "ukag-app", event: "viewport", h: r.window.height, w: r.window.width });
    } catch (e) {}
  };

  box.onMessage(async (event) => {
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;

    // the app itself
    if (msg.source === "ukag-app") {
      if (msg.action === "ready") {
        tellScreen();
        const tab = String((wixLocation.query && wixLocation.query.tab) || "");
        if (TABS.includes(tab)) send({ source: "ukag-app", event: "tab", tab });
      }
      if (msg.action === "top") box.scrollTo().catch(() => {});
      return;
    }

    if (typeof msg.action !== "string") return;
    const reply = (result) => send({ source: msg.source, id: msg.id, ok: !!(result && result.ok), data: result && result.data, error: result && result.error });
    const p = msg.payload || {};

    // log in and out, from any of the three
    if (msg.action === "login" || msg.action === "signup") {
      reply({ ok: true, data: { prompted: true } });
      promptLogin(msg.action, msg.source);
      return;
    }
    if (msg.action === "logout") {
      reply({ ok: true, data: { loggedOut: true } });
      authentication.logout();
      return;
    }

    try {
      if (msg.source === "ukag-hub") {
        if (msg.action === "go") {
          // the app keeps the hub's own pages, the forum and show day inside itself; anything else is a site page
          reply({ ok: true, data: { done: true } });
          if (p.path) wixLocation.to(p.path);
          return;
        }
        const fn = HUB[msg.action];
        reply(fn ? await fn(p) : { ok: false, error: "That action isn't available." });
        return;
      }

      if (msg.source === "ukag-forum") {
        const fn = forumFn(msg.action);
        reply(fn ? await fn(p) : { ok: false, error: "That action isn't available." });
        return;
      }

      if (msg.source === "ukag-showday") {
        let data;
        if (msg.action === "load") data = { programmes: await getProgrammes(p.show || null), member: await getShowDayMember() };
        else if (msg.action === "reports") data = await getCrowdReports(p.showId);
        else if (msg.action === "report") data = await addCrowdReport(p);
        else if (msg.action === "confirm") data = await confirmCrowdReport(p.id);
        else if (msg.action === "upload") data = await submitProgramme(p);
        else throw new Error("Unknown request.");
        reply({ ok: true, data });
      }
    } catch (err) {
      reply({ ok: false, error: (err && err.message) || "We couldn't reach the site just now. Please try again." });
    }
  });
});
