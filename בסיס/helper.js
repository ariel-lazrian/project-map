// findId(workoutEl) {
//     return this.#workouts.find(workout => workout.id === workoutEl.dataset.id);
//   }

//   findIdx(workoutEl) {
//     return this.#workouts
//       .map((workout, idx) => {
//         if (workout.id === workoutEl.dataset.id) {
//           return idx;
//         }
//       })
//       .filter(work => work !== undefined);
//   }
//   //problem here
//   findDatadx(data) {
//     return this.#dataWorkouts
//       .map((workout, idx) => {
//         if (
//           workout.latlng.lat === data.latlng.lat &&
//           workout.latlng.lng === data.latlng.lng
//         ) {
//           return idx;
//         }
//       })
//       .filter(work => work !== undefined);
//   }

//   findMarker(workoutCoords) {
//     return this.#markerArray
//       .map(marker => {
//         const { lat, lng } = marker._latlng;
//         if (lat === workoutCoords.lat && lng === workoutCoords.lng) {
//           return marker;
//         }
//       })
//       .filter(work => work !== undefined);
//   }
//   findDataWorkout(workoutCoords) {
//     return this.#dataWorkouts
//       .map(marker => {
//         if (
//           marker.latlng.lat === workoutCoords[0] &&
//           marker.latlng.lng === workoutCoords[1]
//         ) {
//           return marker;
//         }
//       })
//       .filter(marker => marker !== undefined);
//   }

//   findMarkerIdx(value, coords) {
//     const ArrayIdx = value
//       .map((marker, idx) => {
//         const condition =
//           marker._latlng === undefined ? marker.latlng : marker._latlng;
//         return coords.map(coordsMarker => {
//           const conditionComparing =
//             condition.lat === coordsMarker._latlng.lat &&
//             condition.lng === coordsMarker._latlng.lng;
//           if (conditionComparing) {
//             console.log(idx);
//             return idx;
//           }
//         });
//       })
//       .filter(idx => idx !== undefined);

//     return parseInt(ArrayIdx);
//   }