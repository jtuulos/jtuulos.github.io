jQuery.fn.reverse = function() {
  return this.pushStack(this.get().reverse(), arguments);
};

$(function() {
  var markerRadius = 15;
  
  $('#chart').bind('vis-ready', function() {    
    $('#chart svg').svg();
    
    $("#project-links a").fancybox({
  	  padding: 1,
  	  overlayOpacity: 0.8,
  	  overlayColor: '#000',
  	  showCloseButton: false,
  	  titlePosition: 'inside'
  	});
    
    $("#project-links a").reverse().each(function(i, elem) {
      if ($(elem).attr('date')) {
        var svgElem = $('#chart svg.y' + $(elem).attr('date').split('-')[0]),
          svg = svgElem.svg('get'),
          dateBox = $('#chart .d' + $(elem).attr('date')),
          posX = Number(dateBox.attr('x')) + Number(dateBox.attr('width')) / 2,
          posY = Number(dateBox.attr('y')) + Number(dateBox.attr('height')) / 2;

        var group = svg.group(svgElem.find('g'), {
          transform: 'translate('+ posX +' '+ posY +')',
          class: 'marker-wrapper'
        }),
          marker = svg.circle(group, 0, 0, markerRadius),
          labelWrap = svg.group(group, {
            transform: 'translate('+ (markerRadius + 15) +' '+ 0 +')',
            class: 'marker-label-wrapper',
            opacity: 0
          }),
          labelShadow = svg.text(labelWrap, 2, 2, $(elem).attr('name'), {
            textAnchor: 'start',
            alignmentBaseline: 'middle',
            class: 'marker-label shadow'
          }),
          label = svg.text(labelWrap, 0, 0, $(elem).attr('name'), {
            textAnchor: 'start',
            alignmentBaseline: 'middle',
            class: 'marker-label'
          });
        
        $(marker).addClass('marker').hover(highlight, unHighlight).click(function() {
          $(marker).addClass('visited');
          $(elem).click();
          unHighlight();
        });
      }
      
      function highlight() {
        $(marker).clearQueue().animate({svgR: markerRadius + 5}, 200);
        $(labelWrap).clearQueue().animate({opacity: 1}, 200);
      }
      function unHighlight() {
        $(marker).clearQueue().animate({svgR: markerRadius}, 200);
        $(labelWrap).clearQueue().animate({opacity: 0}, 200);
      }
    });
  });
  
  var markerToggle = $('#visualization .settings input#marker-toggle');
  $('#chart').toggleClass('markers', markerToggle.attr('checked'));
  markerToggle.click(function() {
    $('#chart').toggleClass('markers');
  });
});