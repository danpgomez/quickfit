const workoutSelect = document.querySelector('#workout-select');
const addWorkoutBtn = document.querySelector('#add-workout-btn');
const removeWorkoutBtn = document.querySelector('#remove-workout-btn');
const searchInput = document.querySelector('#search-input');
const searchBtn = document.querySelector('#search-btn');
const clearSearch = document.querySelector('#clear-search');
const searchResults = document.querySelector('#search-results');
const workoutView = document.querySelector('#workout-view');
const printButton = document.querySelector('#print-button');

let workouts = {};
let currentWorkout = '';

function saveWorkouts() {
  localStorage.setItem('quickfit-workouts', JSON.stringify(workouts));
}

function loadWorkouts() {
  const saved = localStorage.getItem('quickfit-workouts');
  if (saved) {
    workouts = JSON.parse(saved);
    currentWorkout = Object.keys(workouts)[0];
    renderWorkoutOptions();
    renderWorkoutView();
  }
}

window.addEventListener('DOMContentLoaded', loadWorkouts);

function promptNewWorkout() {
  const name = prompt('Enter workout name:');
  if (!name) return;
  if (workouts[name]) return alert('Workout name already exists.');
  workouts[name] = [];
  currentWorkout = name;
  renderWorkoutOptions();
  renderWorkoutView();
  saveWorkouts();
}

function deleteWorkout() {
  if (!currentWorkout) return;
  delete workouts[currentWorkout];
  const names = Object.keys(workouts);
  
  if (names.length > 0) {
    currentWorkout = names[0];
  } else {
    currentWorkout = '';
  }
  renderWorkoutOptions();
  renderWorkoutView();
  saveWorkouts();
}

addWorkoutBtn.addEventListener('click', promptNewWorkout);
removeWorkoutBtn.addEventListener('click', deleteWorkout);
printButton.addEventListener('click', () => { window.print() });

function renderWorkoutOptions() {
  workoutSelect.innerHTML = '';
  Object.keys(workouts).forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    workoutSelect.appendChild(option);
  });
  workoutSelect.value = currentWorkout;
}

workoutSelect.addEventListener('change', (e) => {
  currentWorkout = e.target.value;
  renderWorkoutView();
});

searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim().toLowerCase();
  console.log(query);
  if (!query) return;
  fetchExercises(query);
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchResults.innerHTML = '';
});

async function fetchExercises(query) {
  searchResults.innerHTML = 'Loading...';
  try {
    const res = await fetch(`/.netlify/functions/searchExercises?query=${query}`);
    const data = await res.json();
    renderSearchResults(data);
  } catch (err) {
    console.error('Error fetching exercises:', err);
    searchResults.innerHTML = '<p>Something went wrong.</p>';
  }
}

function renderSearchResults(exercises) {
  searchResults.innerHTML = '';
  if (!exercises.length) {
    searchResults.innerHTML = '<p>No exercises found.</p>';
    return;
  }

  exercises.forEach(exercise => {
    const card = document.createElement('div');
    card.className = 'card';
    const exerciseName = capitalize(exercise.name);

    card.innerHTML = `
      <img src='${exercise.gifUrl}' alt='${exerciseName}' />
      <a href='https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)} exercise' target='_blank'>
  ▶️ Search YouTube
</a>
      <h3>${exerciseName}</h3>
      <p><strong>Target:</strong> ${capitalize(exercise.target)}</p>
      <p><strong>Equipment:</strong> ${capitalize(exercise.equipment)}</p>
      <p><strong>Instructions:</strong> ${exercise.instructions || 'N/A'}</p>
      <button class='add-exercise'>Add to ${currentWorkout}</button>
    `;

    const addButton = card.querySelector('.add-exercise');
    addButton.addEventListener('click', () => {
      if (!workouts[currentWorkout]) return;
      workouts[currentWorkout].push(exercise);
      renderWorkoutView();
      searchResults.innerHTML = '';
      searchInput.value = '';
      saveWorkouts();
    });

    searchResults.appendChild(card);
  });
}

function renderWorkoutView() {
  const list = workouts[currentWorkout];
  workoutView.innerHTML = '';
  if (!list || !list.length) {
    workoutView.innerHTML = '<p>No exercises yet.</p>';
    return;
  }

  list.forEach((exercise, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    const exerciseName = capitalize(exercise.name);

    card.innerHTML = `
      <img src='${exercise.gifUrl}' alt='${exerciseName}' />
      <a href='https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName)} exercise' target='_blank'>
        ▶️ Search YouTube</a>
      <h3>${exerciseName}</h3>
      <p><strong>Target:</strong> ${capitalize(exercise.target)}</p>
      <p><strong>Equipment:</strong> ${capitalize(exercise.equipment)}</p>
      <p><strong>Instructions:</strong> ${exercise.instructions || 'N/A'}</p>
      <button class='remove-exercise'>🗑️ Remove</button>
    `;

    const setDiv = document.createElement('div');
    setDiv.innerHTML = `
    <p class='set-log-fields'><strong>Set:</strong> 
        <input type='number' placeholder='Reps' style='width:60px;' /> reps @ 
        <input type='number' placeholder='Weight' style='width:60px;' /> lbs
    </p>
    `;
    card.appendChild(setDiv);


    const removeButton = card.querySelector('.remove-exercise');
    removeButton.addEventListener('click', () => {
      workouts[currentWorkout].splice(index, 1);
      renderWorkoutView();
      saveWorkouts();
    });

    workoutView.appendChild(card);
  });
}

function capitalize(str) {
    const words = str.split(' ');
    return words.map(word => {
      const firstChar = word[0].toUpperCase();
      const restOfWord = word.substring(1);
      return firstChar + restOfWord;
    }).join(' ');
} 
