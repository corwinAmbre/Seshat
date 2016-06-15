function closeMoreInfo(source) {
	$(source).parents("div.moreinfo").fadeOut();
}

$(document).ready(function() {
	$(".moreinfo").click(function(e){
		if (e.target !== this) {
			return;
		}
		$(this).fadeOut();
	});
	$(".feature.withinfo").click(function(e) {
		if($(e.target).hasClass("moreinfo") || $(e.target).parents(".moreinfo").length > 0) {
			return;
		}
		$(this).find(".moreinfo").fadeIn();
	})
});