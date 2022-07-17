'use strict';

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    //prettier-ignore
    const months = ['January','February', 'March', 'April', 'May','June','July','August',
    'September','October','November','December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = `running`;
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    //this.type = 'running'
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = `cycling`;
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    //this.type = 'cycling'
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);

//////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');

const iconRemoveAll = document.querySelector('.workouts-remove-all');

const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const formBtnOk = document.querySelector('.form__btn-ok');
const formBtnCancel = document.querySelector('.form__btn-cancel');
const cancelPopUp = document.querySelector('.leaflet-popup-content-wrapper');
const map = document.querySelector('#map');

//run only once in the begining
class App {
  #value = 1;
  #map;
  #mapCurrentZoom = 13;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  #dataWorkouts = [];
  #markerArray = [];
  //0 find another solution
  #workoutedit;
  #updatedMarkerEdit;

  constructor() {
    this.workout;

    //Get user's position
    this._getPosition();

    //get Data from local storage
    this._getLocalStorage();

    containerWorkouts.addEventListener(
      'click',
      this._workoutActions.bind(this)
    );

    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);

    iconRemoveAll.addEventListener('click', this.reset);

    formBtnCancel.addEventListener('click', this.CancelOperation.bind(this));

    map.addEventListener('click', this.moveToWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
  }

  //this is where we will then render the markers (3)
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map', {}).setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //SHOW FORM SEE HERE
    // console.log(this);

    this.#map.on('click', this.__showForm.bind(this));

    this.#map.on('zoomanim', e => {
      this.#mapCurrentZoom = e.zoom;
    });

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  __showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
    inputDistance.value = inputDuration.value = inputElevation.value = 2;

    inputCadence.value = this.#value;
    this.#value++;
  }

  _hideForm() {
    this.#map.off('click');
    this.#map.on('click', this.__showForm.bind(this));
    //empty inputs
    //prettier-ignore
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      2;
    inputType.value = 'running';
    this.hiddenInputType();

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = `grid`), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //this will run every time a new workout will start
  _newWorkout(e) {
    //find another way (4);
    if (this.#workoutedit !== undefined) {
      this.removeWorkout(this.#workoutedit);
    }

    if (this.#updatedMarkerEdit !== undefined) {
      this.#updatedMarkerEdit.forEach(marker => {
        this.removeMarker(marker);
      });
      this.#updatedMarkerEdit = undefined;
    }

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    //important to uncerstand why it is creating inside the location that i click

    let workout;
    const { lat, lng } = this.#mapEvent.latlng;
    // if tactivity running, create runnning object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //if activity cycling create cycle object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add new object to workout array

    this.#workouts.push(workout);

    this.#dataWorkouts.push({ latlng: this.#mapEvent.latlng });
    this._renderWorkoutMarker(workout);

    const uinqueyDataWorkout = this.#dataWorkouts.filter(
      (thing, index, self) =>
        index === self.findIndex(t => t.latlng === thing.latlng)
    );
    this.#dataWorkouts = uinqueyDataWorkout;

    this._renderWorkout(workout);

    //hide form + clear input fields
    this._hideForm();

    //set local storage to all workouts
    this._setLocalStorage();
  }
  //problem here
  _renderWorkoutMarker(workout) {
    const marker = this.addMarker(workout, workout.coords);
    this.#markerArray.push(marker);
    // this.#map.clearLayers()
  }
  _renderWorkout(workout) {
    iconRemoveAll.classList.remove('hidden');
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <i class='fa fa-trash workout-remove'></i>
        <i class="fa fa-edit workout-edit"></i> 
        <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>

          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          `;
    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> 
        `;
    // form.append(html)
    form.insertAdjacentHTML('afterend', html);
  }

  _workoutActions(e) {
    if (
      e.target.className !== 'fa fa-trash workout-remove' &&
      e.target.className !== 'fa fa-edit workout-edit'
    ) {
      this.moveToPopup(e);
    } else if (e.target.className === 'fa fa-trash workout-remove') {
      this.removeWorkout(e);
    } else if (e.target.className === 'fa fa-edit workout-edit') {
      this.editWorkout(e);
    }
  }

  _setLocalStorage() {
    // this.#dataWorkouts.forEach((workout)=>{
    //   localStorage.setItem('workoutData', JSON.stringify(workout.latlng) )
    // })
    localStorage.setItem('workoutData', JSON.stringify(this.#dataWorkouts));
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    // localStorage.setItem('markers', JSON.stringify(this.#markerArray))
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    const workoutCoords = JSON.parse(localStorage.getItem('workoutData'));
    if (!workoutCoords) return;
    if (!data) return;

    this.#dataWorkouts = workoutCoords;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
  moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.findWorkout(workoutEl);
    this.#map.setView(workout.coords, this.#mapCurrentZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  moveToWorkout(e) {
    if (form.classList.contains('hidden')) {
      this.removeColor();
      if (e.target.classList.contains('leaflet-marker-icon')) {
        const marker = this.findMarkerIconId(e);
        const workout = this.findWorkoutLayers(marker);
        const workoutEl = this.findWorkoutEl(workout);
        workoutEl.classList.toggle('edit-color');
      }
    }
  }
  //cant remove something that doesnt exist because that it will create in the renderwourkutmarker
  removeWorkout(e) {
    const workoutEl = e.target.closest('.workout');
    const workoutIdx = this.findWorkoutIdx(workoutEl);
    const workout = this.findWorkout(workoutEl);

    const workoutsObject = JSON.parse(localStorage.getItem('workouts'));
    workoutsObject.splice(...workoutIdx, 1);

    localStorage.setItem('workouts', JSON.stringify(workoutsObject));
    this.#workouts = workoutsObject;

    workoutEl.remove();

    this.removeMarker(workout);

    this.removeDataWorkout(workout);
    this.conditionForIconRemove();

    //try find another way (2)
    this.#workoutedit = undefined;
  }

  editWorkout(e) {
    this.#map.off('click');

    this.resetAllEdit();
    const workoutEl = e.target.closest('.workout');
    workoutEl.classList.add('edit-color');
    const workout = this.findWorkout(workoutEl);

    inputType.value = workout.type;

    this.hiddenInputType();

    const typeWorkout = workout.type;

    const typeCondition =
      workout.type === 'running' ? workout.cadence : workout.elevationGain;
    const { duration, distance } = workout;

    this.#dataWorkouts.map(workoutCoords => {
      const { coords } = workout;
      const [Lat, Lng] = [...coords];

      const { lat, lng } = workoutCoords.latlng;
      if (lat === Lat && lng === Lng) {
        this.hideIcon(workoutEl);
        this.editForm(typeWorkout, duration, distance, typeCondition);
        this.__showForm(workoutCoords);

        const currentMarker = this.findMarker(workoutCoords.latlng);

        const findDataWorkout = this.findDataWorkout(coords);

        this.#map.on('click', e => {
          this.approveEditMessage(findDataWorkout, e, currentMarker, workout);
        });

        //try find another way (1)
        //dont remove it because all the progrem depend on it
        this.#workoutedit = e;
      }
    });
  }

  CancelOperation(e) {
    e.preventDefault();
    this._hideForm();

    if (this.#workoutedit !== undefined) {
      const workoutEl = this.#workoutedit.target.closest('.workout');

      this.removeHideIcon(workoutEl);
      workoutEl.classList.remove('edit-color');

      // if (this.#updatedMarkerEdit !== undefined) {
      //   const markerCoords = this.#updatedMarkerEdit
      //     .map(markerCoords => {
      //       return [markerCoords._latlng.lat, markerCoords._latlng.lng];
      //     })
      //     .flat(1);

      //   const workout = this.findWorkout(workoutEl);
      //   workout.coords = markerCoords;
      //   console.log(this.#workouts);
      //   console.log(this.#dataWorkouts);
      // }
    }

    this.#workoutedit = undefined;
  }

  //problem with cancel that it is adding until i click ok and all of them show in the screen
  //every cancel
  approveEditMessage(workoutCoords, e, currentMarker) {
    map.style.zIndex = -5;

    //prettier-ignore
    document.querySelector(".approve-edit-message").classList.add("show-message-edit");

    document.querySelector('.edit-cancel').addEventListener(
      'click',
      () => {
        document
          .querySelector('.approve-edit-message')
          .classList.remove('show-message-edit');
        // this.__showForm(workoutCoords);
        map.style.zIndex = 0;

        //find another solution for it
        e = '';
      },
      { once: true }
    );

    document.querySelector('.edit-ok').addEventListener(
      'click',
      () => {
        if (!e) return;

        //prettier-ignore
        document.querySelector('.approve-edit-message')
       .classList.remove('show-message-edit');
        map.style.zIndex = 0;

        workoutCoords.map(marker => {
          return (marker.latlng = e.latlng);
        });

        const marker = currentMarker.map(marker => {
          return marker.setLatLng(e.latlng);
        });
        this.#updatedMarkerEdit = marker;
      },
      { once: true }
    );
  }

  removeMarker(workoutCoords) {
    const workouTCondition =
      workoutCoords.coords === undefined
        ? [workoutCoords._latlng.lat, workoutCoords._latlng.lng]
        : workoutCoords.coords;

    return this.#markerArray
      .map((marker, idx) => {
        const { lat, lng } = marker._latlng;
        if (lat === workouTCondition[0] && lng === workouTCondition[1]) {
          this.#markerArray.splice(idx, 1);
          this.#map.removeLayer(marker);
        }
      })
      .filter(work => work !== undefined);
  }

  addMarker(workout, coords) {
    let marker = new L.marker(coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          closeButon: false,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      // setPopupContent
      .bindPopup(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
    return marker;
  }

  removeDataWorkout(workout) {
    const dataWorkoutsCoords = JSON.parse(localStorage.getItem('workoutData'));

    this.#dataWorkouts.forEach(data => {
      const [Lat, Lng] = workout.coords;
      const { lat, lng } = data.latlng;

      if (lat === Lat && lng === Lng) {
        const idx = this.findDataIdx(data);
        dataWorkoutsCoords.splice(idx, 1);

        localStorage.setItem('workoutData', JSON.stringify(dataWorkoutsCoords));
        this.#dataWorkouts = dataWorkoutsCoords;
      }
    });
  }
  editForm(type, Duration, Distance, elevationField) {
    inputDistance.value = Distance;
    inputDuration.value = Duration;

    type === 'running'
      ? (inputCadence.value = elevationField)
      : (inputElevation.value = elevationField);

    inputType.value = type;
  }
  reset() {
    localStorage.removeItem('workouts');
    localStorage.removeItem('workoutData');
    location.reload();
  }
  findWorkout(workoutEl) {
    return this.#workouts.find(workout => workout.id === workoutEl.dataset.id);
  }
  findWorkoutEl(workout) {
    if (workout.id === undefined) return;
    return Array(...containerWorkouts.children).find(
      workoutEl => workout.id === workoutEl.dataset.id
    );
  }
  findWorkoutLayers(marker) {
    return this.#workouts.find(
      workout =>
        workout.coords[0] === marker._latlng.lat &&
        workout.coords[1] === marker._latlng.lng
    );
  }
  findMarkerIconId(e) {
    return this.#markerArray.find(marker => e.target === marker._icon);
  }

  findWorkoutIdx(workoutEl) {
    return this.#workouts
      .map((workout, idx) => {
        if (workout.id === workoutEl.dataset.id) {
          return idx;
        }
      })
      .filter(work => work !== undefined);
  }
  //problem here
  findDataIdx(data) {
    return this.#dataWorkouts
      .map((workout, idx) => {
        if (
          workout.latlng.lat === data.latlng.lat &&
          workout.latlng.lng === data.latlng.lng
        ) {
          return idx;
        }
      })
      .filter(work => work !== undefined);
  }

  findMarker(workoutCoords) {
    return this.#markerArray
      .map(marker => {
        const { lat, lng } = marker._latlng;
        if (lat === workoutCoords.lat && lng === workoutCoords.lng) {
          return marker;
        }
      })
      .filter(work => work !== undefined);
  }
  findDataWorkout(workoutCoords) {
    return this.#dataWorkouts
      .map(marker => {
        if (
          marker.latlng.lat === workoutCoords[0] &&
          marker.latlng.lng === workoutCoords[1]
        ) {
          return marker;
        }
      })
      .filter(marker => marker !== undefined);
  }

  findMarkerIdx(value, coords) {
    const ArrayIdx = value
      .map((marker, idx) => {
        const condition =
          marker._latlng === undefined ? marker.latlng : marker._latlng;
        return coords.map(coordsMarker => {
          const conditionComparing =
            condition.lat === coordsMarker._latlng.lat &&
            condition.lng === coordsMarker._latlng.lng;
          if (conditionComparing) {
            return idx;
          }
        });
      })
      .filter(idx => idx !== undefined);

    return parseInt(ArrayIdx);
  }

  hiddenInputType() {
    if (inputType.value === 'running') {
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
      //prettier-ignore
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
    } else {
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      //prettier-ignore
      inputElevation.closest('.form__row').classList.remove('form__row--hidden');
    }
  }
  removeColor() {
    Array(...containerWorkouts.children).forEach(html => {
      if (html.classList.contains('workout')) {
        html.classList.remove('edit-color');
      }
    });
  }
  resetAllEdit() {
    this.removeColor();
    Array(...containerWorkouts.children).forEach(html => {
      if (html.classList.contains('workout')) {
        this.removeHideIcon(html);
      }
    });
  }

  hideIcon(workoutEl) {
    Array(...workoutEl.children).forEach(html => {
      if (html.classList.contains('workout-remove')) {
        html.classList.add('hidden');
      }
    });
  }
  removeHideIcon(workoutEl) {
    Array(...workoutEl.children).forEach(html => {
      if (html.classList.contains('workout-remove')) {
        html.classList.remove('hidden');
      }
    });
  }
  conditionForIconRemove() {
    const conditionForNotExistingWorkout = Array(
      ...containerWorkouts.children
    ).every(html => html.classList.contains('workout') == false);

    if (conditionForNotExistingWorkout === true) {
      iconRemoveAll.classList.add('hidden');
    }
  }
}

//Acess to app and reset method for removing all the activities
//app.reset();
const app = new App();

//how to improve the application
// ability to edit a workout
//ability to delete a workout
//ability to delete all workouts

//ability to sort workouts by a certian field
// re-build running and cycling objects coming from local storage
//another nice touch that you could use to this application is to create more realistic error messages and confirmation messages

//
//very hard
//ability to position the map to show all workouts
//so lets say that you went to a different country and did some workouts
//and so your workous are all over the map and so therefore it would be nice to have a button which shows all the workouts on the map at once

//ability to draw lines and shapes instead of just points

//fix problem
//when i click cancel after edit the location of the marker and after click on the ok and cancel the operatoion

//trying
// approveEditMessage(e) {
//   //prettier-ignore
//   document.querySelector(".approve-edit-message").classList.add("show-message-edit");

//   document.querySelector('.edit-ok').addEventListener('click', () => {
//     this.#map.on('click', () => {
//       document
//         .querySelector('.approve-edit-message')
//         .classList.remove('show-message-edit');
//     });
//   });

//   document.querySelector('.edit-cancel').addEventListener('click', () => {
//     document
//       .querySelector('.approve-edit-message')
//       .classList.remove('show-message-edit');
//   });

// }
// let lastWorkoutCoords = workout.coords;

// this.changeMarkerPlace(workout, lastWorkoutCoords, coords);

// this.#workouts.map(workout => {
//   if (workout.coords === lastWorkoutCoords) {
//     workout.coords = coords;

//     return workout;
//   } else {
//     return workout;
//   }
// });
//fix the editing if i dont fill all the inputs so it will remove the input and i can get it back by clicking the submit
//problem
//work only once on every marker so if i change location for marker once it wont work more
//so meaning that even when i will change the workout edit, it will still be only once for every marker
//meaning if i change location for marker once, and do submit , i cant change this workout marker location anymore
//first fix the problem on submit that wont remove the marker workout that i have changed in the fisst run

//to fix the problem i need to find way to combine the old one with the new one
//so it will update it

// first try
// const ArrayDataWorkout = this.#markerArray.filter(
//   (thing, index, self) =>
//     index === self.findIndex(t => t._latlng === thing._latlng)
// );

//first example
// if (this.#updatedMarkerEdit !== undefined) {
//   this.#updatedMarkerEdit.forEach(marker => {
//     // console.log(marker);
//     // const newFilter = this.#markerArray.filter(
//     //   marker2 => marker2._latlng === marker._latlng
//     // );
//     const newFilter = this.#markerArray.map(marker2 => {
//       if (marker2._latlng === marker._latlng) {
//         console.log(marker2);
//       }
//     });
//     // const notNewFilter = this.#markerArray.filter(
//     //   marker2 => marker2._latlng !== marker._latlng
//     // );
//     // console.log(notNewFilter);
//     // console.log(newFilter);
//     // newFilter.map(marker => {
//     //   const condition = marker._popup._container.className.includes(
//     //     workout.type
//     //   );
//     //   console.log(marker._popup._container.className);
//     // });
//   });
// }
//second exapme
// if (this.#updatedMarkerEdit !== undefined) {
//   const newArray = this.#markerArray
//     .map(marker => {
//       return this.#updatedMarkerEdit.map(marker2 => {
//         if (
//           marker2._latlng.lat === marker._latlng.lat &&
//           marker2._latlng.lng === marker._latlng.lng
//         ) {
//           const condition = marker._popup._container.className.includes(
//             workout.type
//           );
//           if (condition) {
//             return marker;
//           }
//         } else {
//           return marker;
//         }
//       });
//     })
//     .filter(marker => marker !== undefined)
//     .flat(1);
//
//   this.#markerArray = newArray;
// }

// clearLayers() remove all the layers

// const uniquePersons = this.#markerArray.filter(
//   (m, index, ms) => getFirstIndex(ms, m) === index);

// function getFirstIndex(arr, value) {
//   return arr.findIndex(
//     (a) => a._latlng === value._latlng);
// }
// console.log(uniquePersons);
// const unquieArr = [
//   ...new Set(this.#dataWorkouts.map(marker => marker.latlng)),
// ];
//render workout on list
// const unquieArr = [
//   ...new Set(this.#markerArray.map(marker => marker._latlng)),
// ];
// L.marker([lat, lng])

// if (this.#updatedMarkerEdit !== undefined) {
//   this.#updatedMarkerEdit.map(marker => {
//     workout.coords[0] = marker._latlng.lat;
//     workout.coords[1] = marker._latlng.lng;
//     console.log(this.#dataWorkouts);
//   });
//   this.#updatedMarkerEdit = undefined;
// }
// if (this.#updatedMarkerEdit !== undefined) {
//   const newArray = this.#markerArray
//     .map((marker, idx) => {
//       this.#updatedMarkerEdit.map(marker2 => {
//         if (
//           marker2._latlng.lat === marker._latlng.lat &&
//           marker2._latlng.lng === marker._latlng.lng
//         ) {
//           if (idx === idxUnquie) {
//             return;
//           }
//         } else {
//           return marker;
//         }
//       });
//     })
//     .filter(marker => marker != undefined);
// }
// const set = new Set();
// const unique = this.#markerArray.filter(item => {
//   const alreadyHas = set.has(item._latlng);
//   set.add(item._latlng);
//   return !alreadyHas;
// });
// const set = new Set();
// const unique = this.#markerArray.filter(item => {
//   const alreadyHas = set.has(item._latlng);
//   set.add(item._latlng);
//   return !alreadyHas;
// });
// //remove the idx from the #this.makerArray
// console.log(this.#markerArray);
// const idxUnquie = this.findMarkerIdx(unique, this.#updatedMarkerEdit);

// const marker = this.#markerArray.splice(idxUnquie, 1);

// marker.forEach(marker => {

//   this.#map.removeLayer(marker);
// });

// this.#markerArray = unique;

// this.#markerArray.clearLayers();
// this.#map.clearLayers()

// const uniqueBarker = marker.filter(
//   (thing, index, self) =>
//     index === self.findIndex(t => t.latlng === thing.latlng)
// );

// console.log(workoutCoords);
// let lastWorkoutCoords = workout.coords;
// this.changeMarkerPlace(workout, lastWorkoutCoords, coords);
// this.#map.off('click');
//   const typeCondition =
//   workout.type === 'running' ? workout.cadence : workout.elevationGain;
// const { duration, distance } = workout;
// const typeWorkout = workout.type;
