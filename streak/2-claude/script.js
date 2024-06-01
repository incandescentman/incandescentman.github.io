const container = document.getElementById('dayContainer');
let dayCount = 1;
let currentMonth = '';

function parseDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
}

function processOrgModeData(orgModeData) {
    const lines = orgModeData.trim().split('\n');
    const monthRow = document.createElement('div');
    monthRow.classList.add('month-row');
    let daysInWeek = 0;

    lines.forEach((line, index) => {
        if (line.startsWith('*')) {
            const [status, dateString] = line.slice(2).trim().split(' ');
            const date = parseDate(dateString.slice(1));
            const monthName = date.toLocaleString('en-US', { month: 'short' });
            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });

            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            if (status === 'DONE') {
                dayElement.classList.add('completed');
                dayElement.innerHTML = `
                    <span class="checkmark">✔</span>
                    <p>Day ${dayCount}: ${dayOfWeek}</p>
                `;
            } else if (status === 'MISSED') {
                dayElement.classList.add('missed');
                dayElement.innerHTML = `
                    <span class="cross">✘</span>
                    <p>Day ${dayCount}: ${dayOfWeek}</p>
                `;
            } else {
                dayElement.classList.add('todo');
                dayElement.innerHTML = `
                    <span class="empty-square">☐</span>
                    <p>Day ${dayCount}: ${dayOfWeek}</p>
                `;
            }

            monthRow.appendChild(dayElement);
            dayCount++;
            daysInWeek++;

            if (daysInWeek === 7 || index === lines.length - 1) {
                if (monthName !== currentMonth) {
                    currentMonth = monthName;
                    const monthElement = document.createElement('div');
                    monthElement.classList.add('month');
                    monthElement.textContent = currentMonth;
                    monthRow.appendChild(monthElement);
                }
                container.appendChild(monthRow.cloneNode(true));
                monthRow.innerHTML = '';
                daysInWeek = 0;
            }
        }
    });
}

fetch('progress.org')
    .then(response => response.text())
    .then(data => {
        processOrgModeData(data);
    })
    .catch(error => {
        console.error('Error fetching progress.org:', error);
    });
