// Display a random fact in the footer as soon as possible
document.addEventListener('DOMContentLoaded', function() {
	fetch('json/facts.json')
		.then(res => res.json())
		.then(facts => {
			const idx = Math.floor(Math.random() * facts.length);
			document.getElementById('fact-footer').textContent = facts[idx];
		})
		.catch(() => {
			document.getElementById('fact-footer').textContent = 'Could not load fact.';
		});
});

