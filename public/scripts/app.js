  // Client facing scripts here
$(document).ready(() => {

  $(function() {
    $("#sortable").sortable({
      containment: "body",
      revert: 100,
      update: function( event, ui ) {
        const options = document.getElementsByClassName('option');
        let rank = 1;
        let score = 3;
        for (const option in options) {
          const currElem = (options[option])
          if(currElem.classList && currElem.classList.contains('option')) {
            const inputName = $(currElem).find('input').attr('name');
            $(currElem).find('span').html(
              `${rank}
              <input type="hidden" name="${inputName}" value="${score}">`
            )
            rank++;
            score--;
            console.log($(currElem).find('span').html());
          }
        }
      }
    });
  });

});
