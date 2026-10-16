export const rows = [
 ['esc','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
 ['tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
 ['caps','a','s','d','f','g','h','j','k','l',';',"'",'enter'],
 ['shift','z','x','c','v','b','n','m',',','.','/','shift'],
 ['ctrl','alt','super','space','super','alt','ctrl'],
];
export function keyForChar(char) {
 if (char === '\n') return 'enter';
 if (char === ' ') return 'space';
 const shifted = { '!':'1', '@':'2', '#':'3', '$':'4', '%':'5', '^':'6', '&':'7', '*':'8', '(':'9', ')':'0', '_':'-', '+':'=', '{':'[', '}':']', ':':';', '"':"'", '<':',', '>':'.', '?':'/', '|':'\\' };
 return shifted[char] || char.toLowerCase();
}
export function fingerForKey(key) {
 if (['esc','1','q','a','z','tab','caps','shift','ctrl'].includes(key)) return [0,0];
 if ('2wsx'.includes(key)) return [0,1];
 if ('3edc'.includes(key)) return [0,2];
 if ('45rtfgvb'.includes(key)) return [0,3];
 if (key === 'space' || key === 'alt' || key === 'super') return [0,4];
 if ('67yuhjnm'.includes(key)) return [1,3];
 if ('8ik,'.includes(key)) return [1,2];
 if ('9ol.'.includes(key)) return [1,1];
 return [1,0];
}
export function advance(state, snippets, now, random = Math.random) {
 if (now < state.next) return state;
 const code = snippets[state.file].code;
 if (state.phase === 'hold') return {...state, phase:'switch', next:now+450, key:'esc'};
 if (state.phase === 'switch') return {file:(state.file+1)%snippets.length, count:0, phase:'typing', next:now+700, key:''};
 if (state.count >= code.length) return {...state,phase:'hold',next:now+4200,key:''};
 const char = code[state.count];
 return {...state,count:state.count+1,key:keyForChar(char),next:now+(char==='\n'?210:char===' '?35:28+random()*65)};
}
