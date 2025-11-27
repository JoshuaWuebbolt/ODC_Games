(() => {
  const draggables = document.querySelectorAll('.draggable');
  const targets = document.querySelectorAll('.target');
  const bank = document.getElementById('bank');
  let dragKey = null;

  // Drag and drop for desktop
  draggables.forEach(el => {
    el.addEventListener('dragstart', e => {
      dragKey = el.dataset.key;
      e.dataTransfer.setData('text/plain', dragKey);
    });
    // For mobile, make it also clickable to "pick up" via pointer events if needed
  });

  targets.forEach(t => {
    t.addEventListener('dragover', e => e.preventDefault());
    t.addEventListener('drop', e => {
      e.preventDefault();
      const key = e.dataTransfer.getData('text/plain');
      if(!key) return;
      // prevent duplicate: remove existing same key from other targets or bank
      // move the element into target
      const el = [...document.querySelectorAll('.draggable')].find(d => d.dataset.key === key);
      if(!el) return;
      // If target already has child (label), return it to bank
      const existing = t.querySelector('.draggable');
      if(existing) bank.appendChild(existing);
      t.appendChild(el);
      el.style.pointerEvents = 'auto';
    });
  });

  // allow dragging from targets back to bank
  bank.addEventListener('dragover', e => e.preventDefault());
  bank.addEventListener('drop', e => {
    e.preventDefault();
    const key = e.dataTransfer.getData('text/plain');
    const el = [...document.querySelectorAll('.draggable')].find(d => d.dataset.key === key);
    if(el) bank.appendChild(el);
  });

  // Check answers
  const checkBtn = document.getElementById('checkBtn');
  const result = document.getElementById('result');
  checkBtn.addEventListener('click', () => {
    let correct = 0;
    targets.forEach(t => {
      const expected = t.dataset.accept;
      const placed = t.querySelector('.draggable');
      if(placed && placed.dataset.key === expected){
        correct++;
        t.style.borderColor = 'var(--ok)';
        t.style.background = '#f0fff4';
      } else {
        t.style.borderColor = '#f2c0c0';
        t.style.background = '#fff6f6';
      }
    });
    result.textContent = `You got ${correct} of ${targets.length} correct.`;
    if(correct === targets.length){
      result.innerHTML += ' <span style="color:var(--ok)">Great! You are a Sewing Star!</span>';
      winCondition();
    } else {
      result.innerHTML += ' Try swapping labels and check again.';
    }
  });

  // Reset button
  document.getElementById('resetBtn').addEventListener('click', () => {
    // move all labels back to bank
    document.querySelectorAll('.target .draggable').forEach(d => bank.appendChild(d));
    targets.forEach(t => {
      t.style.borderColor = '#ddd';
      t.style.background = '#fafafa';
    });
    result.textContent = '';
  });

  // Make touch-drag work more reliably by using pointer events fallback (simple tap-to-select)
  let selected = null;
  document.addEventListener('click', e => {
    // handle simple tap selection for mobile: tap a label to select, tap a target to place
    const lbl = e.target.closest('.draggable');
    const trg = e.target.closest('.target');
    if(lbl){
      selected = lbl;
      // highlight
      document.querySelectorAll('.draggable').forEach(d => d.style.boxShadow = '');
      lbl.style.boxShadow = '0 6px 14px rgba(0,0,0,.08)';
      return;
    }
    if(trg && selected){
      const existing = trg.querySelector('.draggable');
      if(existing) bank.appendChild(existing);
      trg.appendChild(selected);
      selected.style.boxShadow = '';
      selected = null;
    }
    // clicking bank deselects
    if(e.target.closest('#bank')) {
      if(selected) selected.style.boxShadow = '';
      selected = null;
    }
  });

  // ========== GAME 2: FILL IN THE BLANK ==========
  const letterBoxes = document.querySelectorAll('.letter-box');
  const checkBlankBtn = document.getElementById('checkBlankBtn');
  const resetBlankBtn = document.getElementById('resetBlankBtn');
  const blankResult = document.getElementById('blankResult');
  const correctAnswer = 'MANNEQUIN';

  // Auto-focus next box on input
  letterBoxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
      const value = e.target.value.toUpperCase();
      e.target.value = value;

      // Move to next box if current has a letter
      if (value && index < letterBoxes.length - 1) {
        letterBoxes[index + 1].focus();
      }
    });

    // Handle backspace to go to previous box
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        letterBoxes[index - 1].focus();
      }
    });
  });

  // Check blank answer
  checkBlankBtn.addEventListener('click', () => {
    let userAnswer = '';
    let allFilled = true;

    letterBoxes.forEach(box => {
      const value = box.value.toUpperCase();
      userAnswer += value;
      if (!value) allFilled = false;
    });

    if (!allFilled) {
      blankResult.textContent = '⚠️ Please fill in all the letters!';
      blankResult.style.color = '#ff6b6b';
      return;
    }

    if (userAnswer === correctAnswer) {
      letterBoxes.forEach(box => {
        box.classList.remove('wrong');
        box.classList.add('correct');
        box.disabled = true;
      });
      blankResult.textContent = '🎉 Correct! Mr. Hudson is the Mannequin!';
      blankResult.style.color = 'var(--ok)';
      checkBlankBtn.disabled = true;
      winCondition();
    } else {
      letterBoxes.forEach((box, index) => {
        box.classList.remove('correct');
        if (box.value.toUpperCase() === correctAnswer[index]) {
          box.classList.add('correct');
        } else {
          box.classList.add('wrong');
        }
      });
      blankResult.textContent = '❌ Not quite right. Try again!';
      blankResult.style.color = 'var(--bad)';
    }
  });

  // Reset blank game
  resetBlankBtn.addEventListener('click', () => {
    letterBoxes.forEach(box => {
      box.value = '';
      box.classList.remove('correct', 'wrong');
      box.disabled = false;
    });
    blankResult.textContent = '';
    checkBlankBtn.disabled = false;
    letterBoxes[0].focus();
  });
  // Periodically check for win condition
  function winCondition() {
    const starAchieved = result && (result.innerHTML || '').includes('Great! You are a Sewing Star!');
    const blankAchieved = blankResult && (blankResult.innerHTML || '').includes('🎉 Correct! Mr. Hudson is the Mannequin!');
    if (starAchieved && blankAchieved) {
      localStorage.setItem("doneSewing", "true");
      window.alert("You have completed the Thread it Right game!");
      window.location.href = "/sewing/win";
    }
  }

})();
