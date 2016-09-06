			var jsDumper = function( o, op ) {
			
				var mxln = 3000; // Max x Lines
				var mxlnct = mxln; 
				var mxlv = 100; // Max x Levels
				var ttl = ''; 
				var otc = true; // otc: output to console. If false, return a string of the output.
				var rvl = []; 
				var doui = 0; // Dump Obj unique ID, is used to flag items and see if hashes or array being displayed several times. 
				var dool = []; // Dump Obj object list: record the list of object that have a ____TCR_xxxxxx____ flag (track circular ref).
				var nfk = {}; // No follow key, in case of _s and s (_s is list version of hash s for angular) 
				var shhd = true; // Show Header. Help to remove unneeded stuff  
				
				function putToOut( ct ) {
					if ( shhd == false ) {
						var mg = []; 
						if ( mg = ct.match(/'^ > BEGIN > (.*)$'/) ) ct = mg[ 1 ]; 
						else ( mg = ct.match(/'^ > BEGIN (.*)$'/) ) ct = mg[ 1 ];
					}
					
					if ( otc ) { console.log( ct ); } else { rvl.push( ct ); }
				} 
	
				function doSeqNext() {
					doui++; 
					return doui; 
				}
				
				function doSeqCurrent() {
					return doui; 
				}
				

				function sortedKeys( ls ) {
					var tl = [];
					for( var k in ls ) tl.push( k ); 
					return tl.sort(); 
				}
		

				function doRemTracker() {
					for ( var k in dool ) {
						var co = dool[ k ]; 
						if ( co.t == 'h' ) delete co.o[ '____TCR____' ];
						if ( co.t == 'l' ) co.o.shift();
					}
					dool = []; 
				}
				
				
				if ( op instanceof Object ) {
					if ( 'ttl' in op ) { ttl = op.ttl; console.log('DUMP FOR OBJECT '+ttl); }
					if ( 'mxln' in op ) { mxln = op.mxln; console.log('        REDEFINE MAX LINES '+mxln); }
					if ( 'mxlv' in op ) { mxlv = op.mxlv; console.log('        REDEFINE MAX LEVEL '+mxlv); }
					if ( 'ots' in op ) { otc = false; console.log('        OUTPUT TO STRING'); }
					if ( 'nfk' in op ) { 
						if ( op.nfk instanceof Array ) { 
							for ( var k = 0; k < op.nfk.length; k++ ) { nfk[ op.nfk[ k ] ] = ''; }
						} else {
							nfk = op.nfk;
						} 
						console.log('        NO FOLLOW KEYS ACTIVATED FOR '+sortedKeys(nfk).join(', ')); 
					}
					if ( 'nohd' in op ) { shhd = false; }
				}
				
				function dumpObjStr( o ) {
					var rv = ''; 
					if ( o == null ) {
						rv = '(null)';
						if ( typeof o == 'undefined' ) {
							rv = '(undefined)';
						}
					} else if ( typeof o == 'undefined' ) {
						rv = '(undefined)';
					} else if ( typeof o == 'string' || typeof o == 'boolean' || typeof o == 'number' ) {
						// rv = '('+(typeof o)+') '+o;
						rv = ( shhd ? '('+(typeof o)+') '+o : o );
					} else if ( typeof o == 'function'  ) {
						rv = '('+(typeof o)+')';
					} else if ( o instanceof Array  ) {
						rv = '(Array)';
					} else if ( o instanceof Object  ) {
						rv = '(Object)';
					}
					return rv; 
				}
	
				function doPadX( v, s, t ) {
					var lv = String( v ) 
					var rv;
					if ( t == 'z' ) rv = '0000000000000000'.substring( 0, s - lv.length ) + lv; // fill up with zeros
					if ( t == 's' ) rv = '                '.substring( 0, s - lv.length ) + lv; // fill up with spaces
					return rv;  
				}
				
				function recDumpObj( o, lvs, lvn, bk ) {
					mxlnct--; 
					if ( (mxlnct >= 0) && (lvn <= mxlv ) ) {
						if ( o instanceof Array ) {
							// Check a tracker is already in place
							var tip = false; // Tracker in place
							var mg = []; 
							if ( o.length > 0 ) {
								if ( typeof o[ 0 ] == 'string' ) {
									if ( mg = o[ 0 ].match(/^____TCR_(\d+)____$/) ) {
										putToOut( '    (copy of) '+dool[ mg[ 0 ] ].p );
										tip = true;
									}
								}
							}
							if ( ! tip ) { // No Tracker in place, eg first time this path is displayed.

								// Tracker First 
								var tcrk = '____TCR_' + doPadX( doSeqNext(), 6, 'z' ) + '____';
								o.unshift( tcrk ); 
								dool[ tcrk ] = { t:'l', k: tcrk, o: o, p: bk }; 

								// then proceed from item N? 1 (as Item N? 0 is the tracker) 
								for( var k = 1; k < o.length; k++ ) {
									if ( mxlnct >= 0 ) {
										var nbk = bk+' > '+k; // nbk: new block key
										putToOut( nbk +'       '+ dumpObjStr( o[ k ] )); 
										recDumpObj( o[ k ], lvs+'    ', lvn+1, nbk );
									}
								}
							}
						} else if ( o instanceof Object ) {
							// Check a tracker is already in place
							var tip = false; // Tracker in place
							var mg = []; 
							if ( '____TCR____' in o ) {
								var tid = o[ '____TCR____' ]; 
								putToOut( '    (copy of) '+dool[ tid ].p );
								tip = true;
							}
							if ( ! tip ) { // No Tracker in place, eg first time this path is displayed. 

								// Tracker First 
								var tcrk = '____TCR_' + doPadX( doSeqNext(), 6, 'z' ) + '____';
								o[ '____TCR____' ] = tcrk; 
								dool[ tcrk ] = { t:'h', k:tcrk, o:o, p: bk }; 

								// then proceed for items except the tracker's one. 
								var tl = [];
								for( var k in o ) {
									tl.push( k ); 
								}
								tl.sort(); 
								for( var k = 0; k < tl.length; k++ ) {
									var tk = tl[ k ]; 
									if ( tk in nfk ) {
										var nbk = bk+' > '+tk; 
										putToOut( nbk +'       '+ '(no follow key)' );
									} else if ( mxlnct >= 0 && tk != '____TCR____' ) {
										var nbk = bk+' > '+tk; 
										putToOut( nbk +'       '+ dumpObjStr( o[ tk ] )); 
										recDumpObj( o[ tk ], lvs+'    ', lvn+1, nbk);
									}
								}
							}
						} 
					} else { 
						if ( mxlnct < 0 ) { putToOut( '!! STOP BECAUSE MAX NUM OF LINE REACHED ('+mxln+') !!' ); }
					}
				}
				
				mxlnct = mxln; // Keep max count
				if ( shhd ) putToOut( 'START jsDumper' );
				recDumpObj( { 'BEGIN': o }, '	', 0, '' ); 
				if ( shhd ) putToOut( 'END jsDumper (LINE COUNT: '+(mxln - mxlnct)+')' );
				doRemTracker(); 
				
				return rvl.join( '\n' );
			}

