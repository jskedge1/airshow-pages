// Added to masterPage.js (site code that runs on every page), called first in $w.onReady.
// The old August policy pages now live as tabs on /policies, so their addresses open the new page.
function oldPoliciesToNew() {
	const path = wixLocationFrontend.path || [];
	const old = ['privacypolicy', 'cookiepolicy', 'websitetermsandconditions'];
	if (old.indexOf(path[0]) !== -1) wixLocationFrontend.to('/policies');
}
