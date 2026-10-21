// Page code from the old Community / Forum page (/forum), saved on 21 Oct 2026 before that page was deleted.
// It connected the old forum embed (ID: forumEmbed, code in backups/forum-old-wix-embed.html) to the
// backend (backend/forum.web.js, still on the site) and to Wix login.
// Reuse it to connect the new Airshow Forum design (forum.html) to real member posts.

import { authentication } from "wix-members-frontend";
import {
  getSession, listGroups, listThreads, getThread, getProfile,
  createThread, addComment, toggleLike, report, editPost, deleteOwnPost,
  saveMyProfile, uploadMyPhoto, removeMyPhoto, requestGroup, adminOverview, adminAction,
  listGallery, getGalleryPhoto, startGalleryUpload, sendGalleryPiece, finishGalleryUpload,
  editGalleryPhoto, deleteGalleryPhoto, toggleGalleryLike, addGalleryComment
} from "backend/forum.web";

// Only these actions can be called from the forum embed.
const ACTIONS = {
  getSession, listGroups, listThreads, getThread, getProfile,
  createThread, addComment, toggleLike, report, editPost, deleteOwnPost,
  saveMyProfile, uploadMyPhoto, removeMyPhoto, requestGroup, adminOverview, adminAction,
  listGallery, getGalleryPhoto, startGalleryUpload, sendGalleryPiece, finishGalleryUpload,
  editGalleryPhoto, deleteGalleryPhoto, toggleGalleryLike, addGalleryComment
};

$w.onReady(() => {
  const embed = $w("#forumEmbed");

  const reply = (id, result) => {
    embed.postMessage({ source: "ukag-forum", id, ok: result.ok, data: result.data, error: result.error });
  };

  const sendSession = async () => {
    const result = await getSession();
    embed.postMessage({ source: "ukag-forum", event: "session", data: result.ok ? result.data : { member: null } });
  };

  embed.onMessage(async (event) => {
    const msg = event.data;
    if (!msg || msg.source !== "ukag-forum" || typeof msg.action !== "string") return;

    if (msg.action === "login" || msg.action === "signup") {
      authentication.promptLogin({ mode: msg.action, modal: true })
        .then(() => sendSession())
        .catch(() => reply(msg.id, { ok: false, error: "Login was cancelled." }));
      reply(msg.id, { ok: true, data: { prompted: true } });
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
