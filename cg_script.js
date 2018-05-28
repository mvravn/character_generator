// Console tips: https://www.youtube.com/watch?v=xkzDaKwinA8

/*
Transformations
1) Roll the dice; info expands, button1 changes
2) Swap; info collapses, suggestions expand, button 1 disappears, button 2 is revealed
2b) Human Variant or ½E; button 1 reveals, button 2 disappears, scrolls up
3) Pics disappear, button 1 disappears, copy-sheet appears

Missing
- Proper delay when showing copy-sheet. It's requires some tinkering since two things happen at once; something is removed and something is added.

*/

"use strict";

// Global Variables
var abilityScore = []; // The array of ability scores
var abilityScoreTotal = 0; // The sum of all Ability Scores for the character
var modArray = []; // The sum of all Ability Scores for the character
var modVArray = []; // Communicates to the user if the value of the Modification is positive. Negative shows on its own
var modTotal = 0; // All Modifiers summed up
var abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]; // Array of Abilities

const humanoids = [
	[0,0,2,0,1,0,"Hill Dwarf","Gets +1 HP per level"],
	[2,0,2,0,0,0,"Mountain Dwarf","Has Light and Medium armor proficiency"],
	[0,2,0,1,0,0,"High Elf","Knows a cantrip of your own choice"],
	[0,2,0,0,1,0,"Wood Elf","Has a little extra movement each turn"],
	[0,2,0,0,0,1,"Lightfoot Halfling","Lucky - rerolls 1's for attacks, saving throws and ability checks"],
	[0,2,1,0,0,0,"Stout Halfling","Lucky - rerolls 1's for attacks, saving throws and ability checks"],
	[2,0,0,0,0,1,"Dragonborn","Has breathweapon, has resistance to same damage type"],
	[0,1,0,2,0,0,"Forest Gnome","Advantage on saves vs most spells, knows a cantrip"],
	[0,0,1,2,0,0,"Rock Gnome","Advantage on saves vs most spells"],
	[2,0,1,0,0,0,"Half-Orc","Savage Attacks means you deal more damage on critical hits"],
	[0,0,0,1,0,2,"Tiefling","Knows some spells, has resistance to fire"]
];

const humanity = [
	["Half Elf", "Gets +1 to two other abilities and proficiency in two skills"],
	["Variant Human", "Gets +1 to two abilities and may chose one Feat (special ability)"],
	["Human", "Gets +1 to every ability"]
];

/* ===== FOR TESTING CODE ===== */


// Old function rollDie()
function rollAbilities() {
	
	// Toggle buttons
	document.getElementById("swapButton").classList.remove("button--gone");
	document.getElementById("rollButton").className = "button--gone";
	
	var diceArray = []; // This array holds the 3 values of the 6-sided dice
	
	for(let j = 0; j < 6; j++) {
		for(let i = 0; i < 3; i++) {
			// sdr = "single die roll" - Math.random() gives number between 0 and 1, Math.floor rounds down
			var sdr = Math.floor(Math.random()*6)+1;
			diceArray.splice(i, 1, sdr);
		}
		// Adds the three dice together
		abilityScore.splice(j, 1, (diceArray[0] + diceArray[1] + diceArray[2]));
	}
	
	console.log("Ability Scores:", abilityScore[0], abilityScore[1], abilityScore[2], abilityScore[3], abilityScore[4], abilityScore[5]);
	
	// Get Modifier Total while at it
	abilityScoreTotal = 0; // Resets abilityScoreTotal for re-rolls
	for (let i = 0; i < 6; i++) {
		abilityScoreTotal += abilityScore[i];
	}
	
	console.log("abilityScoreTotal", abilityScoreTotal);

	calculateModifiers();
	
	// Sums up the Modifications total
	modTotal = (modArray[0] + modArray[1] + modArray[2] + modArray[3] + modArray[4] + modArray[5]);

	
	 /* ===== CRITERIAS' CONDITION PRE-CALCULATORS ===== */	
	
	// Condition for criteria "At least one below 10"
	let negativeModifiers = 0;
	for (let i = 0; i < 6; i++) {
		if (abilityScore[i] < 10) {negativeModifiers++;}
	}
	console.log("negativeModifiers", negativeModifiers)
	
	// Condition for criteria "Check for a 15 or 16" 
	let pass = 0;
	for (let i = 0; i < 7; i++) { // To later check for one value of 15 or 16
		if (i == 2){continue;} // CON does not qualify, since it isn't a the main ability for any class
		if (abilityScore[i] === 15){pass++;}
		if (abilityScore[i] === 16){pass++;}
	}
	console.log("pass", pass);
	
	// Condition for criteria "Check for a 15 or 16". Amount of odd Ability Scores - these are important, since the Human race can become too strong.
	let odd = 0; 
	for(let i = 0; i < abilityScore.length; i++) {
		if ((abilityScore[i]%2) === 1) {
			odd++;
		}
	}
	console.log("odd", odd);
	
	// Test if any Ability Score is under 7
	let tooLow = false;
	for(let i = 0; i < abilityScore.length; i++) {
		if (abilityScore[i] < 7) {
			tooLow = true;
		}
	}
	
	
	/* ===== CRITERIAS ===== */
	
	// Too good or too weak?
	if ((abilityScoreTotal < 72) || (abilityScoreTotal > 75)){
		rollAbilities();
		console.count("too good or too weak");
		return;
	}
	
	// At least one Ability Score below 10 or re-roll
	else if ((negativeModifiers === 0) || (negativeModifiers > 2)) {
		rollAbilities();
		console.count("negativeModifiers fail");
		return;
	} 	
	
	// CON can't be negative
	else if (abilityScore[2] < 10) {
		rollAbilities();
		console.count("bad CON");
		return;
	} 	
	
	// Check for a 15 or 16
	else if (pass === 0) { 
		rollAbilities();
		console.count("no 15 or 16");
		return;
	}
	
	// Can't have abilityScoreTotal of 72 or 73 AND best abilityScore of 15
	else if ((Math.max.apply(Math, abilityScore) === 15) && (abilityScoreTotal < 74)){ 
		rollAbilities();
		console.count("both 15 and lower 50%");
		return;
	}
	
	// Not too many odds combined with too high abilityScoreTotal
	else if (((abilityScoreTotal+odd) > 78) || ((abilityScoreTotal+odd) < 75)){
		console.count("Too many odds ", abilityScoreTotal, odd)
		rollAbilities();
	}
	
	// Can't have Ability Score below 7". 
	else if (tooLow) {
		rollAbilities();
		console.count("Ability Score below 7");
		return;
	}
	
	// Not 3 Modifiers of 0, not 3 Abilisty Scores alike nor 2 pairs, highest isn't a duplicate
	else if (duplicates(abilityScore)){ 
		rollAbilities();
		console.count("duplicates fail");
		return;
	}
	
	else {
	console.log("Ability Scores:", abilityScore[0], abilityScore[1], abilityScore[2], abilityScore[3], abilityScore[4], abilityScore[5], abilityScoreTotal, "DONE!");
	revealAbilities()
	}
}	


// Any triplets or double pairs? Called for criteria in "function rollAbilities()".
function duplicates(abilityScore){
	let dup = 0;
	let zeroMod = 0;
	let highest = Math.max.apply(Math, abilityScore);
	let highDup = 0;
	for(let i = 0; i < abilityScore.length; i++) {
		let h = i;
		while (h < 5){
			// Not 3 alike or two pairs
			if ((abilityScore[i] - abilityScore[h+1]) === 0) {
				dup++;
				h++;
				if (dup === 2) {return true;}
			}
			else {h++;}
		}
		
		// Not 3 modifiers of 0
		if ((abilityScore[i] == 10) || (abilityScore[i] == 11)){
			zeroMod++;
			if (zeroMod === 3) {return true;}
		}
		
		// Highest is not a duplicate
		if ((abilityScore[i] - highest) == 0) {
			highDup++;
			if (highDup === 2) {return true;}
		}
	}
	return false;
}


var modVArray2 = []; // Array styled for the "pre" element
// Determine modifier AND make it explicit if it is a bonus (+), used a few different places
function calculateModifiers() {
	for(let i = 0; i < 6; i++){
		let mod = Math.floor((abilityScore[i]-10)/2);
		modArray.splice(i, 1, mod);
		if (mod > 0) {
			modVArray.splice(i, 1, "+");
			modVArray2.splice(i, 1, "+");
		}
		else if (mod < 0) {
			modVArray.splice(i, 1, "&nbsp;");
			modVArray2.splice(i, 1, "");
		}
		else {
			modVArray.splice(i, 1, "&nbsp;&nbsp;");
			modVArray2.splice(i, 1, "&nbsp;");
		}	
	}
}	


// Governs how the stats are being revealed to the user
function revealAbilities() {
	
	// Write to sheet, so there's something to reveal
	writeToSheet();
	
	// REVEAL ABILITIES code
	let nums = [0,1,2,3,4,5];
	let ranNums = [];
	{let i = nums.length; // Brackets lets the "let i" function without issues, but it is a hack.

		// Shuffles nums into ranNums
		while (i--) {
			let j = Math.floor(Math.random() * (i+1));
			ranNums.push(nums[j]);
			nums.splice(j,1);
		}
	}
	
	for (let i = 0; i < 7; i++) {
		let delay = i*900*2;
		var revealTicker = setTimeout(doReveal, delay);
		revealTicker;
	}
	
	let i = 0;
	function doReveal () {
		//console.log("i: ", i);
		if (i < 6) {
			//console.log("ranNums i: ", ranNums[i])
			let a = 1+ranNums[i]; // a is every row in column 1 from row 1, not 0.
			//console.log(a);
			let x = document.getElementsByClassName("table__column__1"); // Targets the second column of data cells in table__0 (the first table)
			x[a].className += " data--reveal data--reveal--slide"; // Reveals this particular data cell, without anything else - this lets the user see the numbers before all the modifiers and checkboxes.
			i++;
		}
		else {
			// Reveals all the rest of the relevant data cells plus the two Total stats
			let x = document.getElementsByClassName("data");
			let len = x.length;
			for (let i = 0; i < len; i++) {
				x[i].className += " data--reveal";
			}
			let y = document.getElementsByClassName("checkbox");
			for (let i = 0; i < 6; i++) {
				
				y[i].className = "checkbox"; // Removes the "checkbox--hidden" class
			}
			document.getElementById("AST").className += " data--reveal data--reveal--pop";
			document.getElementById("MT").className += " data--reveal data--reveal--pop";
			// document.getElementById("plan").classList.remove("item--gone");
			animateCollapse('infolist');
			setTimeout(animateReveal('plan'), 1500); // Reveals the plan Div
		}
	}
}


// Instantly writes to the sheet
function writeToSheet() {
	
	calculateModifiers();
	document.getElementById("AST").innerHTML = abilityScoreTotal;
	document.getElementById("MT").innerHTML = modTotal;
	
	for (let i = 0; i < 6; i++) {
		let a = 1+i;
		let x = document.getElementsByClassName("table__column__1");
		x[a].innerHTML = abilityScore[i];
	}

	for (let i = 0; i < 6; i++) {
		let a = 1+i;
		let x = document.getElementsByClassName("table__column__2");
		x[a].innerHTML = modVArray[i];
		x[a].innerHTML += modArray[i];
	}
}


// Swaps two Ability Scores if checked, and skips to next step if none are chosen
function swapRequest() {
// Function of true or false if-checked statements to work with - activates on "submit"	
	
	// Toggle buttons and elements, reveal radio buttons
	document.getElementById("swapButton").className = "button--hidden";
	document.getElementById("pickButton").classList.remove("button--hidden");
	setTimeout(animateReveal('button2'), 1500);
	animateCollapse('button1');
	
	
	let len = humanoids.length+3;
	for (let i = 0; i < len; i++) {
		document.getElementsByName("race")[i].classList.remove("data__1--hidden");
	}
	
	var zero = document.getElementById("checkbox__0").checked;
	var one = document.getElementById("checkbox__1").checked;
	var two = document.getElementById("checkbox__2").checked;
	var three = document.getElementById("checkbox__3").checked;
	var four = document.getElementById("checkbox__4").checked;
	var five = document.getElementById("checkbox__5").checked;

	var alpha;
	var beta;
	var zeta;
	var boxAmount = 0;
	
	if (zero) {boxAmount = boxAmount +1;}
	if (one) {boxAmount = boxAmount +1;}
	if (two) {boxAmount = boxAmount +1;}
	if (three) {boxAmount = boxAmount +1;}
	if (four) {boxAmount = boxAmount +1;}
	if (five) {boxAmount = boxAmount +1;}

	// If-statement; none chosen -> warning, more than two chosen -> failure/Gully Dwarf? Bupu stats easteregg.
	/*
	if (boxAmount != 0 && (boxAmount > 2 || boxAmount == 1)) {
		alert("No Gully Dwarves allowed!");
	}
	*/
	if (boxAmount === 2) {
		// find chosen picks, run array swapper
		if (zero) {alpha = abilityScore[0]; zeta = 0; zero = false;}
		else if (one) {alpha = abilityScore[1]; zeta = 1; one = false;}
		else if (two) {alpha = abilityScore[2]; zeta = 2; two = false;}
		else if (three) {alpha = abilityScore[3]; zeta = 3; three = false;}
		else {alpha = abilityScore[4]; zeta = 4; four = false;}
		
		// Array swapping begins
		if (one) {beta = abilityScore[1]; abilityScore.splice(1, 1, alpha); finalSwap();}
		else if (two) {beta = abilityScore[2]; abilityScore.splice(2, 1, alpha); finalSwap();}
		else if (three) {beta = abilityScore[3]; abilityScore.splice(3, 1, alpha); finalSwap();}
		else if (four) {beta = abilityScore[4]; abilityScore.splice(4, 1, alpha); finalSwap();}
		else {beta = abilityScore[5]; abilityScore.splice(5, 1, alpha); finalSwap();}
		
		// Final swaps
		function finalSwap() {
			if (zeta == 0) {abilityScore.splice(0, 1, beta);}
			else if (zeta == 1) {abilityScore.splice(1, 1, beta);}
			else if (zeta == 2) {abilityScore.splice(2, 1, beta);}
			else if (zeta == 3) {abilityScore.splice(3, 1, beta);}
			else {abilityScore.splice(4, 1, beta);} 
		}
		/*
		animateCollapse('plan');
		animateReveal('pickToggle');
		*/
		colRev('plan', 'pickToggle');
	}
	
	if (boxAmount === 0) {
		/*
		animateCollapse('plan');
		animateReveal('pickToggle');
		*/
		colRev('plan', 'pickToggle');
	}
	
	// calculateModifiers();
	
	writeToSheet();	
		
	//Uncheck boxes
	zero = document.getElementById("checkbox__0").checked = false;
	one = document.getElementById("checkbox__1").checked = false;
	two = document.getElementById("checkbox__2").checked = false;
	three = document.getElementById("checkbox__3").checked = false;
	four = document.getElementById("checkbox__4").checked = false;
	five = document.getElementById("checkbox__5").checked = false;
	
	// Hide checkbox columns again
	let y = document.getElementsByClassName("checkbox");
	for (let i = 0; i < y.length; i++) {
		y[i].className += " checkbox--hidden";
	}

	// }
	/*
	// Hide classText
	document.getElementById("classText").className = "fade hidden";
	document.getElementById("classText").style.visibility = "hidden";
	
	charAna();
	*/
}	


// Analyzes the Ability Scores and makes suggestions on how to improve either best or average 
function charAna() {

	// Variables for the entire function
	var twoSecondaries = false;
	var highOdd = false;
	var lowOdd = false;
	var bestLocation = []; // What are the positions in the abilityScore of the 3 best ability scores?
	var sorting = [];
	var subSet = [];
	var subSubSet = [];
	var odd = 0;
	// var specialCase = false; // Legacy?
	var WIScase = false;
	
	// Copy, sort and check for duplicate
	var i = abilityScore.length;
	while(i--) { // Copies array
		sorting[i] = abilityScore[i];
	}
	sorting.sort(function(a, b){return b-a}); // Sorts the new array
	if (sorting[1] === sorting[2]) { // Checks for duplicates
		twoSecondaries = true;
	}
	
	// Do a for loop to find locations for 1, 2 and 3 in original array (edited for WIScase with 4th value
	for (let i = 0; i < 4; i++) {
		// if twoSecondaries = false if i == 2 break;
		var j = 0;
		while (j < 6){
			// Don't count twice (bestLocation[2] prob. isn't needed, but skips a few cycles)
			if ((j === bestLocation[0]) || (j === bestLocation[1]) || (j === bestLocation[2]) || (j === bestLocation[3])) {
				j++;
				continue; // skip/continue if a location is already in array
			}
			// Find 4 locations
			if	(abilityScore[j] === sorting[i]) {
				bestLocation[i] = j;
				break; // break if a value is found
			}
			j++;
		}
	} 
	
	console.log("First ", bestLocation[0], "Value ", sorting[0]);
	console.log("Second ", bestLocation[1], "Value ", sorting[1]);
	console.log("Third ", bestLocation[2], "Value ", sorting[2]);
	console.log("Fourth ", bestLocation[3], "Value ", sorting[3]);
	
		// Is highest odd?
	if ((sorting[0]%2) === 1) {
		highOdd = true;
	}
		// Is second highest odd?
	if ((sorting[1]%2) === 1) {
		lowOdd = true;
	}
		// Is WIS best and a value that cannot have its modifier improved?
	if ((bestLocation[0] === 4) && (highOdd === false)) {
		WIScase = true;
		
		// Similar to skipping WIS in locations
		bestLocation[0] = bestLocation[1];
		bestLocation[1] = bestLocation[2];
		bestLocation[2] = bestLocation[3];
	}
	console.log("WIScase: ", WIScase);
	
// 				===== SUGGESTIONS STARTS HERE =====

	// Give at least 2 suggestions - best humanoid and humanity. Show modifiers and new modifiers

	var subSet = []; // Array for matching races
	var subSubSet = []; // Refined array for matching races
	
	// Special case where the highest is odd, but the second highest is even - this makes the reverse distribution of humanoid stat-bonuses optimal. 
	if ((highOdd == true) && (lowOdd == false) && (bestLocation[1] != 4) && (bestLocation[0] != 0)) { // Inverted suggestion for funny case. Exclude WIS as the +2 and STR as the +1, since those do not exist
		// Start with second highest
		console.log("Funnycase! (high odd, next even)");
		var e = bestLocation[0];
		var j = 0;
		for (let i = 0; i < humanoids.length; i++) {
			if (humanoids[i][e] === 1) { //if humanoid of subSet's value has secondary value of 2 
				subSet[j] = i; // adds this race to the subSet array
				j++;
			}
		}

		// Get a subset for the largest number
		var d = bestLocation[1]; // d is the location of the ability scores' highest value
		j = 0;
		for (let i = 0; i < subSet.length; i++) {
			var f = subSet[i]; // f is the races with the ability score of 2 in the secondary ability scores.
			if (humanoids[f][d] === 2) { // Checks each of subSet's races in humanoids' for above 0 in the character's best value
				subSubSet[j] = f; // Creates array of wanted races. ISSUE: Check these 3 names, this one isn't declared outside of this function.
				j++;
			}
		}
		
		// if (twoSecondaries == true) // Ingen grund til two secondaries, siden der er tale om en +2 der altid vil give en bonus
		
		d = bestLocation[2]; // IS THIS NECESSARY ? ? ? d is the location of the ability scores' highest value
		
		for (let i = 0; i < subSet.length; i++) {
			var f = subSet[i]; // f is the races with the ability score of 2 in the secondary ability scores.
			if (humanoids[f][d] === 2) { // Checks each of subSet's races in humanoids' for above 0 in the character's best value
				subSubSet[j] = f; // Adds to array of wanted races. 
				j++;
			}
		}
		
		// In case the subSubSet is empty, use the less specific subSet
		if (subSubSet.length == 0) {
			subSubSet = subSet;
		}
			
		// If second highest is odd too just treat highest as if even and let the Human Factor do its convincing. Maybe suggest a Variant Human or Half Elf, dependent on total number of unevens.
	}
	
	else { // Suggesting stats improvements. Above; Inverted case, where high is odd.
	
		if (WIScase) { // WIS is best and even - this messes with suggestions if not handled separately
			document.getElementById("WISother").innerHTML = "other ";
			document.getElementById("specialCaseWis").innerHTML = "<p>Your character is a special case. None of the races offered in the original D&D 5e can improve your WIS modifier (this happens only when WIS is both your best ability score and an even number).</p>";
			// twoSecondaries or not - should be possible to write so it doesn't matter at all, since I've got locations and not just values.
			
			if (twoSecondaries) { // In case of duplicates
				// test if there's a race that matches with either WIScase main and secondary. If not, list both.
				var e = bestLocation[0];
				var j = 0;
				for (let i = 0; i < humanoids.length; i++) {
					if (humanoids[i][e] === 2) { //if humanoid of subSet's value has secondary value of 2 
						subSet[j] = i; // adds this race to the subSet
						j++;
					}
				}
				
				console.log("subSet.length:",subSet.length);
				
				// Run the duplicate and add it to subSet too
				var f = bestLocation[1];
				for (let i = 0; i < humanoids.length; i++) {
					if (humanoids[i][f] === 2) { //if humanoid of subSet's value has secondary value of 2 - f added later for next check below
							subSet[j] = i; // adds this race to the subSet, after the prior set - expands the subSet
						j++;
					}
				}
				console.log("subSet.length 2:",subSet.length);
				// Check if there are races that improve both duplicates, add to subSubSet
				var j = 0;
				for (let i = 0; i < humanoids.length; i++) {
					if ((humanoids[i][e] !== 0) && (humanoids[i][f] !== 0)) {
						// add to subSubSet
						subSubSet[j] = i;
						j++;
					}
				}
				
				// Check if there is a match with the duplicates and the last value
				var d = bestLocation[2]; // d is the location of the ability scores' highest value
				// var j = 0; // Moved up
				for (let i = 0; i < subSet.length; i++) {
					var f = subSet[i]; // f is the races with the ability score of 2 in the secondary ability scores.
					if (humanoids[f][d] > 0) { // Checks each of subSet's races in humanoids' for above 0 in the character's best value
						subSubSet[j] = f; // Creates array of wanted races. ISSUE: Check these 3 names, this one isn't declared outside of this function.
						j++;
					}
				}
				
				console.log("subSubSet.length:",subSubSet.length);

			}
			
			else { // Case of no duplicates
				// test if there's a match with WIScase secondary. If not, test if there are any unevens and suggest that with a vague formulation
				var e = bestLocation[0];
				var j = 0;
				for (let i = 0; i < humanoids.length; i++) {
					if (humanoids[i][e] === 2) { //if humanoid of subSet's value has secondary value of 2 
						subSet[j] = i; // adds this race to the subSet
						j++;
					}
				}
				// Check if there is a match with the duplicates and the last value
				var d = bestLocation[1]; // d is the location of the ability scores' highest value
				var j = 0;
				for (let i = 0; i < subSet.length; i++) {
					var f = subSet[i]; // f is the races with the ability score of 2 in the secondary ability scores.
					if (humanoids[f][d] > 0) { // Checks each of subSet's races in humanoids' for above 0 in the character's best value
						subSubSet[j] = f; // Creates array of wanted races. ISSUE: Check these 3 names, this one isn't declared outside of this function.
						j++;
					}
				}
			}
			
		}
		
		else { // The default of defaults - above, WIScase
		// Maximize highest value through Humanoids - Match highest, narrow arrays
			var d = bestLocation[0];
			var j = 0;
			for (let i = 0; i < humanoids.length; i++) {
				if (humanoids[i][d] === 2) { // Checks each sub-array in humanoids' d value
					// console.log("humanoids[i][d] ", humanoids[i][d]);
					// make a temporary array to use in the next search
					subSet[j] = i; // subSet locations holds which array (race) in humanoids
					// Tested, works.
					
					j++;
				}
				
			}
			console.log("subSet.length", subSet.length);
			console.log("subSet.length", subSet.length);
			// WIS and secondary odd
			if ((subSet.length === 0) && (bestLocation[0] === 4)) {
				subSet = [0,3];
			}
			
			console.log("subSet.length", subSet.length);

		// Secondary instant modifier bonus
			// If there is just one; Match secondary
			var j = 0;
			var e = bestLocation[1]; // Second best attribute score
			for (let i = 0; i < subSet.length; i++) {
				var f = subSet[i]; // Race link
				if (humanoids[f][e] !== 0) { //if humanoid of subSet's value has secondary value of more than 0
					subSubSet[j] = f; // Using i was wrong, f was right
					j++;
				}
			}
			// If there are two; Match secondaries to add to suggestions after an "or you can use this"
			if (twoSecondaries == true) {
				// var j = 0; 	// Removed, they can be a single array
				var e = bestLocation[2];
				for (let i = 0; i < subSet.length; i++) {
					var f = subSet[i];
					if (humanoids[f][e]!== 0) { //if humanoid of subSet's value has secondary value of 1
						subSubSet[j] = f; // Continues the array holding races - Tested, works.
						j++;
					}
				}
			// console.log(subSubSet[0],subSubSet[1],subSubSet[2]); // Will there ever be more than 2? Well, a 3rd can be useful it seems, in particular with the WIScase.
			}
		}
	}
	
	// Remove duplicates from subSubSet, so the same race doesn't risk getting suggested twice
	function eliminateDuplicates(subSubSet) { // stolen from stackexchange, modified for subSubSet. This shouldn't even be a function, I'm thinking. But honestly, reading more about it, I won't be able to understand it for some time. I'll leave it though, because reading about it fascinates me. https://stackoverflow.com/questions/840781/get-all-non-unique-values-i-e-duplicate-more-than-one-occurrence-in-an-array https://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/ 
	  var i,
		  len = subSubSet.length,
		  out = [],
		  obj = {};

	  for (var i=0;i<len;i++) {
		obj[subSubSet[i]]=0;
	  }
	  for (i in obj) {
		out.push(i);
	  }
	  return out;
	}
	eliminateDuplicates(subSubSet); //Works, not understood completely since I had to fix other stuff
	
	// Now fill in the IDs so the html can finally get useful.
	// Case: no subSubSet, empty
	let noGood = false;
	console.log("subSubSet.length: ",subSubSet.length);
	if (subSubSet.length === 0) { // Omdøber subSet til subSubSet
		console.log("noGood");
		let noGood = true;
		let i = subSet.length;
		while(i--) { // Copies array
			subSubSet[i] = subSet[i];
		}
	}
	
	// Get race recommendation(s)
	let g = subSubSet[0];
	console.log(subSubSet[0]);
	let suggest = (humanoids[g][6]); // 6 is race, g is list number
	document.getElementById("sugHumanoid").innerHTML = suggest;

	// If secondary humanoid option
	console.log("twoSecondaries: ",twoSecondaries)
	if (twoSecondaries || noGood || (subSubSet.length === 2)) {
		let h = subSubSet[1];
		if (h !== undefined) {
			let suggest2 = (humanoids[h][6]); // 6 is race, g is list number
			document.getElementById("sugHumanoid2").innerHTML = (" or " + suggest2);
		}
	}
	
	//  maxHumanoid - what is the new maximum modifier value?
	let k = bestLocation[0];
	let maximum = (Math.floor((abilityScore[k]-8)/2)); // -8 = -10+2
	document.getElementById("maxHumanoid").innerHTML = maximum;
	
	//  totBoth gives a dedicated string if there is a good humanoids match of two +1's. Replaced totHumanoid
	if (noGood == false && ((lowOdd) || ((lowOdd === false) && highOdd))) {
		document.getElementById("totBoth").innerHTML = "<em>both</em> of your two highest modifiers by +1 and place your best modifier ";
	}
	
	if ((noGood === false && ((lowOdd) || ((lowOdd === false) && highOdd))) && (WIScase)) {
		document.getElementById("totBoth").innerHTML = "<em>both</em> of your other two highest modifiers by +1 and place your best modifier ";
	}
	
	// pulled out from above statement where it was an || condition: if ((subSubSet[0] == 1) || (subSubSet[1] == 1)) Case for change: abilityScore = [17,15,10,9,14,10];
	
	// Humanity Suggestions Starts
	// Variant Human will be suggested very rarely. Put in a comment or show both HE and VH?
	// odd is number of odd numbers in abilityScore
	for(let i = 0; i < abilityScore.length; i++) {
		if ((abilityScore[i]%2) === 1) {
			odd++;
		}
	}

	console.log("odd ",odd);
	console.log("CHA ",((abilityScore[5]%2)));
	var maxValue = sorting[0];
	console.log("sorting[0]", sorting[0])
	/*
	if (highOdd) {
		maxValue = sorting[0]+1;
	}
	*/
	if (odd < 2) { // Don't be a human
		document.getElementById("poorChoice").innerHTML = "Unfortunately, choosing to play as any of the Humanity races looks like a poor choice for this character - it has too few ability scores which are odd numbers.";
		// document.getElementById("totHumanity").innerHTML = odd;
		// document.getElementById("maxHumanity").innerHTML = (Math.floor((maxValue-10)/2));
	}
	else if (
	((odd === 2) && ((abilityScore[5]%2) != 1)) || 
	(((odd === 3)) && ((bestLocation[0] || bestLocation[1] || bestLocation[2]) === 5))
	) { // Half Elf - Odd CHA is tricky business here
		document.getElementById("sugHumanity").innerHTML = "Half Elf";
		document.getElementById("totHumanity").innerHTML = 3; // This will alway be 3, as two odds can be raised and CHA mod will always go up by one.
		
		if (bestLocation[0] === 5) { // Best value is CHA
			document.getElementById("maxHumanity").innerHTML = (Math.floor((maxValue-8)/2));
		}
		else if (maxValue%2 === 1) { // Best value is odd
			document.getElementById("maxHumanity").innerHTML = (Math.floor((maxValue-9)/2));
		}
		else { // Best value is even and not CHA
			document.getElementById("maxHumanity").innerHTML = (Math.floor((maxValue-10)/2));
		}
		
	}
	else if (odd === 2) { // Variant Human
		document.getElementById("sugHumanity").innerHTML = "Variant Human";
		document.getElementById("totHumanity").innerHTML = 2;
		if (highOdd) { // Will best modifier have it's value improved?
			document.getElementById("maxHumanity").innerHTML = (Math.floor((sorting[0]-9)/2));
		}
		else {
			document.getElementById("maxHumanity").innerHTML = (Math.floor((sorting[0]-10)/2));
		}
	}
	else { // Human
		document.getElementById("sugHumanity").innerHTML = "Human";
		document.getElementById("totHumanity").innerHTML = odd;
		if (highOdd) { // Will best modifier have it's value improved?
			document.getElementById("maxHumanity").innerHTML = (Math.floor((sorting[0]-9)/2));
		}
		else {
			document.getElementById("maxHumanity").innerHTML = (Math.floor((sorting[0]-10)/2));
		}
	}
}


// Make a list with radio buttons using the info on races etc.
function makeList() {
	// Humanoids' part of the list
	
	var len = humanoids.length;
	
	for (var i = 0; i < len; i++) {
		var race = humanoids[i][6]; // Get array's name of race
		var info = humanoids[i][7]; // Get array's info on this race
		var text = ""; 
		var alfa = 0;
		var bravo = 0;
		var a = 0;
		var b = 0;
		for (let j = 0; j < 6; j++) {
			// Every race has two bonuses - place them into alfa and brace
			if ((humanoids[i][j] > 0) && (a === 0)) { // a isn't filled yet
				a = humanoids[i][j]; // Get value (1 or 2)
				alfa = abilities[j]; // Get placement (STR, DEX, etc)
			}
			
			if ((humanoids[i][j] > 0) && (a !== 0)) { // a has already been filled
				b = humanoids[i][j]; // Get value (1 or two)
				bravo = abilities[j]; // Get placement (STR, DEX, etc)
			}
		}
		
		for (let k = 0; k < 5; k++) {
			// Makes the row of 5 "divs" for each humanoid race
			var x = document.createElement("DIV"); // Makes the cell div
			var row = "table__row__" + i;
			var column = "table__column__" + k;
			var classes = "data__1 " + row + " " + column; // Concats the classes, since they can't seem to do so within the setAttribute parenthesis
			x.setAttribute("class", classes); // Gives each cell its own combination of row and column classes, just like the table__0 to begin with
			if (k === 0) {
				// Inserts a column of radio-buttons in the first column
				var t = document.createElement("input"); // Creates an "input" element
				//t.setAttribute("class", "data__1--hidden"); // Hides the buttons until they are needed
				t.setAttribute("type", "radio");
				t.setAttribute("name", "race"); // Having the same name is needed for getting the choice data, IIRC
				t.setAttribute("class", "data__1--hidden"); // Don't show up yet
				t.setAttribute("value", i); // AFAICS not used, but could be used for identifying which race is picked through value
				// t.setAttribute("id", radioID);
				x.appendChild(t); // Places the "input" element inside the current "div" (x)
			}
			else {
				// Creates text element if it isn't in the radio button column
				if (k === 1) {var text = race;}
				else if (k === 2) {var text = alfa + " +" + a;}
				else if (k === 3) {var text = bravo + " +" + b;}
				else {var text = info;}
				
				var t = document.createTextNode(text); // Sets the text-node to use the "text" set above
				x.appendChild(t); // Places the "text" <p> element into the "div" (x)
			}
			document.getElementById("table__1").appendChild(x); // Finally places the "div" in the "table__1" element
		}
	}
	
	// Humanity's part of the list, 3 races
	for (i = len; i < len+3; i++) {
		
		var j = i-len;
		var race = humanity[j][0];
		var info = humanity[j][1];
	
		for (let k = 0; k < 5; k++) {
			// Makes a row of 5 "divs" for each race in humanity
			var x = document.createElement("DIV"); // Makes the cell div
			var row = "table__row__" + i;
			var column = "table__column__" + k;
			var classes = "data__1 " + row + " " + column; // Concats the classes, since they can't seem to do so within the setAttribute parenthesis
			x.setAttribute("class", classes); // Gives each cell its own combination of row and column classes, just like the table__0 to begin with
			if (k === 0) {
				// Inserts the column of radio-buttons in the first column
				var t = document.createElement("input"); // Creates an "input" element
				//t.setAttribute("class", "data__1--hidden"); // Hides the buttons until they are needed
				t.setAttribute("type", "radio");
				t.setAttribute("name", "race"); // Having the same name is needed for getting the choice data, IIRC
				t.setAttribute("class", "data__1--hidden"); // Don't show up yet
				t.setAttribute("value", i); // AFAICS not used, but could be used for identifying which race is picked through value
				// t.setAttribute("id", radioID);
				x.appendChild(t); // Places the "input" element inside the current "div" (x)
			}
			else {
				// Creates text element if it isn't in the radio button column
				if (k === 1) {var text = race;}
				else if (k === 2) {var text = "-";}
				else if (k === 3 && j === 0) {var text = "CHA +2";}
				else if (k === 3) {var text = "-";}
				else {var text = info;}
				
				var t = document.createTextNode(text); // Sets the text-node to use the "text" set above
				x.appendChild(t); // Places the "text" <p> element into the "div" (x)
			}
			document.getElementById("table__1").appendChild(x); // Finally places the "div" in the "table__1" element
		}
	}	
}
makeList();


// Gets the choice of race from the radio button list and adds it to the Ability Scores. Also lets the user add via checkboxes if they pick Variant Human or Half Elf
var raceChoice = 0;
function getChoice() {
	
	// Toggle buttons are placed lower, to prevent the button from disappearing through a missclick
	
	var pick = document.getElementsByName("race");
	// if null throw alert and don't react.
	let len = humanoids.length+4;
	for (let i = 0; i < len; i++) {
		if (pick[i].checked) {
			raceChoice = i;  // if made a var, it won't update in the global var and thus make mistakes in the finalBox
			
			console.log("raceChoice", i);
			
			// Hide radio and button
			let len = humanoids.length+3;
			for (let i = 0; i < len; i++) {
				document.getElementsByName("race")[i].className += " data__1--hidden";
			}
			document.getElementById("pickButton").className += " button--hidden";
			break; // Break for good measure
		}
		
		if (i === 14) {
			raceChoice = null; // Doesn't work but has desired effect
		}
	}
	
	if (raceChoice === null) {
		alert("Please chose a race"); // Doesn't work but has desired effect
	}
	
	else if (raceChoice < 11) { // Humanoids
		//  https://stackoverflow.com/questions/1144805/scroll-to-the-top-of-the-page-using-javascript-jquery
		for (let i = 0; i < 6; i++) {
			abilityScore[i] = abilityScore[i] + humanoids[raceChoice][i];
		}
		
		writeToSheet();
		finalBox();
		
		// Toggle buttons and divs
		document.getElementById("pickButton").className = "button--hidden";
		/*
		animateCollapse('pick');
		animateCollapse('pickToggle');
		*/
		document.getElementById("table__1").className = "item--gone";
		/*
		animateCollapse('info');
		
		animateReveal('copy');
		animateReveal('pre__i');
		animateReveal('thanks');
		*/
		colRev('pick', 'copy');
		colRev('pickToggle', 'pre__i');
		colRev('info', 'thanks');
		setTimeout(animateCollapse('button2'), 1500);
	}
	
	else if (raceChoice === 13) { // Human
		// As above, but add 1 to each score
		for (let i = 0; i < 6; i++) {
			abilityScore[i] = abilityScore[i] + 1;
		}
		
		writeToSheet();
		finalBox();
		
		// Toggle buttons
		/* All the old pre-animation stuff, kept in case something breaks
		document.getElementById("pickButton").className = "button--hidden";
		document.getElementById("pick").className = "item--gone";
		document.getElementById("pickToggle").className = "item--gone";
		document.getElementById("table__1").className = "item--gone";
		document.getElementById("info").className = "item--gone";
		document.getElementById("copy").classList.remove("item--gone");
		document.getElementById("pre__i").classList.remove("item--gone");
		document.getElementById("thanks").classList.remove("item--gone");
		*/
		
		// Toggle buttons and divs
		document.getElementById("pickButton").className = "button--hidden";
		//animateCollapse('pick');
		//animateCollapse('pickToggle');
		document.getElementById("table__1").className = "item--gone";
		//animateCollapse('info');
		
		//animateReveal('copy');
		//animateReveal('pre__i');
		//animateReveal('thanks');
		
		colRev('pick', 'copy');
		colRev('pickToggle', 'pre__i');
		colRev('info', 'thanks');
		animateCollapse('button2');
	}
	
	else if (raceChoice === 12) { // Variant Human
		animateReveal('button1');
		
		// Show all checkboxes again
		let y = document.getElementsByClassName("checkbox");
			for (let i = 0; i < y.length; i++) {
				y[i].className = "checkbox"; // Removes the "checkbox--hidden" class
			}
		
		// Scroll to top
		scrollToTheTop();
		
		// Toggle buttons
		document.getElementById("addButton").className = "";
		document.getElementById("pickButton").className = "button--hidden";
		document.getElementById("swapButton").className = "button--gone";
		animateCollapse('info');
		animateCollapse('button2');
	}
	
	else { // Half Elf
		// As above, except don't show checkbox 5 and add 2 to abilityScore 5 (CHA) right away
		
		animateCollapse('button2');
		animateReveal('button1');
		
		// Show all checkboxes except CHA
		let y = document.getElementsByClassName("checkbox");
			for (let i = 0; i < y.length; i++) {
				y[i].className = "checkbox"; // Removes the "checkbox--hidden" class
			}
		document.getElementById("checkbox__5").className += " checkbox--hidden";
		abilityScore[5] = abilityScore[5]+2;
		
		writeToSheet();
		
		// Scroll to top
		scrollToTheTop();
		
		// Toggle buttons
		document.getElementById("addButton").className = "";
		document.getElementById("pickButton").className = "button--hidden";
		document.getElementById("swapButton").className = "button--gone";
		animateCollapse('info');
	}
}


// Brings the user to the top of the page
function scrollToTheTop() {
	// https://stackoverflow.com/questions/1144805/scroll-to-the-top-of-the-page-using-javascript-jquery
	var scrollToTop = window.setInterval(function() {
			var pos = window.pageYOffset;
			if ( pos > 0 ) {
				window.scrollTo( 0, pos - 20 ); // how far to scroll on each step
			} else {
				window.clearInterval( scrollToTop );
			}
		}, 16); // how fast to scroll (this equals roughly 60 fps)
}


// Adds Ability Scores as chosen if Variant Human or Half Elf is chosen
function addRequest() {
	
	//animateCollapse('pick');
	//animateCollapse('pickToggle');
	document.getElementById("table__1").className = "item--gone";
	
	//animateReveal('copy');
	//animateReveal('pre__i');
	animateReveal('thanks');
	
	colRev('pick', 'copy');
	colRev('pickToggle', 'pre__i');
	//colRev('info', 'thanks');
	setTimeout(animateReveal('thanks'), 1500);
		
	// Check booleans of checkboxes
	var zero = document.getElementById("checkbox__0").checked;
	var one = document.getElementById("checkbox__1").checked;
	var two = document.getElementById("checkbox__2").checked;
	var three = document.getElementById("checkbox__3").checked;
	var four = document.getElementById("checkbox__4").checked;
	var five = document.getElementById("checkbox__5").checked;
	
	// See how many are checked
	var boxAmount = 0;
	if (zero) {boxAmount = boxAmount +1;}
	if (one) {boxAmount = boxAmount +1;}
	if (two) {boxAmount = boxAmount +1;}
	if (three) {boxAmount = boxAmount +1;}
	if (four) {boxAmount = boxAmount +1;}
	if (five) {boxAmount = boxAmount +1;}
	
	if (boxAmount == 2) {
		
		// Toggle button
		document.getElementById("addButton").className = "button--hidden";
		animateCollapse('button1');
		
		for (let i = 0; i < 6; i++) {
			var check = "checkbox__" + i;
			if (document.getElementById(check).checked) {
				abilityScore[i] = abilityScore[i] + 1;
			}
		}
		
		
		writeToSheet();
		
		//Uncheck boxes
		zero = document.getElementById("checkbox__0").checked = false;
		one = document.getElementById("checkbox__1").checked = false;
		two = document.getElementById("checkbox__2").checked = false;
		three = document.getElementById("checkbox__3").checked = false;
		four = document.getElementById("checkbox__4").checked = false;
		five = document.getElementById("checkbox__5").checked = false;
		
		// Hide checkbox columns again
		let y = document.getElementsByClassName("checkbox");
		for (let i = 0; i < y.length; i++) {
			y[i].className += " checkbox--hidden";
		}
		
		finalBox();
	}
}


// Writes Character to a simple white box for easy copying
function finalBox() {
	// Don't display pickRace
	/*
	document.getElementById("pickRace").style.display = "none";
	document.getElementById("pickRaceWrap").style.display = "none";

	// Reveal pre div
	document.getElementById("copyBox").style.visibility = "visible";
		*/
	// Fill pre div
	document.getElementById("s0t").innerHTML = abilityScore[0];
	document.getElementById("s1t").innerHTML = abilityScore[1];
	document.getElementById("s2t").innerHTML = abilityScore[2];
	document.getElementById("s3t").innerHTML = abilityScore[3];
	document.getElementById("s4t").innerHTML = abilityScore[4];
	document.getElementById("s5t").innerHTML = abilityScore[5];
	
	document.getElementById("modV0t").innerHTML = modVArray2[0];
	document.getElementById("modV1t").innerHTML = modVArray2[1];
	document.getElementById("modV2t").innerHTML = modVArray2[2];
	document.getElementById("modV3t").innerHTML = modVArray2[3];
	document.getElementById("modV4t").innerHTML = modVArray2[4];
	document.getElementById("modV5t").innerHTML = modVArray2[5];
	
	document.getElementById("mod0t").innerHTML = modArray[0];
	document.getElementById("mod1t").innerHTML = modArray[1];
	document.getElementById("mod2t").innerHTML = modArray[2];
	document.getElementById("mod3t").innerHTML = modArray[3];
	document.getElementById("mod4t").innerHTML = modArray[4];
	document.getElementById("mod5t").innerHTML = modArray[5];
	
	if (raceChoice < 11) {
		document.getElementById("racet").innerHTML = humanoids[raceChoice][6];
	}
	else if (raceChoice == 11) {
		document.getElementById("racet").innerHTML = "Half Elf";
	}
	else if (raceChoice == 12) {
		document.getElementById("racet").innerHTML = "Variant Human";
	}
	else {
		document.getElementById("racet").innerHTML = "Human";
	}
}


// Function for animating the removal of the non-animatable "display: none;" property
function animateReveal(IDToAdd) {
	
	// Display a hidden ghost div in main__2 to get the animation height from
	let divToBeCopied = document.getElementById(IDToAdd);
	let ghostDiv = document.getElementById("ghost");
	ghostDiv.innerHTML = divToBeCopied.innerHTML;
	
	// Get div height to add from the ghost element
	let addHeight = document.getElementById("ghost").clientHeight; // Height to be animated to
	
	// Animate the height addition by expanding div
	document.documentElement.style.setProperty("--expandHeight", addHeight + "px");
	document.getElementById(IDToAdd).className = "text item--expand";
	
	// Fade in content when animation is done
	let x = document.getElementById(IDToAdd);
	x.addEventListener("animationend", fadeIn);
	function fadeIn() {
		x.className = "text item--reveal";
		x.addEventListener("transitionend", restoreClass);
		function restoreClass() {
			document.getElementById(IDToAdd).classList.remove("item--reveal");
			x.removeEventListener("transitionend", restoreClass);
		}
		x.removeEventListener("animationend", fadeIn);
	}
}


// Function for animating the addition of the non-animatable display:none property
// Needed a removeEventListener above to not bug out - added down here too for good measure. Link:  https://www.google.dk/search?q=removeEventListener&oq=removeEventListener&aqs=chrome..69i57j0l5.1382j0j8&sourceid=chrome&ie=UTF-8
function animateCollapse(IDToRemove) {
	
	// Measure height to remove
	let removeHeight = document.getElementById(IDToRemove).clientHeight;
	
	// Fade out content
	document.getElementById(IDToRemove).className = "text item--hidden";
	
	// Animate removal when fade-out is done
	let x = document.getElementById(IDToRemove);
	x.addEventListener("transitionend", collapse); // Waits for the fadeout
	function collapse() {
		document.documentElement.style.setProperty("--collapseHeight", removeHeight + "px");
		document.getElementById(IDToRemove).className += " item--collapse";
		x.removeEventListener("transitionend", collapse);
	}
}

// Combine collapse and reveal functions to get satisfying flow of animations
function colRev(col, rev){
	animateCollapse(col);
	setTimeout(animateReveal(rev), 1500);
}


// Shows the about page on top of the rest of the page
function showAbout() {
	document.getElementById("about__element").classList.remove("item--hidden");
	document.getElementById("about__element").classList.remove("item--gone");
}


// Removes the about page
function removeAbout() {
	document.getElementById("about__element").className = "main__3 item--hidden item--gone";
}











