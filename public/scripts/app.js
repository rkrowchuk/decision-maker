  // Client facing scripts here
$(document).ready(() => {

  // Makes the options draggable and sortable.
  $(function() {
    $("#sortable").sortable({
      containment: "body",
      revert: 100,

      /* Upon the dropping of the grabbed option.
      This logic updates the visable rankings and input score values of the options. */
      update: function( event, ui ) {
        const options = document.getElementsByClassName('option');
        let rank = 1;
        let score = 3;

        for (const option in options) {
          const currElem = (options[option])

          if(currElem.classList && currElem.classList.contains('option') && !currElem.classList.contains('ui-sortable-placeholder')) {
            const inputName = $(currElem).find('input').attr('name');
            $(currElem).find('span').html(
              `${rank}
              <input type="hidden" name="${inputName}" value="${score}">`
            )
            rank++;
            score--;

            // Commented this console.log out for now, will be used to test if still working correctly if there are changes to the html
            // console.log($(currElem).find('span').html());
          }
        }
      }
    });
  });

});
