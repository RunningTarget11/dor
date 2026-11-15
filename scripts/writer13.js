function whyOf(c){return WHY[c[0]]||impactFor(c)}
function whyLc(c){const w=whyOf(c);return w.charAt(0).toLowerCase()+w.slice(1)}
function corrSteps(c){const k=CORR[c[0]];if(!k)return'';return `(1) ${lc(k[0])}; (2) ${lc(k[1])}; and (3) ${lc(k[2])}.`}
function phaseBest(){return PHASE_EARLY()?`This is a strong showing for a trainee in ${S.phase}. It reflects good preparation and a real willingness to apply what has been taught, and it shows the trainee is building the right habits early in the program.`
  :`This is the consistent, independent level of performance expected of a trainee in ${S.phase}, and the trainee delivered it. It shows the trainee is ready to handle this kind of work with growing confidence.`}

function writeBest(){const c=catBy(S.bestCat);if(!c)return null;const notes=S.bestEx.trim();const extra=obsIn(c[0],'good');
  let p1=`The trainee's most acceptable area of performance during this shift was ${c[2]} (Category ${c[0]}). `;
  p1+=notes?`I observed the following: ${sent(notes)} `:'[Describe the specific incident here.] ';
  extra.forEach(o=>{p1+=`The trainee also ${lc(o.text)}. `});
  p1+=`Throughout these contacts the trainee demonstrated the skills this category calls for and carried out the tasks in a calm, organized and professional manner.`;
  const p2=`This performance stands out because ${whyLc(c)} Under the 115A standard, acceptable performance in this category means that ${stdLower(c[5])} At the superior level, ${stdLower(c[6])} Based on what I observed, the trainee's performance today ${ratingWordsBest(S.bestRate)}.`;
  const p3=`${impactFor(c)} ${phaseBest()} Performance like this shows that the trainee understands not only what to do, but why it matters.`;
  const p4=`Kudos to the trainee for this performance. The trainee's work in ${c[2].toLowerCase()} was a highlight of the shift, and it reflects well on the trainee and on the Department. Well done. I encourage the trainee to take pride in this, to keep up this standard on every contact, and to carry the same approach into every area of the job as training continues.`;
  return{title:'MOST ACCEPTABLE',body:[p1,p2,p3,p4].join('\n\n')}}

function writeWorst(){const c=catBy(S.worstCat);if(!c)return null;const notes=S.worstEx.trim();const extra=obsIn(c[0],'bad');
  let p1=`The trainee's least acceptable area of performance during this shift was ${c[2]} (Category ${c[0]}). `;
  p1+=notes?`I observed the following: ${sent(notes)} `:'[Describe the specific incident here.] ';
  extra.forEach(o=>{p1+=`The trainee also ${lc(o.text)}. `});
  let p2=`This matters because ${whyLc(c)} Under the 115A standard, acceptable performance in this category means that ${stdLower(c[5])} The trainee's performance today ${ratingWordsWorst(S.worstRate)}. `;
  p2+=PHASE_EARLY()?`As the trainee is in ${S.phase}, this is treated as a learning point, and it is an area the trainee can correct with focused effort.`
    :PHASE_EXT()?`At this point in an extension phase, this skill is expected to be fully established, and continued deficiency in this area will need to be addressed.`
    :`At ${S.phase}, this skill is expected to be established, and the trainee needs to show consistent improvement in this area.`;
  const good=(PHR[c[0]]||[[]])[0];
  let p3=`Suggested corrections: To meet the 115A standard, the trainee should ${corrSteps(c)||'review the standard for this category and apply it on every contact.'}`;
  if(good.length)p3+=` On upcoming contacts, the goal is performance that would be noted as: ${good.slice(0,3).map(lc).join('; ')}.`;
  const p4=`This is a correctable area. The trainee is encouraged to treat it as a learning opportunity, to review the 115A standard for ${c[2]} before the next shift, and to ask questions about anything that is unclear. I will continue to monitor this area and provide feedback on the next shift.`;
  return{title:'LEAST ACCEPTABLE',body:[p1,p2,p3,p4].join('\n\n')}}

function asSentence(t){t=String(t||'').trim();const w=(t.split(/\s+/)[0]||'').toLowerCase();
  if(/^(the|trainee|he|she|they|i|during|on|at|while|after|before)$/.test(w))return sent(t);
  if(/ed$/.test(w)||/^(did|was|made|wrote|took|kept|gave|forgot|ran|drove|got|had|showed|missed|left|stood|knew|found|sought|built|held|lost|spoke|let|put)$/.test(w))return sent('The trainee '+lc(t));
  return sent(t)}
function writeGeneral(){const other=S.obs.filter(o=>!o.cat||(String(o.cat)!==String(S.bestCat)&&String(o.cat)!==String(S.worstCat)));if(!other.length)return null;
  const parts=other.map(o=>{const c=catBy(o.cat);const tag=c?` (Cat ${c[0]})`:'';const lead=asSentence(o.text).replace(/\.$/,'')+tag+'.';
    if(o.type==='good')return `${lead} ${c?`This met the 115A standard for ${c[2]}, and it matters because ${whyLc(c)} `:''}Nice work by the trainee. This is noted as a positive, and the trainee is encouraged to keep it up.`;
    if(!c)return `${lead} This is an area for the trainee to improve. The trainee should review the correct procedure and apply it on the next similar contact.`;
    const k=CORR[c[0]]||[];
    return `${lead} This matters because ${whyLc(c)} Suggested correction: ${k.length?sent(k[0])+' The trainee should also '+lc(k[1])+'.':'Review the 115A standard for '+c[2]+' and apply it on the next similar contact.'}`});
  return{title:'GENERAL/NOTEWORTHY EVENTS',body:parts.join('\n\n')}}
