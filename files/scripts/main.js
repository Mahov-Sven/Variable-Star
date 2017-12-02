$(document).ready(() => {
	
	let extended = true;
	$("#SIDE_BAR_SLIDER").click(() => {
		extended = !extended;
		$("#SIDE_BAR_ARROW").toggleClass("ArrowActive");
		if(extended){
			$("#SIDE_BAR_CONTENT").show();
		}else{
			$("#SIDE_BAR_CONTENT").hide();
		}
	});
});