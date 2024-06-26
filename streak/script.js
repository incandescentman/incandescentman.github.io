document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dayContainer');
    if (!container) {
        console.error("Container element not found!");
        return;
    }

    fetch('progress.org')
        .then(response => response.text())
        .then(data => processOrgModeData(data, container))
        .catch(error => console.error('Error fetching progress.org:', error));
});

function processOrgModeData(orgModeData, container) {
    const lines = orgModeData.trim().split('\n').filter(line => line.startsWith('*'));
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    let currentRow;
    let dayCount = 0;

    lines.forEach((line, index) => {
        if (dayCount % 7 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'grid grid-cols-8 gap-4';
            container.appendChild(currentRow);
        }

        const dayElement = document.createElement('div');
        dayElement.className = 'p-4 border rounded';

        const dateMatch = line.match(/<(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
            const date = new Date(dateMatch[1]);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            dayElement.innerHTML = `
                <p class="text-sm text-gray-500">${formattedDate}</p>
                <p class="font-bold">Day ${dayCount + 1}</p>
            `;

            if (line.includes("DONE")) {
                dayElement.classList.add('bg-green-200');
            } else if (line.includes("MISSED")) {
                dayElement.classList.add('bg-red-200');
            } else if (line.includes("TODO")) {
                dayElement.classList.add('bg-yellow-200');
            }

            currentRow.appendChild(dayElement);
            dayCount++;

            if (dayCount % 7 === 0 || index === lines.length - 1) {
                const monthElement = document.createElement('div');
                monthElement.className = 'p-4 border rounded bg-blue-100 flex items-center justify-center';
                monthElement.textContent = monthNames[date.getMonth()];
                currentRow.appendChild(monthElement);
            }
        }
    });
}
