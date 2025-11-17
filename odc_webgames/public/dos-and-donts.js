(function () {
  const highlightDoBtn = document.getElementById("highlight-do");
  const highlightDontBtn = document.getElementById("highlight-dont");
  const resetBtn = document.getElementById("reset");
  const doList = document.getElementById("do-list");
  const dontList = document.getElementById("dont-list");

  function clearHighlights() {
    doList.classList.remove("highlight-do");
    dontList.classList.remove("highlight-dont");
    // also remove classes from individual items
    Array.from(doList.children).forEach(li => li.classList.remove("highlight-do"));
    Array.from(dontList.children).forEach(li => li.classList.remove("highlight-dont"));
  }

  highlightDoBtn.addEventListener("click", () => {
    clearHighlights();
    // apply class to list and items
    doList.classList.add("highlight-do");
    Array.from(doList.children).forEach(li => li.classList.add("highlight-do"));
  });

  highlightDontBtn.addEventListener("click", () => {
    clearHighlights();
    dontList.classList.add("highlight-dont");
    Array.from(dontList.children).forEach(li => li.classList.add("highlight-dont"));
  });

  resetBtn.addEventListener("click", () => {
    clearHighlights();
  });
})();
