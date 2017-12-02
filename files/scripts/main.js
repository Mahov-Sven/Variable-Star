$(document).ready(() => {
	const G = 6.6748E-11;
	
	let extended = true;
	$("#SIDE_BAR_SLIDER").click(() => {
		extended = !extended;
		$("#SIDE_BAR_ARROW").toggleClass("ArrowRight");
		if(extended){
			$("#SIDE_BAR_CONTENT").show();
		}else{
			$("#SIDE_BAR_CONTENT").hide();
		}
	});
	
	function calcVelocity(vInitial, rInitial, pressureInitial, m, M, deltaT){
		return vInitial + (((4 * Math.PI * rInitial * rInitial * pressureInitial)/(m)) - ((G*M)/(rInitial * rInitial))) * deltaT;
	}
	
	function calcRadius(rInitial, vFinal, deltaT){
		return rInitial + vFinal * deltaT;
	}
	
	function calcPressure(pressureInitial, rInitial, rFinal){
		return pressureInitial * Math.pow((rInitial / rFinal), 3);
	}
});