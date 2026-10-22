(function () {
  'use strict';
  var D=window.GRAD,app=document.getElementById('app'),key='graduate-survey-v1';
  var state={step:-1,answers:{},chosen:null},imageBlob=null,imageUrl=null,building=false;
  var levels={new:'기초 체험부터',course:'독립적인 작은 실습부터',project:'프로젝트 검증·지원 준비',real:'실무 사례·운영 개선 정리'};
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function selected(id,value){var q=D.questions.filter(function(x){return x.id===id;})[0];return q&&q.options.filter(function(o){return o.id===value;})[0];}
  function answerLabel(id,answers){var v=(answers||state.answers)[id];return (Array.isArray(v)?v:[v]).map(function(x){var o=selected(id,x);return o?o.label:'';}).filter(Boolean).join(', ')||'선택 없음';}
  function list(items){return '<ul>'+items.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';}
  function persist(){try{sessionStorage.setItem(key,JSON.stringify(state));}catch(e){}}
  try{
    var restored=JSON.parse(sessionStorage.getItem(key)||'null');
    if(restored&&Number.isInteger(restored.step)&&restored.step>=-1&&restored.step<=D.questions.length&&restored.answers&&typeof restored.answers==='object'){
      D.questions.forEach(function(q){var v=restored.answers[q.id];if(q.multi){state.answers[q.id]=Array.isArray(v)?v.filter(function(id,i,a){return selected(q.id,id)&&a.indexOf(id)===i;}).slice(0,q.multi):[];if(state.answers[q.id].indexOf('none')>=0)state.answers[q.id]=['none'];}else if(selected(q.id,v))state.answers[q.id]=v;});
      state.step=restored.step;state.chosen=D.jobs[restored.chosen]?restored.chosen:null;
      for(var i=0;i<Math.min(state.step,D.questions.length);i++){var q=D.questions[i];if(!q.optional&&(!state.answers[q.id]||(q.multi&&!state.answers[q.id].length))){state.step=i;break;}}
    }
  }catch(e){}
  function compute(answers){
    var scores={},signals=0,why={};D.order.forEach(function(id){scores[id]=0;why[id]=[];});
    ['interest','style'].forEach(function(qid){var id=answers[qid];if(D.jobs[id]){scores[id]+=2;signals++;why[id].push(answerLabel(qid,answers));}});
    var ranked=D.order.slice().sort(function(a,b){return scores[b]-scores[a]||(a===answers.interest?-1:b===answers.interest?1:D.order.indexOf(a)-D.order.indexOf(b));});
    var ties=signals>0?ranked.filter(function(id){return scores[id]===scores[ranked[0]];}):[];
    return {scores:scores,ranked:ranked,why:why,mode:signals?'job':'explore',ties:ties,signals:signals,primary:signals?ranked[0]:null};
  }
  function invalidateImage(){imageBlob=null;if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=null;}
  function render(focus){
    invalidateImage();
    app.innerHTML=state.step<0?intro():state.step<D.questions.length?question():result();
    window.scrollTo(0,0);if(focus)app.focus({preventScroll:true});
  }
  function intro(){return '<section class="card hero"><div class="kicker">안양 AI·데이터 멘토링 · 대졸자 / 졸업예정자</div><h1>지금의 경험을<br>다음 커리어로 연결하기</h1><p>8개 질문으로 관심 직무와 준비 단계를 나눠 보고, 나에게 맞는 실습·포트폴리오·지원 준비 계획을 확인하세요.</p><div><span class="tag">약 3분</span><span class="tag">4개 직무</span><span class="tag">개인별 4주 실천 계획</span></div></section>'+
    '<section class="card"><h2>대졸자를 위한 한 단계 깊은 탐색</h2><ul><li>AI 서비스 기획자 · 프롬프트 엔지니어 · 데이터 분석가 · LLM 응용 개발자</li><li>전공·프로젝트 경험·보유 역량에 맞춘 첫 과제</li><li>결과물의 증거, 평가 기준, 면접에서 설명할 내용까지</li></ul><p class="note">정답이나 채용 가능성 점수가 아닙니다. 관심 응답은 직무 후보를, 경험과 역량은 준비 순서를 정하는 데 사용합니다.</p><button class="btn primary" data-action="start" style="margin-top:18px">내 커리어 탐색 시작하기 →</button></section><footer>답변은 이 브라우저 탭의 세션에만 보관하며 서버로 보내지 않습니다.<br>이미지 저장·공유는 직접 선택할 때만 실행됩니다.</footer>';}
  function canNext(q){return !!q.optional||(q.multi?(state.answers[q.id]||[]).length>0:!!selected(q.id,state.answers[q.id]));}
  function question(){
    var q=D.questions[state.step],values=q.multi?(state.answers[q.id]||[]):[state.answers[q.id]];
    return '<section class="card"><div class="question-meta"><span>질문 '+(state.step+1)+' / '+D.questions.length+'</span><span>'+(q.multi?'복수 선택':'하나 선택')+'</span></div><div class="progress" role="progressbar" aria-label="설문 진행" aria-valuemin="0" aria-valuemax="8" aria-valuenow="'+state.step+'"><span style="width:'+(state.step/8*100)+'%"></span></div><h1 class="question-title">'+esc(q.title)+'</h1><p class="small muted">'+esc(q.hint)+'</p><div class="stack">'+q.options.map(function(o){var on=values.indexOf(o.id)>=0;return '<button type="button" class="btn opt'+(on?' selected':'')+'" aria-pressed="'+on+'" data-option="'+o.id+'"><span class="icon" aria-hidden="true">'+o.icon+'</span><span>'+esc(o.label)+'</span></button>';}).join('')+'</div><div class="row"><button class="btn" data-action="prev">← 이전</button><button class="btn primary" data-action="next"'+(canNext(q)?'':' disabled')+'>'+(state.step===D.questions.length-1?'결과 보기 →':'다음 →')+'</button></div><p class="small muted" style="margin-top:12px">선택 후 ‘다음’을 누르세요. 이전 질문으로 돌아가 수정할 수 있어요.</p></section>';
  }
  function card(title,body,cls){return '<section class="card'+(cls?' '+cls:'')+'"><h2>'+esc(title)+'</h2>'+body+'</section>';}
  function roleButtons(active){return '<div class="stack no-capture" data-html2canvas-ignore="true">'+D.order.map(function(id){return '<button class="btn'+(active===id?' primary':'')+'" data-job="'+id+'">'+D.jobs[id].icon+' '+esc(D.jobs[id].name)+(active===id?' · 현재 보기':'')+'</button>';}).join('')+'</div>';}
  function llmRoleGuide(){
    var L=window.MD.llmRoles;
    return card('LLM 응용 개발과 모델 학습의 차이','<p>'+esc(L.intro)+'</p>'+L.roles.map(function(r){return '<div class="week"><h3>'+esc(r.name)+'</h3><p>'+esc(r.work)+'</p><div class="proof"><b>모델 튜닝: '+esc(r.tuning)+'</b><br>준비 역량: '+esc(r.skills)+'</div></div>';}).join('')+'<div class="note"><b>로컬 실행과 파인튜닝은 달라요</b><br>'+esc(L.distinction)+'</div><h3>하고 싶은 일로 고르기</h3>'+list(L.roles.map(function(r){return r.want+' → '+r.name;}))+'<h3>실제 서비스 개발 예시</h3><p>'+esc(L.practice)+'</p><p class="small muted">'+esc(L.note)+'</p><p class="small">개념 참고: '+L.sources.map(function(s){return '<a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a>';}).join(' · ')+'</p>');
  }
  function result(){
    var r=compute(state.answers),id=state.chosen||r.primary,j=D.jobs[id],exp=state.answers.experience,skills=state.answers.skills||[],h='';
    if(j){
      var explanation=state.chosen?'직접 선택한 탐색 분야':r.ties.length>1?'두 직무를 함께 탐색해 보세요':'먼저 알아볼 직무 후보';
      h+='<section class="card result-top '+j.color+'"><div class="kicker">'+explanation+'</div><h1 class="job-title">'+j.icon+' '+esc(j.name)+'</h1><p>'+esc(j.one)+'</p>';
      if(!state.chosen){h+=list(r.why[id]);if(r.ties.length>1)h+='<div class="note">관심과 작업 방식이 달라 <b>'+r.ties.map(function(k){return esc(D.jobs[k].name);}).join(' · ')+'</b>가 같은 점수입니다. 첫 관심을 먼저 표시했으며, 아래에서 각 직무의 계획을 비교할 수 있어요.</div>';else if(r.signals===1)h+='<div class="note">하나의 관심 응답으로 나온 후보입니다. 작은 실습으로 맞는지 확인해 보세요.</div>';}
      h+='<p class="small muted" style="margin-top:12px">전공과 경험 수준은 직무 점수에 반영하지 않습니다. 결과는 멘토가 만든 탐색 규칙에 따른 안내입니다.</p></section>';
      h+=card('이 직무에서 맡는 일',list(j.tasks));
      if(id==='llmdev')h+=llmRoleGuide();
      h+=card('나의 준비 출발점','<div class="mission">'+esc(levels[exp])+'</div><p style="margin-top:12px">'+esc(D.majorAdvice[state.answers.major])+'</p><p class="small muted">자기보고 응답을 기준으로 한 안내이며, 실제 역량 평가나 지원 가능 판정은 아닙니다.</p>');
      var gaps=j.required.filter(function(k){return skills.indexOf(k)<0;});
      h+=card('역량 점검과 다음 행동',j.required.map(function(k){var done=skills.indexOf(k)>=0,s=D.skills[k];return '<div class="skill"><span class="skill-mark'+(done?' done':'')+'">'+(done?'경험 있음':'다음 학습')+'</span><div><b>'+esc(s.label)+'</b><div class="small muted">'+esc(done?'설명할 수 있는 실제 사례·코드·문서를 결과물로 연결하세요.':s.action)+'</div></div></div>';}).join('')+'<div class="note">'+(gaps.length?'먼저 채워 볼 항목: <b>'+esc(D.skills[gaps[0]].label)+'</b>. 한 번에 전부 배우기보다 아래 프로젝트에 필요한 범위부터 시작하세요.':'체크한 역량을 같은 프로젝트에서 함께 사용하고, 실패·한계까지 설명할 수 있는지 검증해 보세요.')+'</div>');
      var plan=j.plans[exp];
      h+=card('나에게 맞는 4주 실천 계획','<p class="small muted">'+esc(answerLabel('time'))+' · '+esc(D.workloads[state.answers.time])+'</p>'+plan.map(function(step,i){return '<div class="week"><strong>'+(i+1)+'주차</strong><p>'+esc(step)+'</p></div>';}).join('')+'<div class="note">기초 체험과 실습의 4주 계획입니다. 새로운 개발·분석 직무의 전체 준비 기간이나 취업을 보장하지 않습니다.</div>');
      h+=card('포트폴리오 한 가지를 완성한다면','<h3>'+esc(j.portfolio.title)+'</h3><p>'+esc(j.portfolio.desc)+'</p><h3>남겨야 할 증거</h3>'+list(j.portfolio.proof)+'<div class="proof"><b>평가 기준</b><br>'+esc(j.portfolio.metric)+'</div>');
      h+=card('지원 준비와 면접','<p>'+esc(D.goals[state.answers.goal])+'</p><h3>공고 검색어</h3><div>'+j.keywords.map(function(k){return '<span class="tag">'+esc(k)+'</span>';}).join('')+'</div><p class="small muted">검색용 예시이며 현재 채용 중인 공고 목록은 아닙니다. 업무·필수 역량·본인 증거를 비교하세요.</p><h3>면접에서 설명할 질문</h3><p>'+esc(j.interview)+'</p>');
    }else{
      h+=card('🧭 아직 방향을 정하지 않아도 괜찮아요','<p>두 관심 질문에 모두 ‘모름’을 골랐습니다. 특정 직무를 임의로 추천하지 않고, 비교할 네 가지 체험을 제안합니다.</p>'+list(['기획: 사용자 문제 하나와 성공 기준을 1페이지로 정리','프롬프트: 같은 질문 10개로 지시문 2개를 비교','분석: 공개 표 데이터로 질문 하나와 그래프 2개 작성','개발: 입력을 받아 결과를 돌려주는 작은 프로그램 제작'])+'<p class="note">아래에서 더 알아보고 싶은 분야를 누르면 경험·시간에 맞는 계획을 볼 수 있어요.</p>'+roleButtons(null));
      h+=card('지금의 배경을 활용하기','<p>'+esc(D.majorAdvice[state.answers.major])+'</p><p>'+esc(D.goals[state.answers.goal])+'</p>');
    }
    if(j)h+=card('다른 직무의 계획도 비교하기','<p class="small muted">답변은 유지한 채 선택한 직무의 준비 계획만 살펴볼 수 있어요.</p>'+roleButtons(id));
    var topics=state.answers.topics||[];
    h+=card('멘토링 전에 짚어 보기',(topics.length?topics:['portfolio','interview']).map(function(k){var f=D.faqs[k];return '<details'+(topics.length?' open':'')+'><summary>'+esc(f.q)+'</summary><p>'+esc(f.a)+'</p></details>';}).join(''));
    var resources=j?j.resource:['sql','python','ml'];
    h+=card('공식 문서로 이어서 학습하기',resources.map(function(k){var s=D.sources[k];return '<a class="source" href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.name)+' ↗<span>'+esc(s.desc)+'</span></a>';}).join('')+'<p class="small muted" style="margin-top:12px">2026-10-22 공식 자료 확인. 학습 순서·과제·직무 연결은 멘토의 제안입니다.</p>');
    h+=card('👀 멘토에게 보여주기','<dl><dt>탐색 분야</dt><dd>'+esc(j?j.name:'미정 · 4개 직무 체험')+'</dd><dt>첫 관심</dt><dd>'+esc(answerLabel('interest'))+'</dd><dt>전공·배경</dt><dd>'+esc(answerLabel('major'))+'</dd><dt>현재 경험</dt><dd>'+esc(answerLabel('experience'))+'</dd><dt>보유 역량</dt><dd>'+esc(answerLabel('skills'))+'</dd><dt>목표</dt><dd>'+esc(answerLabel('goal'))+'</dd><dt>주간 시간</dt><dd>'+esc(answerLabel('time'))+'</dd><dt>상담 주제</dt><dd>'+esc(answerLabel('topics'))+'</dd></dl>','show');
    h+=card('📬 진로 고민, 언제든 연락해요','<p>진로와 관련해 고민이 생기면 언제든 이메일을 보내 주세요. 함께 이야기해 볼게요.</p><a href="mailto:morgan109jb@gmail.com">morgan109jb@gmail.com</a>','contact');
    h+='<section class="card save no-capture" data-html2canvas-ignore="true"><h2>🖼️ 결과 페이지 저장하기</h2><p class="small muted">위 결과 전체를 한 장의 PNG로 만들어요. 이미지 생성은 이 기기 안에서 처리됩니다.</p><div class="stack"><button class="btn primary" data-action="share">공유 메뉴로 저장하기</button><button class="btn" data-action="download">PNG 파일로 다운로드</button><a class="btn" id="download-ready" hidden download="대졸자-AI-데이터-커리어-결과.png">준비된 PNG 다시 다운로드</a></div><p class="save-status" id="save-status" role="status" aria-live="polite"></p><img id="image-preview" class="image-preview" alt="길게 눌러 저장할 수 있는 결과 이미지" hidden><p class="small muted" id="preview-help" hidden>다운로드가 열리지 않으면 위 이미지를 길게 눌러 저장해 주세요. 갤러리 저장 옵션은 브라우저에 따라 달라요.</p></section>';
    h+='<div class="row actions no-capture" data-html2canvas-ignore="true"><button class="btn" data-action="edit">답변 수정하기</button><button class="btn" data-action="restart">처음부터 다시</button></div><footer>답변은 서버에 전송하지 않습니다. 이 탭을 닫으면 세션이 종료됩니다.<br>공유를 선택하면 생성한 결과 이미지가 선택한 앱에 전달됩니다.</footer>';
    return h;
  }
  function status(text){var el=document.getElementById('save-status');if(el)el.textContent=text;}
  function prepareImage(){
    if(imageBlob)return Promise.resolve(imageBlob);
    if(!window.html2canvas)return Promise.reject(new Error('이미지 기능을 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.'));
    status('결과 전체를 이미지로 만드는 중입니다…');
    return (document.fonts?document.fonts.ready:Promise.resolve()).then(function(){
      var width=app.offsetWidth,height=app.scrollHeight,scale=Math.min(window.devicePixelRatio||1,2,Math.sqrt(12000000/(width*height)),15000/height);
      return window.html2canvas(app,{backgroundColor:getComputedStyle(document.body).backgroundColor,scale:scale,scrollY:0,logging:false,useCORS:true});
    }).then(function(canvas){return new Promise(function(resolve,reject){canvas.toBlob(function(blob){canvas.width=0;canvas.height=0;if(blob)resolve(blob);else reject(new Error('이미지 생성에 실패했어요. 다시 시도해 주세요.'));},'image/png');});}).then(function(blob){
      imageBlob=blob;imageUrl=URL.createObjectURL(blob);
      var a=document.getElementById('download-ready');a.href=imageUrl;a.hidden=false;
      var img=document.getElementById('image-preview');img.src=imageUrl;img.hidden=false;document.getElementById('preview-help').hidden=false;
      return blob;
    });
  }
  function exportImage(mode){
    if(building)return;
    if(mode==='share'&&imageBlob){
      try{var file=new File([imageBlob],'대졸자-AI-데이터-커리어-결과.png',{type:'image/png'});
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
          navigator.share({files:[file],title:'대졸자 AI·데이터 커리어 탐색'}).then(function(){status('공유 메뉴를 닫았습니다. 선택한 앱에서 저장 여부를 확인해 주세요.');}).catch(function(e){status(e.name==='AbortError'?'공유를 취소했습니다. 아래 다운로드 버튼도 사용할 수 있어요.':'공유 메뉴가 열리지 않았어요. 다운로드하거나 이미지를 길게 눌러 저장해 주세요.');});return;
        }
      }catch(e){}document.getElementById('download-ready').click();status('이 브라우저는 파일 공유를 지원하지 않아 다운로드를 요청했어요.');return;
    }
    building=true;var buttons=app.querySelectorAll('.save button,.actions button');buttons.forEach(function(b){b.disabled=true;});
    prepareImage().then(function(){
      if(mode==='download'){document.getElementById('download-ready').click();status('PNG 다운로드를 요청했어요. 파일이 보이지 않으면 아래 링크를 다시 누르거나 이미지를 길게 눌러 주세요.');}
      else status('이미지가 준비됐어요. ‘공유 메뉴로 저장하기’를 한 번 더 누르면 휴대폰 공유 메뉴가 열립니다.');
    }).catch(function(e){status(e.message||'이미지 저장을 다시 시도해 주세요.');}).finally(function(){building=false;buttons.forEach(function(b){b.disabled=false;});});
  }
  app.addEventListener('click',function(ev){
    var button=ev.target.closest('button');if(!button||button.disabled||building)return;
    var action=button.dataset.action,option=button.dataset.option,job=button.dataset.job;
    if(action==='share'||action==='download'){exportImage(action);return;}
    if(option){
      var q=D.questions[state.step];if(!q||!selected(q.id,option))return;
      if(q.multi){var values=(state.answers[q.id]||[]).slice(),ix=values.indexOf(option);
        if(ix>=0)values.splice(ix,1);else if(option==='none')values=['none'];else{values=values.filter(function(x){return x!=='none';});if(values.length>=q.multi)return;values.push(option);}state.answers[q.id]=values;
      }else state.answers[q.id]=option;
      state.chosen=null;persist();
      var selectedValues=q.multi?state.answers[q.id]:[state.answers[q.id]];
      app.querySelectorAll('[data-option]').forEach(function(el){var on=selectedValues.indexOf(el.dataset.option)>=0;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));});
      app.querySelector('[data-action="next"]').disabled=!canNext(q);return;
    }
    if(job&&D.jobs[job])state.chosen=job;
    else if(action==='start')state={step:0,answers:{},chosen:null};
    else if(action==='restart')state={step:-1,answers:{},chosen:null};
    else if(action==='prev')state.step=Math.max(-1,state.step-1);
    else if(action==='edit')state.step=0;
    else if(action==='next'){if(!canNext(D.questions[state.step]))return;state.step++;}
    else return;
    persist();render(true);
  });
  window.__G_TEST__={compute:compute};
  render(false);
})();
