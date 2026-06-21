// Terminal typing effect
const lines = [
  "> mengimbas rangkaian...",
  "> 14,302 kelemahan dikesan minggu ini",
  "> patch sistem kau, bodoh",
  "> geng ransomware bocorkan dump 2TB",
  "> zero-day dijumpai berleluasa",
  "> kekal paranoid. kekal updated."
];

function typeLoop(el){
  let li = 0, ci = 0, deleting = false;

  function tick(){
    const current = lines[li];
    if(!deleting){
      ci++;
      el.textContent = current.slice(0, ci);
      if(ci === current.length){
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      ci--;
      el.textContent = current.slice(0, ci);
      if(ci === 0){
        deleting = false;
        li = (li + 1) % lines.length;
      }
    }
    setTimeout(tick, deleting ? 35 : 55);
  }
  tick();
}

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('typed-line');
  if(el) typeLoop(el);

  // mobile hamburger nav toggle
  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if(toggle && navLinks){
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // fake terminal boot log on hero terminal box if present
  const boot = document.getElementById('boot-log');
  if(boot){
    const bootLines = [
      "[OK] memuatkan modul kernel...",
      "[OK] mounting /dev/exploit...",
      "[OK] memintas firewall (gurau je)...",
      "[OK] memulakan siaran SIBERWATCH...",
      "[SIAP] selamat kembali, operator."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if(i >= bootLines.length){ clearInterval(interval); return; }
      const p = document.createElement('div');
      p.innerHTML = `<span class="prompt">$</span> ${bootLines[i]}`;
      boot.appendChild(p);
      i++;
    }, 500);
  }
});
