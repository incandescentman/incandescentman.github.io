document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dayContainer');
    if (!container) {
        console.error("Container element not found!");
        return;
    }

    fetch('progress.html')
        .then(response => response.text())
        .then(data => processHtmlData(data, container))
        .catch(error => console.error('Error fetching progress.html:', error));
});

function processHtmlData(htmlData, container) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');
    const entries = doc.querySelectorAll('#content .outline-2');

    let weekRow = document.createElement('div');
    weekRow.classList.add('week-row');

    let dayCount = 0;
    let daysInCurrentRow = 0;

    entries.forEach((entry) => {
        const h2 = entry.querySelector('h2');
        if (!h2) return;

        const dateMatch = h2.textContent.match(/(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) return;

        const dateString = dateMatch[1];
        const date = new Date(dateString);

        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.innerHTML = `<p class="full-date">${date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>`;

        const statusSpan = h2.querySelector('span.done, span.todo');
        if (statusSpan) {
            const status = statusSpan.classList.contains('done') ? 'DONE' :
                           statusSpan.classList.contains('todo') && statusSpan.textContent === 'MISSED' ? 'MISSED' : 'TODO';

            dayCount++;
            dayElement.innerHTML += `<p class="day-number">Day ${dayCount}</p>`;

            if (status === 'DONE') {
                dayElement.classList.add('completed');
                dayElement.innerHTML = `<span class="checkmark">✔</span>` + dayElement.innerHTML;
            } else if (status === 'MISSED') {
                dayElement.classList.add('missed');
                dayElement.innerHTML = `<span class="cross">✘</span>` + dayElement.innerHTML;
            } else if (status === 'TODO') {
                dayElement.classList.add('todo');
                dayElement.innerHTML = `<span class="empty-square">☐</span>` + dayElement.innerHTML;
            }
        }

        weekRow.appendChild(dayElement);
        daysInCurrentRow++;

        // If we've added 7 days to the current row, add the month column and start a new row
        if (daysInCurrentRow === 7) {
            addMonthColumnAndAppendRow(weekRow, date, container);
            weekRow = document.createElement('div');
            weekRow.classList.add('week-row');
            daysInCurrentRow = 0;
        }
    });

    // Handle the last row if it's not complete
    if (weekRow.children.length > 0) {
        const lastDate = new Date(weekRow.lastChild.querySelector('.full-date').textContent);
        addMonthColumnAndAppendRow(weekRow, lastDate, container);
    }
}

function addMonthColumnAndAppendRow(weekRow, date, container) {
    const monthElement = document.createElement('div');
    monthElement.classList.add('month');
    monthElement.textContent = date.toLocaleString('en-US', { month: 'long' });
    weekRow.appendChild(monthElement);
    container.appendChild(weekRow);
}
