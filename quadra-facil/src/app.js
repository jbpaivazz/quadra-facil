const courts = window.QUADRAS;

const grid = document.querySelector('#court-grid');
const dialog = document.querySelector('#booking-dialog');
let selectedCourt = null;
let activeSport = 'all';
function normalizeText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}
function renderCourts() {
  const query = normalizeText(document.querySelector('#search').value);
  const visible = courts.filter(court => (activeSport === 'all' || court.sport === activeSport) && normalizeText(`${court.name} ${court.sport} ${court.area}`).includes(query));
  grid.innerHTML = visible.length
    ? visible.map(court => {
      const slots = court.times.map(time => {
        const unavailable = court.unavailable?.includes(time);
        return `<button class="slot${unavailable ? ' unavailable' : ''}" data-court="${courts.indexOf(court)}" data-time="${time}" ${unavailable ? 'disabled title="Horário indisponível"' : ''}>${time}</button>`;
      }).join('');
      return `<article class="court-card"><div class="court-photo" aria-hidden="true">${court.icon}</div><div class="court-info"><h3>${court.name}</h3><p>${court.type} · ${court.area}</p><div class="court-meta"><span>${court.sport}</span><span class="price"><b>R$ ${court.price}</b> / hora</span></div><div class="slots">${slots}</div></div></article>`;
    }).join('')
    : '<p class="empty">Nenhuma quadra encontrada. Tente outra busca.</p>';
  grid.querySelectorAll('.slot').forEach(button => button.addEventListener('click', () => openBooking(Number(button.dataset.court), button.dataset.time)));
}
function openBooking(courtIndex, time) {
  selectedCourt = courts[courtIndex];
  document.querySelector('#dialog-title').textContent = selectedCourt.name;
  const dateInput = document.querySelector('#date');
  const today = new Date();
  dateInput.min = today.toLocaleDateString('sv-SE');
  dateInput.value = dateInput.min;
  document.querySelector('#time').innerHTML = selectedCourt.times.map(slot => `<option ${slot === time ? 'selected' : ''}>${slot}</option>`).join('');
  document.querySelector('#form-message').textContent = '';
  dialog.showModal();
}
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.filter.active').classList.remove('active');
  button.classList.add('active'); activeSport = button.dataset.sport; renderCourts();
}));
document.querySelector('#search').addEventListener('input', renderCourts);
document.querySelector('#clear-search').addEventListener('click', () => {
  const field = document.querySelector('#search');
  field.value = '';
  field.focus();
  renderCourts();
});
document.querySelector('#confirm-booking').addEventListener('click', event => {
  event.preventDefault();
  const name = document.querySelector('#name').value.trim();
  if (!name) { document.querySelector('#name').reportValidity(); return; }
  const date = new Date(`${document.querySelector('#date').value}T00:00:00`).toLocaleDateString('pt-BR');
  document.querySelector('#form-message').textContent = `Pedido demonstrativo registrado para ${name} em ${date} às ${document.querySelector('#time').value}.`;
  setTimeout(() => dialog.close(), 1600);
});
renderCourts();

