document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");

    fetch('progress.org')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Fetched org-mode data:', data);
            processOrgModeData(data);
        })
        .catch(error => {
            console.error('Error fetching progress.org:', error);
        });
});

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

    lines.forEach((line, index) => {
        if (line.startsWith('*')) {
            const [status, dateString] = line.slice(2).trim().split(' ');
            const date = parseDate(dateString.slice(1, 11));
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

            if (monthName !== currentMonth) {
                currentMonth = monthName;
                const monthElement = document.createElement('div');
                monthElement.classList.add('month');
                monthElement.textContent = currentMonth;
                monthRow.appendChild(monthElement);
            }

            monthRow.appendChild(dayElement);
            dayCount++;

            if ((index + 1) % 7 === 0 || index === lines.length - 1) {
                if (container) {
                    container.appendChild(monthRow.cloneNode(true));
                }
                monthRow.innerHTML = '';
            }
        }
    });

    console.log('Processed org-mode data:', orgModeData);
    console.log('Generated HTML:', container ? container.innerHTML : 'Container not found');
}
