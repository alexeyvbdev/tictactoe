var size = 3; // Change this value to any positive integer to change game field size.

window.addEventListener("load", function(event) {
	var current_player = 1;
	var players = {1:{value: 1, symbol: 'X', score: 0, steps: 0}, 2:{value: 0, symbol: 'O', score: 0, steps: 0}};
	var ties = 0;
	var is_loaded_game = false;

	var parse_query_string = function(query) {
		var vars = query.split('&');
		var query_string = {};
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			if (typeof query_string[pair[0]] === 'undefined') {
				query_string[pair[0]] = decodeURIComponent(pair[1]);
			} else if (typeof query_string[pair[0]] === 'string') {
				var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
				query_string[pair[0]] = arr;
			} else {
				query_string[pair[0]].push(decodeURIComponent(pair[1]));
			}
		}
		return query_string;
	}
	
	var load_game = function(new_game) {
		var params_string = window.location.search.substring(1);
		if (params_string) {
			var params = parse_query_string(window.location.search.substring(1));
			if (typeof params !== 'undefined' && typeof params.field !== 'undefined' && typeof params.players !== 'undefined' &&
				typeof params.ties !== 'undefined' && typeof params.current_player !== 'undefined' && !is_loaded_game) {
				var field = JSON.parse(params.field);
				players = JSON.parse(params.players);
				for (var i=0; i<size; i++)
					for (var j=0; j<size; j++)
						document.getElementById('cell-' + i + '-' + j).innerHTML = field[i][j];
				ties = params.ties;
				current_player = params.current_player;
				is_loaded_game = true;
				show_score();
			}
		}
	}

	var init_field = function() {
		var cells_html = '';
		document.getElementById('game-field').innerHTML = '';
		for (var i=0; i<size; i++)
			for (var j=0; j<size; j++)
				cells_html += '<div id="cell-' + i + '-' + j + '" class="cell"></div>';

		document.getElementById('game-field').innerHTML = cells_html;
		document.getElementById('game-field').style.width = (size * 102) + 'px';
		document.getElementById('game-field').style.height = (size * 102) + 'px'; 
		for (var p = 1; p <= 2; p++)
			players[p].steps = 0;
	}
	
	var get_cell_value = function(i, j) {
		return document.getElementById('cell-' + i + '-' + j).innerHTML;
	}

	var is_full_field = function() {
		var is_full = false;
		for (var i=0; i<size; i++)
			for (var j=0; j<size; j++) {
				if (get_cell_value(i, j) != '') {
					is_full = true;
				} else {
					is_full = false;
					return false;
				}
			}

		return is_full;
	}

	var check_winning = function() {
		var is_win = false;
		for (var i=0; i<size; i++) {
			if (!is_win) {
				for (var j=1; j<size; j++) {
					if (get_cell_value(i, 0) == get_cell_value(i, j) && get_cell_value(i, j) != '') {
						is_win = true;
					} else {
						is_win = false;
						break;
					}
				}
			}
		}
		if (!is_win) {
			for (var j=0; j<size; j++) {
				if (!is_win) {
					for (var i=1; i<size; i++) {
						if (get_cell_value(0, j) == get_cell_value(i, j) && get_cell_value(i, j) != '') {
							is_win = true;
						} else {
							is_win = false;
							break;
						}
					}
				}
			}
		}
		if (!is_win) {
			for (var i=1; i<size; i++) {
				if (get_cell_value(0, 0) == get_cell_value(i, i) && get_cell_value(i, i) != '') {
					is_win = true;
				} else {
					is_win = false;
					break;
				}
			}
		}
		if (!is_win) {
			for (var i=1; i<size; i++) {
				if (get_cell_value(0, size-1) == get_cell_value(i, size-i-1) && get_cell_value(i, size-i-1) != '') {
					is_win = true;
				} else {
					is_win = false;
					break;
				}
			}
		}
		return is_win;
	}

	var select_cell = function() {
		var attribute = this.getAttribute("id");
		var row = attribute.split('-')[1];
		var column = attribute.split('-')[2];
		if (this.innerHTML == '') {
			this.innerHTML = players[current_player].symbol;
			players[current_player].steps++;
			if (check_winning()) {
				players[current_player].score++;
				stop_game();
				start_game(!confirm('Player ' + current_player + ' (' + players[current_player].symbol + ') wins after ' + players[current_player].steps + ' steps! Do you want to continue?'));
			} else if (is_full_field()) {
				ties++;
				stop_game();
				start_game(!confirm('It is tie! Do you want to continue?'));
			} else {
				current_player = (current_player === 1) ? 2 : 1;
			}
		}
	}

	var start_game = function(new_game) {
		if (typeof new_game == 'undefined') new_game = false;
		init_field();
		load_game();
		var cells = document.getElementsByClassName("cell");
		for (var i = 0; i < cells.length; i++)
			cells[i].addEventListener('click', select_cell, false);
		document.getElementById('saved_link').value = '';
		document.getElementById('saved_link').style.display = 'none';
		if (new_game) {
			current_player = 1;
			for (var p = 1; p <= 2; p++) {
				players[p].score = 0;
				document.getElementById('symbol' + p).innerHTML = players[p].symbol;
				document.getElementById('player' + p).innerHTML = players[p].score;
			}
			document.getElementById('ties').innerHTML = 0;
		}
	}

	var stop_game = function() {
		var cells = document.getElementsByClassName("cell");
		for (var i = 0; i < cells.length; i++)
			cells[i].removeEventListener('click', select_cell);
		show_score();
	}

	var show_score = function() {
		var another_player = (current_player === 1) ? 2 : 1;
		document.getElementById('symbol1').innerHTML = players[current_player].symbol;
		document.getElementById('symbol2').innerHTML = players[another_player].symbol;
		document.getElementById('player1').innerHTML = players[current_player].score;
		document.getElementById('player2').innerHTML = players[another_player].score;
		document.getElementById('ties').innerHTML = ties;
	}

	var save_game = function() {
		var field = new Array(size);
		for (var i = 0; i < size; i++)
			field[i] = new Array(size);
		for (var i = 0; i < size; i++)
			for (var j = 0; j < size; j++)
				field[i][j] = get_cell_value(i, j);
		var query = 'field=' + encodeURIComponent(JSON.stringify(field)) + '&players=' + encodeURIComponent(JSON.stringify(players)) + '&current_player=' + current_player + '&ties=' + ties;
		var saved_link = document.getElementById('saved_link');
		saved_link.style.display = 'inline';
		saved_link.value = window.location.origin + window.location.pathname + '?' + query;
		saved_link.select();
		document.execCommand("Copy");
		alert("Copied the link to save and continue current game: " + saved_link.value);
	};

	start_game();

	document.getElementById('new_game').addEventListener('click', function(event) {
		start_game(true);
	});

	document.getElementById('save_game').addEventListener('click', function(event) {
		save_game();
	});
});