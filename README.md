# jsDumper

Usage: 

	// To display on browser console
	var v = { a: 'a', b: 'b', c: { a: 'a', b: 'b' }, d: [ 'a', 'b', 'c' ] }; 
	jsDumper( v, {} ); 
	
	// To include in HTML for example
	<body>
		<div id="showBox"></div>
		<script>
		var v = { a: 'a', b: 'b', c: { a: 'a', b: 'b' }, d: [ 'a', 'b', 'c' ] }; 
		document.getElementById("showBox").innerHTML = "<pre>"+jsDumper( v, { ots: '' })+"</pre>";
		</script>
	</body>
	
