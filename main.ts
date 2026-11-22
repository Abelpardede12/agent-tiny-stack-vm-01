// Tiny stack VM: exact implementation of the make.fun tiny stack ISA.
// Wrapping i32 arithmetic, 256-value stack, 64-deep calls, 256 words of
// memory, ten traps (exit codes 2-11), 1M-step and 64KiB-output limits.
import{mkdirSync as M,readdirSync as R,readFileSync as F,writeFileSync as W}from'node:fs';
import{join as J}from'node:path';
const T={0:[0,0,0],1:[1,0,1],2:[4,0,1],3:[0,1,0],4:[0,1,2],5:[0,2,2],6:[0,2,3],7:[0,3,3],16:[0,2,1],17:[0,2,1],18:[0,2,1],19:[0,2,1],20:[0,2,1],21:[0,2,1],22:[0,2,1],23:[0,1,1],24:[0,2,1],25:[0,2,1],26:[0,2,1],27:[0,1,1],28:[0,2,1],29:[0,2,1],30:[0,2,1],32:[0,2,1],33:[0,2,1],34:[0,2,1],48:[2,0,0],49:[2,1,0],50:[2,1,0],51:[2,0,0],52:[0,0,0],64:[0,1,1],65:[0,2,0],80:[0,1,0],81:[0,1,0],82:[0,0,1],83:[0,1,0]};
function run(p,i){
const n=p.length,D=new Int32Array(256),C=new Int32Array(64),E=new Int32Array(256),o=new Uint8Array(65536);
let s=0,c=0,l=0,q=0,g=0,S=0;
const d=x=>({o:o.slice(0,l),e:x});
for(;;){
if(S===1e6)return d(10);
if(g<0||g>=n)return d(9);
const b=p[g],t=T[b];
if(!t)return d(5);
const m=t[0];
if(g+m>=n)return d(9);
S++;
if(s<t[1])return d(2);
if(s-t[1]+t[2]>256)return d(3);
const x=g+1+m;g=x;
switch(b){
case 0:return d(0);
case 1:D[s++]=(p[x-1]<<24)>>24;break;
case 2:D[s++]=p[x-4]|p[x-3]<<8|p[x-2]<<16|p[x-1]<<24;break;
case 3:s--;break;
case 4:D[s]=D[s-1];s++;break;
case 5:{const v=D[s-1];D[s-1]=D[s-2];D[s-2]=v;break}
case 6:D[s]=D[s-2];s++;break;
case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break}
case 23:D[s-1]=-D[s-1]|0;break;
case 27:D[s-1]=~D[s-1];break;
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
const B=D[s-1],A=D[s-2];let r;
if(b===16)r=(A+B)|0;
else if(b===17)r=(A-B)|0;
else if(b===18)r=Math.imul(A,B);
else if(b===19){if(!B)return d(4);r=A===-2147483648&&B===-1?A:(A/B)|0}
else if(b===20){if(!B)return d(4);r=B===-1?0:(A%B)|0}
else if(b===21){if(!B)return d(4);r=Math.floor((A>>>0)/(B>>>0))|0}
else if(b===22){if(!B)return d(4);r=((A>>>0)%(B>>>0))|0}
else if(b===24)r=A&B;
else if(b===25)r=A|B;
else if(b===26)r=A^B;
else if(b===28)r=A<<(B&31);
else if(b===29)r=A>>(B&31);
else if(b===30)r=(A>>>(B&31))|0;
else if(b===32)r=A===B?1:0;
else if(b===33)r=A<B?1:0;
else r=(A>>>0)<(B>>>0)?1:0;
D[s-2]=r;s--;break}
case 48:case 49:case 50:{
const r=((p[x-2]|p[x-1]<<8)<<16)>>16;let k=1;
if(b!==48){const v=D[--s];k=b===49?v===0:v!==0}
if(k)g=x+r;
break}
case 51:
if(c===64)return d(7);
C[c++]=x;g=p[x-2]|p[x-1]<<8;break;
case 52:
if(!c)return d(8);
g=C[--c];break;
case 64:{
const a=D[s-1];
if(a<0||a>255)return d(6);
D[s-1]=E[a];break}
case 65:{
const a=D[s-1];
if(a<0||a>255)return d(6);
E[a]=D[s-2];s-=2;break}
case 80:{
let v=D[--s];const ng=v<0;if(ng)v=-v;const u=[];
if(!v)u.push(48);
while(v>0){u.push(48+v%10);v=Math.floor(v/10)}
if(ng)u.push(45);
if(l+u.length>65536)return d(11);
for(let k=u.length-1;k>=0;k--)o[l++]=u[k];
break}
case 81:
if(l+1>65536)return d(11);
o[l++]=D[--s]&255;break;
case 82:D[s++]=q<i.length?i[q++]:-1;break;
case 83:return d(D[--s]&255);
}
}
}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of R(I).sort()){
const r=run(new Uint8Array(F(J(I,id,'program.bin'))),new Uint8Array(F(J(I,id,'input.bin'))));
M(J(O,id),{recursive:true});
W(J(O,id,'stdout.bin'),r.o);
W(J(O,id,'exit.txt'),r.e+'\n');
}
