document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('dayContainer');
    const outlines = document.querySelectorAll('.outline-2');
    let row, monthCell, currentMonth;

    outlines.forEach((outline, index) => {
        const timestamp = outline.querySelector('.timestamp-wrapper .timestamp').textContent.trim();
        const status = outline.querySelector('.done') ? 'DONE' : (outline.querySelector('.todo') ? 'TODO' : '');
        const dateParts = timestamp.split(' ');
        const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        const date = new Date(dateStr);
        const day = date.getDate();
        const dayName = date.toLocaleString('en-US', { weekday: 'short' });
        const monthName = date.toLocaleString('en-US', { month: 'short' });

        if (index % 7 === 0) {
            if (row) container.appendChild(row);
            row = document.createElement('div');
            row.classList.add('flex', 'items-center', 'w-full');

            // Only update the currentMonth if it changes
            if (currentMonth !== monthName) {
                currentMonth = monthName;
            }

            monthCell = document.createElement('div');
            monthCell.classList.add('flex', 'items-center', 'justify-center', 'p-4', 'bg-blue-100', 'font-bold', 'w-1/8');
            monthCell.textContent = currentMonth;
            row.appendChild(monthCell);
        }

        const dayCell = document.createElement('div');
        dayCell.classList.add('flex', 'items-center', 'justify-center', 'p-4', 'bg-gray-200', 'w-1/8');
        if (status) {
            dayCell.classList.add(status === 'DONE' ? 'bg-green-200' : 'bg-yellow-200');
        }
        dayCell.textContent = `${dayName} ${day}`;
        row.appendChild(dayCell);
    });

    if (row) container.appendChild(row);
});
