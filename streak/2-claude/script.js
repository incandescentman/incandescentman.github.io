const container = document.getElementById('dayContainer');
let dayCount = 1;
let currentMonth = '';

function parseDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
}

function processOrgModeData(orgModeData) {
    const lines = orgModeData.trim().split('\n');

    lines.forEach(line => {
        if (line.startsWith('*')) {
            const [status, dateString] = line.slice(2).trim().split(' ');
            const date = parseDate(dateString.slice(1));
            const formattedDate = date.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            const monthName = date.toLocaleString('en-US', { month: 'long' });

            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            if (status === 'DONE') {
                dayElement.classList.add('completed');
                dayElement.innerHTML = `
                    <span class="checkmark">✔</span>
                    <p>Day ${dayCount}: ${formattedDate}</p>
                `;
            } else if (status === 'MISSED') {
                dayElement.classList.add('missed');
                dayElement.innerHTML = `
                    <span class="cross">✘</span>
                    <p>Day ${dayCount}: ${formattedDate}</p>
                `;
            } else {
                dayElement.classList.add('todo');
                dayElement.innerHTML = `
                    <span class="empty-square">☐</span>
                    <p>Day ${dayCount}: ${formattedDate}</p>
                `;
            }

            if (monthName !== currentMonth) {
                currentMonth = monthName;
                const monthElement = document.createElement('div');
                monthElement.classList.add('month');
                monthElement.textContent = currentMonth;
                container.appendChild(monthElement);
            }

            container.appendChild(dayElement);
            dayCount++;
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
