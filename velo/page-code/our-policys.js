// Page code for the Our Policys list page (/ourpolicys, page id na0qf).
// Each Read More button opens the full policies page, where every policy has its own tab.
$w.onReady(function () {
	$w('#listRepeater').onItemReady(($item) => {
		$item('#MoreButton').link = '/policies';
		$item('#MoreButton').target = '_self';
	});
	$w('#listRepeater').forEachItem(($item) => {
		$item('#MoreButton').link = '/policies';
		$item('#MoreButton').target = '_self';
	});
});
