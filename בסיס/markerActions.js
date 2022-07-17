
// moveToPopup(e) {
//     const workoutEl = e.target.closest('.workout');
//     if (!workoutEl) return;

//     const workout = this.findId(workoutEl);
//     this.#map.setView(workout.coords, this.#mapZoomLevel, {
//       animate: true,
//       pan: {
//         duration: 1,
//       },
//     });
//   };
//   //cant remove something that doesnt exist because that it will create in the renderwourkutmarker
//   removeWorkout(e) {
//     const workoutEl = e.target.closest('.workout');
//     const workoutIdx = this.findIdx(workoutEl);
//     const workout = this.findId(workoutEl);

//     const workoutsObject = JSON.parse(localStorage.getItem('workouts'));
//     workoutsObject.splice(...workoutIdx, 1);

//     localStorage.setItem('workouts', JSON.stringify(workoutsObject));
//     this.#workouts = workoutsObject;

//     workoutEl.remove();

//     this.removeMarker(workout.coords);

//     this.removeDataWorkout(workout);
//     this.conditionForIconRemove();

//   //   const set = new Set();
//   //   const unique = this.#markerArray.filter(item => {
//   //     const alreadyHas = set.has(item._latlng);
//   //     set.add(item._latlng);
//   //     return !alreadyHas;
//   //   });
//   //   //remove the idx from the #this.makerArray
//   //   const idxUnquie = this.findMarkerIdx(unique, this.#updatedMarkerEdit);
//   // this.#markerArray.splice(idxUnquie, 1);
  
//   //   this.#map.clearLayers()
//     // this.#markerArray = unique;

//     //try find another way (2)
//     this.#workoutedit = undefined;
//   };

//   editWorkout(e) {
//     // this.approveEditMessage()

//     this.#map.off('click');

//     this.resetAllEdit();
//     const workoutEl = e.target.closest('.workout');
//     workoutEl.classList.add('edit-color');
//     const workout = this.findId(workoutEl);

//     inputType.value = workout.type;

//     this.hiddenInputType();

//     const typeWorkout = workout.type;

//     const typeCondition =
//       workout.type === 'running' ? workout.cadence : workout.elevationGain;
//     const { duration, distance } = workout;
//     this.#dataWorkouts.map(workoutCoords => {
//       const { coords } = workout;
//       const [Lat, Lng] = [...coords];

//       const { lat, lng } = workoutCoords.latlng;
//       if (lat === Lat && lng === Lng) {
//         this.hideIcon(workoutEl);
//         this.editForm(typeWorkout, duration, distance, typeCondition);
//         this.__showForm(workoutCoords);

//         const currentMarker = this.findMarker(workoutCoords.latlng);

//         const findDataWorkout = this.findDataWorkout(coords);

//         this.#map.on('click', e => {
//           this.approveEditMessage(findDataWorkout, e, currentMarker, workout);
//         });

//         //  this.#map.off('click');
//         //  map.style.zIndex = -5;
//         //try find another way (1)
//         //dont remove it because all the progrem depend on it
//         this.#workoutedit = e;
//       }

//     });
// }

// CancelOperation(e) {
//     e.preventDefault();
//     this._hideForm();

//     if (this.#workoutedit !== undefined) {
//       const workoutEl = this.#workoutedit.target.closest('.workout');
//       this.removeHideIcon(workoutEl);
//       workoutEl.classList.remove('edit-color');
//     }

//     // this.#map.on('click',this.__showForm.bind(this))

//     this.#workoutedit = undefined;
//   }
