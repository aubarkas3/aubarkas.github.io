
function handleSearch(event) {
    event.preventDefault(); // Prevents the form from actually submitting
    alert('Looking for your event'); // Displays the alert message
}
document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = this.href; // or other tracking functionality
    });
});

function toggleRows() {
    const rows = document.querySelectorAll('#myTable tbody tr');
    const viewMore = document.getElementById('viewMore');
    if (rows[4].style.display === 'none' || rows[4].style.display === '') {
        for (let i = 4; i < rows.length; i++) {
            rows[i].style.display = 'table-row';
        }
        viewMore.textContent = 'View Less..';
    } else {
        for (let i = 4; i < rows.length; i++) {
            rows[i].style.display = 'none';
        }
        viewMore.textContent = 'View More..';
    }
}