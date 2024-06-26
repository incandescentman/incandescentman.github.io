// script.js

document.addEventListener('DOMContentLoaded', function() {
  const daysContainer = document.getElementById('days-container');
  const days = Array.from(document.querySelectorAll('div[id^="outline-container-"]'));

  let rowHtml = '';
  let currentMonth = '';

  days.forEach((day, index) => {
    const dateElement = day.querySelector('.timestamp');
    const dateString = dateElement.textContent.trim();
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'long' });

    if (index % 7 === 0) {
      if (rowHtml !== '') {
        rowHtml += `<div class="text-center">${currentMonth}</div>`;
        daysContainer.innerHTML += `<div class="flex">${rowHtml}</div>`;
        rowHtml = '';
      }
      currentMonth = month;
    }

    const status = day.querySelector('.todo, .done');
    let bgColor = '';

    if (status) {
      if (status.classList.contains('DONE')) {
        bgColor = 'bg-green-500';
      } else if (status.classList.contains('MISSED')) {
        bgColor = 'bg-red-500';
      } else if (status.classList.contains('TODO')) {
        bgColor = 'bg-yellow-500';
      }
    }

    rowHtml += `
      <div class="w-24 h-24 m-2 flex items-center justify-center ${bgColor} text-white font-bold rounded">
        ${date.getDate()}
      </div>
    `;
  });

  if (rowHtml !== '') {
    rowHtml += `<div class="text-center">${currentMonth}</div>`;
    daysContainer.innerHTML += `<div class="flex">${rowHtml}</div>`;
  }
});
