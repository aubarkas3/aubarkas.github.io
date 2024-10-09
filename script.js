
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

function toggleRows(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    const viewMore = document.getElementById('viewMore' + tableId.slice(-1)); // Assumes IDs like 'myTable1', 'viewMore1'

    // Toggle the display of rows beyond the first four
    let showingMore = false;
    for (let i = 4; i < rows.length; i++) {
        if (rows[i].style.display === 'none' || rows[i].style.display === '') {
            rows[i].style.display = 'table-row';
            showingMore = true;
        } else {
            rows[i].style.display = 'none';
        }
    }

    // Update the text of the View More link
    viewMore.textContent = showingMore ? 'View Less..' : 'View More..';
}