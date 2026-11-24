const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 대표 이미지: 사진 더미 넘기기
const $ = id => document.getElementById(id);
const stack = $('stack');
const photos = [...stack.querySelectorAll('.photo')];
const n = photos.length;
const pad = k => String(k).padStart(2, '0');
$('total').textContent = pad(n);
const thumbs = $('thumbs');
photos.forEach((p, i) => {
  const b = document.createElement('button');
  b.setAttribute('aria-label', (i + 1) + '번 이미지');
  const img = p.querySelector('img');
  if (img) b.innerHTML = '<img src="' + img.getAttribute('src') + '" alt="">';
  b.onclick = () => go(i);
  thumbs.appendChild(b);
});
let idx = 0;
function layout() {
  photos.forEach((p, i) => {
    const pos = (i - idx + n) % n;
    p.dataset.pos = pos < 3 ? pos : 'rest';
  });
  $('cur').textContent = pad(idx + 1);
  $('now').textContent = photos[idx].dataset.cap;
  [...thumbs.children].forEach((b, j) => b.classList.toggle('on', j === idx));
}
function go(i) {
  if (n < 2) return;
  const next = (i + n) % n;
  if (next === idx) return;
  // 앞으로 넘길 때는 앞 사진이 왼쪽 아래로 빠졌다가 더미 맨 뒤로 들어간다
  if (next === (idx + 1) % n) {
    const front = photos[idx];
    front.classList.add('leaving');
    setTimeout(() => front.classList.remove('leaving'), 420);
  }
  idx = next;
  layout();
}
$('prev').onclick = () => go(idx - 1);
$('next').onclick = () => go(idx + 1);
stack.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(idx + 1); if (e.key === 'ArrowLeft') go(idx - 1); });
// 앞 사진을 클릭하면 다음, 끌면 끈 방향으로 넘긴다
let down = null;
stack.addEventListener('pointerdown', e => { down = e.clientX; });
stack.addEventListener('pointerup', e => {
  if (down === null) return;
  const dx = e.clientX - down; down = null;
  if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
  else if (e.target.closest('.photo') === photos[idx]) go(idx + 1);
});
layout();

const bar = $('progress');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
}, { passive: true });
