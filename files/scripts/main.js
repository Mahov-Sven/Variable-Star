$(document).ready(() => {
	
	const physics = {
			initial: {
				starMass: 0,
				shellMass: 0,
				pressure: 0,
				radius: 0,
				deltaT: 0,
				gamma: 0,
				temp: 0,
			},
			data: {
				velocity: 0,
				radius: 0,
				pressure: 0,
				luminosity: 0,
				time: 0,
			},
			graph: {
				array: [],
				max: 0,
				min: Infinity,
				mul: 0,
			}
	}
	
	let scale = 10;
	const scrScale = 1.1;
	document.getElementById("STAR_FIELD").addEventListener("mousewheel", (e) => {
		if(e.wheelDelta > 0){
			scale *= scrScale;
		}else{
			scale /= scrScale;
		}
	}, false);
	
	$(window).resize((e) => {
		if(e.target.id !== "PERIOD_MEASURER"){
			initCanvas();
		}
	})
	
	$("#SIDE_BAR_SLIDER").click(() => {
		handleSideBar();
	});
	
	$("#PLAY_BACKWARD").click(() => {
		handlePlayButton(0);
	});
	
	$("#PLAY_PAUSE").click(() => {
		handlePlayButton(1);
	});
	
	$("#PLAY_FORWARD").click(() => {
		handlePlayButton(2);
	});
	
	$("#PERIOD_MEASURER").resizable({
		handles: 'w,e',
	});
	
	let checked = true;
	$("#I_BORDER").change(() => {
		checked = !checked;
		if(checked){
			$("#STAR").css("border-width", "10pt");
			console.log("here");
		}else{
			$("#STAR").css("border-width", "0pt");
		}
	});
	
	let playButton = 1;
	function handlePlayButton(button){
		$("#PLAY_BACKWARD").removeClass("ActivePlayButton");
		$("#PLAY_PAUSE").removeClass("ActivePlayButton");
		$("#PLAY_FORWARD").removeClass("ActivePlayButton");
		switch(button){
		case 0:
			$("#PLAY_BACKWARD").addClass("ActivePlayButton");
			playButton = 0;
			break;
		case 1:
			$("#PLAY_PAUSE").addClass("ActivePlayButton");
			playButton = 1;
			break;
		case 2:
			$("#PLAY_FORWARD").addClass("ActivePlayButton");
			playButton = 2;
			break;
		}
	}
	
	let extended = true;
	function handleSideBar(){
		extended = !extended;
		$("#SIDE_BAR_ARROW").toggleClass("ArrowRight");
		if(extended){
			$("#SIDE_BAR_CONTENT").show();
		}else{
			$("#SIDE_BAR_CONTENT").hide();
		}
	}
	
	function numbDigits(numb){
		if(numb === 0) return 1;
		return Math.ceil(Math.log10(Math.abs(numb)));
	}
	
	function displayNumber(numb){
		if(numb === 0) return 0;
		
		const digits = numbDigits(numb);
		const decimal = numb / Math.pow(10, digits - 1);
		const result = String(parseFloat(decimal)).substring(0, 8) + "E" + (digits - 1);
		return result;
	}
	
	function updatePhysics(){
		const iStarMass = Number($("#I_STAR_MASS").val());
		const iShellMass = Number($("#I_SHELL_MASS").val());
		const iPressure = Number($("#I_PRESSURE").val());
		const iRadius = Number($("#I_RADIUS").val());
		const iDeltaT = Number($("#I_DELTA_T").val());
		const iGamma = Number($("#I_GAMMA").val());
		const iTemp = Number($("#I_TEMPURATURE").val());
		const iGraphMul = Number($("#I_GRAPH_WIDTH").val());
		
		const change = 	(iStarMass !== physics.initial.starMass) || 
						(iShellMass !== physics.initial.shellMass) || 
						(iPressure !== physics.initial.pressure) || 
						(iRadius !== physics.initial.radius) || 
						(iDeltaT !== physics.initial.deltaT) ||
						(iGamma !== physics.initial.gamma) ||
						(iTemp !== physics.initial.temp) ||
						(iGraphMul !== physics.graph.mul);
		
		physics.initial.starMass = iStarMass;
		physics.initial.shellMass = iShellMass;
		physics.initial.pressure = iPressure;
		physics.initial.radius = iRadius;
		physics.initial.deltaT = iDeltaT;
		physics.initial.gamma = iGamma;
		physics.initial.temp = iTemp;
		physics.graph.mul = iGraphMul;
						
		if(change){
			clearCanvas(graphics, width, height);
			
			physics.graph.max = 0;
			physics.graph.min = Infinity;
			physics.data.velocity = 0;
			physics.data.radius = iRadius;
			physics.data.pressure = iPressure;
			physics.data.luminosity = calcLuminosity(iRadius, iTemp);
			physics.data.time = 0;
		}else{
			const dTime = (playButton - 1) * physics.initial.deltaT;
			const vInitial = physics.data.velocity;
			const rInitial = physics.data.radius;
			const pInitial = physics.data.pressure;
			const vFinal = calcVelocity(vInitial, rInitial, pInitial, physics.initial.shellMass, physics.initial.starMass, dTime);
			const rFinal = calcRadius(rInitial, vFinal, dTime);
			const pFinal = calcPressure(pInitial, rInitial, rFinal, physics.initial.gamma);
			const lFinal = calcLuminosity(rFinal, physics.initial.temp);
						
			physics.data.velocity = vFinal;
			physics.data.radius = rFinal;
			physics.data.pressure = pFinal;
			physics.data.luminosity = lFinal;
			physics.data.time += dTime;
			
			if(physics.data.radius < 0) return;
		}
		
		physics.graph.max = physics.data.luminosity > physics.graph.max ? physics.data.luminosity : physics.graph.max;
		physics.graph.min = physics.data.luminosity < physics.graph.min ? physics.data.luminosity : physics.graph.min;
		
		if(playButton !== 1) physics.graph.array.push(physics.data.luminosity);
		
		$("#D_VELOCITY").val(displayNumber(physics.data.velocity));
		$("#D_RADIUS").val(displayNumber(physics.data.radius));
		$("#D_PRESSURE").val(displayNumber(physics.data.pressure));
		$("#D_LUMINOSITY").val(displayNumber(physics.data.luminosity));
		$("#D_TIME").val(displayNumber(physics.data.time));
	}

	function resizeCanvas(){
		const canvas = $("#GRAPH");
		canvas.removeAttr("width");
		canvas.removeAttr("height");
		canvas.attr("width", canvas.width());
		canvas.attr("height", canvas.height());
		$("#PERIOD_MEASURER").height(canvas.height());
	}
	
	function setColor(graphics, r, g, b, a = 1.0){
		graphics.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
	}
	
	function clearCanvas(graphics, width, height){
		setColor(graphics, 10, 12, 17);
		graphics.fillRect(0, 0, width, height);
		setColor(graphics, 255, 255, 255);
	}
	
	function drawPoint(graphics, x, y){
		graphics.beginPath();
		graphics.arc(x, y, 1, 0, 2 * Math.PI, false);
		graphics.fill();
	}
	
	function brightnessPercent(b){
		const max = physics.graph.max;
		const min = physics.graph.min;
		return 1 - ((max - b)/(max - min));
	}
	
	function shiftCanvas(graphics, shift){
		graphics.globalCompositeOperation = "copy";
		graphics.drawImage(graphics.canvas, -shift, 0);
		graphics.globalCompositeOperation = "source-over";
	}
	
	let canvas = undefined;
	let graphics = undefined;
	let width = undefined;
	let height = undefined;
	let frameCounter = 0;
	
	function draw(ups){
		if(playButton !== 1 && frameCounter === 0) {
			shiftCanvas(graphics, 1);
			setColor(graphics, 10, 12, 17);
			graphics.fillRect(width - 1, 0, width, height);
		}
		
		setColor(graphics, 255, 255, 255);
		
		let vert = undefined;
		while(physics.graph.array.length > 0){
			vert = physics.graph.array.shift();
			const y = height * (1 - brightnessPercent(vert));
			drawPoint(graphics, width, y);
		}
		
		const radius = physics.data.radius / rSun * scale;
		$("#STAR").css("width", `${radius}pt`);
		$("#STAR").css("height", `${radius}pt`);
		$("#STAR").css("top", `-${radius / 2}pt`);
		$("#STAR").css("right", `${radius / 2}pt`);
		$("#STAR").css("opacity", `${0.5 * brightnessPercent(vert) + 0.5}`);
	
		const size = $("#PERIOD_MEASURER").width();
		$("#D_PERIOD").val(displayNumber(physics.initial.deltaT * size * physics.graph.mul * ups));
		
		frameCounter += ups;
		if(frameCounter > physics.graph.mul) frameCounter = 0;
	}
	
	function update(){
		const ups = Number($("#I_UPS").val());
		for(let u = 0; u < ups; u++){
			updatePhysics();
		}
		draw(ups);
	}
	
	function run(){
		update();
		
		window.requestAnimationFrame(run);
	}
	
	function initCanvas(){
		resizeCanvas();
		canvas = document.getElementById("GRAPH");
		console.assert(canvas.getContext, "The canvas does not have a context");
		graphics = canvas.getContext("2d");
		width = canvas.width;
		height = canvas.height;
		clearCanvas(graphics, width, height);
	}
	
	function init(){
		initCanvas();
		run();
	}
	
	const G = 6.67259E-11;
	function calcVelocity(vInitial, rInitial, pInitial, m, M, deltaT){
		return vInitial + (((4 * Math.PI * Math.pow(rInitial, 2) * pInitial)/(m)) - ((G*M)/(rInitial * rInitial))) * deltaT;
		return vInitial + (4 * Math.PI * Math.pow(rInitial, 2) * pInitial / m - G * M) * deltaT;
	}
	
	function calcRadius(rInitial, vFinal, deltaT){
		return rInitial + vFinal * deltaT;
	}
	
	function calcPressure(pInitial, rInitial, rFinal, gamma){
		return pInitial * Math.pow((rInitial / rFinal), 3 * gamma);
	}
	
	const lSun = 3.846E26;
	const rSun = 6.957E8; 
	const tSun = 5772;
	function calcLuminosity(r, t){
		return lSun * Math.pow(r / rSun, 2) * Math.pow(t / tSun, 4);
	}
	
	init();
});

/*
		Sun
mass		1.989E30
shell		2.772E20
pressure	12500
radius		6.957E8
t			1E2
sh			1.66666666
temp		5772

*/