// Page code for /community-forum (Airshow Forum), added 3 Nov 2026.
// The forum box (#html12) loads forum.html from GitHub, which holds the Clean and HUD looks.
// Both looks talk to the real forum backend (backend/forum.web.js) through this code, using forum-live.js.
// Based on the old forum page code (velo/page-code/forum-old-page.js).

import { authentication } from "wix-members-frontend";
import {
  getSession, listGroups, listThreads, getThread, getProfile,
  createThread, addComment, toggleLike, report, editPost, deleteOwnPost,
  saveMyProfile, uploadMyPhoto, removeMyPhoto, requestGroup, adminOverview, adminAction,
  listGallery, getGalleryPhoto, startGalleryUpload, sendGalleryPiece, finishGalleryUpload,
  editGalleryPhoto, deleteGalleryPhoto, toggleGalleryLike, addGalleryComment
} from "backend/forum.web";

// Only these actions can be called from the forum box.
const ACTIONS = {
  getSession, listGroups, listThreads, getThread, getProfile,
  createThread, addComment, toggleLike, report, editPost, deleteOwnPost,
  saveMyProfile, uploadMyPhoto, removeMyPhoto, requestGroup, adminOverview, adminAction,
  listGallery, getGalleryPhoto, startGalleryUpload, sendGalleryPiece, finishGalleryUpload,
  editGalleryPhoto, deleteGalleryPhoto, toggleGalleryLike, addGalleryComment
};

$w.onReady(() => {
  const box = $w("#html12");

  const reply = (id, result) => {
    box.postMessage({ source: "ukag-forum", id, ok: result.ok, data: result.data, error: result.error });
  };

  const sendSession = async () => {
    const result = await getSession();
    box.postMessage({ source: "ukag-forum", event: "session", data: result.ok ? result.data : { member: null } });
  };

  authentication.onLogin(() => { sendSession(); });
  authentication.onLogout(() => { box.postMessage({ source: "ukag-forum", event: "session", data: { member: null } }); });

  box.onMessage(async (event) => {
    const msg = event.data;
    if (!msg || msg.source !== "ukag-forum" || typeof msg.action !== "string") return;

    if (msg.action === "login" || msg.action === "signup") {
      reply(msg.id, { ok: true, data: { prompted: true } });
      authentication.promptLogin({ mode: msg.action, modal: true })
        .then(() => sendSession())
        .catch(() => {});
      return;
    }

    if (msg.action === "logout") {
      reply(msg.id, { ok: true, data: { loggedOut: true } });
      authentication.logout();
      return;
    }

    const fn = ACTIONS[msg.action];
    if (!fn) {
      reply(msg.id, { ok: false, error: "That action isn't available." });
      return;
    }
    try {
      reply(msg.id, await fn(msg.payload || {}));
    } catch (e) {
      reply(msg.id, { ok: false, error: "We couldn't reach the community just now. Please try again." });
    }
  });
});
