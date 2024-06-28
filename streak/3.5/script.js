function processHtmlData(htmlData, container) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlData, 'text/html');
    const entries = doc.querySelectorAll('#content .outline-2');

    let weekRow = document.createElement('div');
    weekRow.classList.add('week-row');

    let dayCount = 0;
    let daysInCurrentRow = 0;
    let firstDayProcessed = false;

    entries.forEach((entry) => {
        const h2 = entry.querySelector('h2');
        if (!h2) return;

        const dateMatch = h2.textContent.match(/(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) return;

        const dateString = dateMatch[1];
        const date = new Date(dateString);

        // If this is the first day, we might need to add a month column
        if (!firstDayProcessed) {
            if (date.getDay() !== 0) { // If it's not Sunday
                addMonthColumnIfNeeded(weekRow, date);
            }
            firstDayProcessed = true;
        }

        const dayElement = createDayElement(date, h2);

        if (dayElement.classList.contains('completed') ||
            dayElement.classList.contains('missed') ||
            dayElement.classList.contains('todo')) {
            dayCount++;
            dayElement.querySelector('.day-number').textContent = `Day ${dayCount}`;
        }

        weekRow.appendChild(dayElement);
        daysInCurrentRow++;

        // If we've added 7 days to the current row, or if it's the last day of the week
        if (daysInCurrentRow === 7 || date.getDay() === 6) {
            addMonthColumnIfNeeded(weekRow, date);
            container.appendChild(weekRow);
            weekRow = document.createElement('div');
            weekRow.classList.add('week-row');
            daysInCurrentRow = 0;
        }
    });

    // Handle the last row if it's not complete
    if (weekRow.children.length > 0) {
        addMonthColumnIfNeeded(weekRow, new Date(weekRow.lastChild.querySelector('.full-date').textContent));
        container.appendChild(weekRow);
    }
}

function createDayElement(date, h2) {
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    dayElement.innerHTML = `<p class="full-date">${date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            <p class="day-number"></p>`;

    const statusSpan = h2.querySelector('span.done, span.todo');
    if (statusSpan) {
        const status = statusSpan.classList.contains('done') ? 'DONE' :
                       statusSpan.classList.contains('todo') && statusSpan.textContent === 'MISSED' ? 'MISSED' : 'TODO';

        if (status === 'DONE') {
            dayElement.classList.add('completed');
            dayElement.insertAdjacentHTML('afterbegin', '<span class="checkmark">✔</span>');
        } else if (status === 'MISSED') {
            dayElement.classList.add('missed');
            dayElement.insertAdjacentHTML('afterbegin', '<span class="cross">✘</span>');
        } else if (status === 'TODO') {
            dayElement.classList.add('todo');
            dayElement.insertAdjacentHTML('afterbegin', '<span class="empty-square">☐</span>');
        }
    }

    return dayElement;
}

function addMonthColumnIfNeeded(weekRow, date) {
    if (weekRow.children.length > 0 && !weekRow.querySelector('.month')) {
        const monthElement = document.createElement('div');
        monthElement.classList.add('month');
        monthElement.textContent = date.toLocaleString('en-US', { month: 'long' });
        weekRow.insertBefore(monthElement, weekRow.firstChild);
    }
}
