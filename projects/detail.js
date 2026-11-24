const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 대표 이미지 넘기기
const slides = document.getElementById('slides');
const items = [...slides.children];
const pad = n => String(n).padStart(2, '0');
const $ = id => document.getElementById(id);
$('total').textContent = pad(items.length);
if (items.length < 2) {
  slides.classList.add('single');
  document.querySelector('.gallery-info').classList.add('single');
}
const thumbs = $('thumbs');
items.forEach((s, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', (i + 1) + '번 이미지');
  const img = s.querySelector('img');
  if (img) b.innerHTML = '<img src="' + img.getAttribute('src') + '" alt="">';
  b.onclick = () => go(i);
  thumbs.appendChild(b);
});
let idx = 0;
function go(i) { idx = Math.max(0, Math.min(items.length - 1, i)); slides.scrollTo({ left: idx * slides.clientWidth }); }
function sync() {
  idx = Math.round(slides.scrollLeft / slides.clientWidth);
  const cap = items[idx].dataset.cap;
  $('cur').textContent = pad(idx + 1);
  $('now').textContent = cap;
  $('cap').textContent = cap;
  $('prev').disabled = idx === 0;
  $('next').disabled = idx === items.length - 1;
  [...thumbs.children].forEach((b, j) => b.classList.toggle('on', j === idx));
}
slides.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
$('prev').onclick = () => go(idx - 1);
$('next').onclick = () => go(idx + 1);
slides.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(idx + 1); if (e.key === 'ArrowLeft') go(idx - 1); });
// 마우스로 끌어서 넘기기
let down = null;
slides.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && items.length > 1) { down = e.clientX; slides.style.scrollSnapType = 'none'; } });
addEventListener('pointerup', e => {
  if (down === null) return;
  const dx = e.clientX - down; down = null; slides.style.scrollSnapType = '';
  go(Math.abs(dx) > 40 ? idx + (dx < 0 ? 1 : -1) : idx);
});
addEventListener('resize', () => go(idx));
sync();

const bar = $('progress');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
}, { passive: true });
