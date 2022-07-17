


    // approveEditMessage(workoutCoords, e, currentMarker, workout) {
    //     map.style.zIndex = -5;
    
    //     //prettier-ignore
    //     document.querySelector(".approve-edit-message").classList.add("show-message-edit");
    
    //     document.querySelector('.edit-cancel').addEventListener(
    //       'click',
    //       () => {
    //         console.log({e});
    //         document
    //           .querySelector('.approve-edit-message')
    //           .classList.remove('show-message-edit');
    //         // this.__showForm(workoutCoords);
    //         map.style.zIndex = 0;
    //         //find another solution for it
    //         e = '';
    //       },
    //       { once: true }
    //     );
    
    //     document.querySelector('.edit-ok').addEventListener(
    //       'click',
    //       () => {
    //       console.log({e});
    //       const idx= this.#markerArray.findIndex(marker=> marker._latlng===currentMarker._latlng )
    //       console.log({workout});
    //     //  const newMarker= this.addMarker(workout,e)
    //      console.log({newMarker});
    //       this.#markerArray.splice(idx,1,)
    //         if (!e) return;
    
    //         //prettier-ignore
    //         document.querySelector('.approve-edit-message')
    //        .classList.remove('show-message-edit');
    //         map.style.zIndex = 0;
    
    //         workoutCoords.map(marker => {
    //           return (marker.latlng = e.latlng);
    //         });
    
    //         const marker = currentMarker.map(marker => {
    //           return marker.setLatLng(e.latlng);
    //         });
    
    //         const uniqueBarker = marker.filter(
    //           (thing, index, self) =>
    //             index === self.findIndex(t => t.latlng === thing.latlng)
    //         );
    
    //         // console.log(workoutCoords);
    //         // let lastWorkoutCoords = workout.coords;
    //         // this.changeMarkerPlace(workout, lastWorkoutCoords, coords);
    
    //         this.#updatedMarkerEdit = uniqueBarker;
    //       },
    //       { once: true }
    //     );
    //   }

    
    //   removeMarker(workoutCoords) {
    //     return this.#markerArray
    //       .map((marker, idx) => {
    //         const { lat, lng } = marker._latlng;
    //         if (lat === workoutCoords[0] && lng === workoutCoords[1]) {
    //           this.#markerArray.splice(idx, 1);
    //           console.log(marker);
    //           this.#map.removeLayer(marker);
    //         }
    //       })
    //       .filter(work => work !== undefined);
    //   }
    
    //   addMarker(workout, markerCoords) {
    //     let marker = markerCoords
    //       .addTo(this.#map)
    //       .bindPopup(
    //         L.popup({
    //           maxWidth: 250,
    //           minWidth: 100,
    //           autoClose: false,
    //           closeOnClick: false,
    //           className: `${workout.type}-popup`,
    //         })
    //       )
    //       .setPopupContent(
    //         `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
    //       )
    //       .openPopup();
    //     return marker;
    //   }

