(() => {
  const items = [
    {text:"Jordan unwraps a bag of chips while waiting and leaves crumbs by the 3D printer.", correct:"rude", explain:"Food near machines can cause damage and attract pests."},
    {text:"Alex opens the laser cutter mid-job to see how it works.", correct:"rude", explain:"Never access running machines — it risks damage or injury."},
    {text:"Casey cleans and returns scissors and thread to the labeled drawers after use.", correct:"polite", explain:"Tidy workspaces help everyone."},
    {text:"Jamie moves a 3D printer to another table without permission.", correct:"rude", explain:"Machines are calibrated and should not be moved."},
    {text:"Taylor checks that the sewing machine is threaded correctly and marked 'Ready' before use.", correct:"polite", explain:"Always check status before operating a machine."},
    {text:"Riley throws cardboard into a bin labeled 'Plastic Only'.", correct:"rude", explain:"Sort materials correctly to keep the space clean and recyclable."},
    {text:"Morgan reports a faulty laser cutter to staff instead of using it.", correct:"polite", explain:"Reporting problems helps maintain safe equipment."}
  ];

  let index = 0, score = 0;
  const introCard = document.getElementById('introCard');
  const gameCard = document.getElementById('gameCard');
  const scenarioEl = document.getElementById('scenario');
  const feedbackEl = document.getElementById('feedback');
  const progressEl = document.getElementById('progress');
  const finalEl = document.getElementById('final');

  // Start button handler
  document.getElementById('startBtn').addEventListener('click', () => {
    introCard.style.display = 'none';
    gameCard.style.display = 'block';
    show();
  });

  function show(){
    if(index >= items.length){
      finish();
      return;
    }
    const it = items[index];
    scenarioEl.textContent = it.text;
    feedbackEl.textContent = '';
    progressEl.textContent = `Scenario ${index+1} of ${items.length}`;
  }

  document.getElementById('btnPolite').addEventListener('click', () => answer('polite'));
  document.getElementById('btnRude').addEventListener('click', () => answer('rude'));

  function answer(choice){
    const it = items[index];
    const correct = it.correct;
    if(choice === correct){
      score++;
      feedbackEl.textContent = 'Correct — ' + it.explain;
      feedbackEl.style.color = 'var(--accent)';
    } else {
      feedbackEl.textContent = 'Not quite — ' + it.explain;
      feedbackEl.style.color = 'var(--wrong)';
    }
    index++;
    setTimeout(show, 1100);
  }

  function finish(){
    scenarioEl.textContent = 'All done!';
    progressEl.textContent = '';
    document.querySelector('.buttons').style.display = 'none';
    feedbackEl.style.display = 'none';
    finalEl.style.display = 'block';
    const percent = Math.round((score/items.length)*100);
    let badge = '';
    if(percent === 100) badge = '✨ Etiquette Expert ✨';
    else if(percent >= 70) badge = '👍 Polite Producer';
    else badge = '🙂 Maker-in-Training';
    finalEl.innerHTML = `<strong>Score: ${score} / ${items.length} (${percent}%)</strong><br>${badge}<br><small style="color:var(--muted)">Tip: scan the poster QR codes for quick reminders of Maker Manners.</small>`;

    // emit a custom event so external scripts can react
    try {
      window.dispatchEvent(new CustomEvent('dosGameOver', { detail: { score } }));
    } catch (e) { /* ignore */ }

    // remove any previous retry button
    const prevRetry = document.getElementById('retryBtn');
    if (prevRetry) prevRetry.remove();

    // redirect to the win page on a perfect score (give a short delay so the user sees the message)
    if (score === items.length) {
      setTimeout(() => { window.location.href = 'dos-and-donts/win'; }, 900);
      return;
    }

    // non-perfect: show a "Try Again" button to restart the challenge
    const retryBtn = document.createElement('button');
    retryBtn.id = 'retryBtn';
    retryBtn.className = 'btn start-btn';
    retryBtn.textContent = 'Try Again ↺';
    retryBtn.type = 'button';
    retryBtn.style.marginTop = '12px';
    finalEl.appendChild(retryBtn);

    retryBtn.addEventListener('click', () => {
      // reset state
      index = 0;
      score = 0;
      // restore UI
      finalEl.style.display = 'none';
      feedbackEl.style.display = ''; // restore feedback visibility
      const buttons = document.querySelector('.buttons');
      if (buttons) buttons.style.display = ''; // show choice buttons
      // restart
      show();
    });
  }

  // initialise
  show();

})();
