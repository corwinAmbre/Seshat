function closeMoreInfo(source) {
	$(source).parents("div.moreinfo").fadeOut();
}

function openLoginOverlay() {
	$(".login-overlay").slideToggle();
}

var vueExt;

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
	});
	Vue.use(VueValidator);
	new Vue({
		el: '#login'
	});
	vueExt = new Vue({
		el: '#createUser',
		validators: {
			equalValues: function(val, rule) {
				return val == $("#" + rule).val();
			}
		}
	})
});