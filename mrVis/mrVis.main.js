$(function() {
  logLoader('bible_rawevents_modified.txt', 'disco', function(events) {
    var currentId = 0;
  
    // Render the log event table
    $('#log-lines thead').append($('<th/>').text('id'));
    $('#log-lines thead').append($($.map(Object.keys(events[0]), function(key) {
      return $('<th/>').text(key)[0];
    })));
    $('#log-lines tbody').append($($.map(events, renderLogLine)));
    
    // Init visualization
    initVisualization();
    
    // Run events when pressing a key
    runEvent(events[currentId], currentId);
    $(document).bind('keydown', 'j', function() {
      if (currentId < events.length - 1) {
        // Advance one step
        currentId++;
        runEvent(events[currentId], currentId);
      }
      return false;
    });
  });
});

function runEvent(event, id) {
  event.step = id;
  $('#log-lines .log-line').removeClass('current');
  $('#log-lines .log-line.id-'+id).addClass('current');
  $('#vis-container').data('currentEvent', event).trigger('event', [event]);
}

function renderLogLine(event, index) {
  if (typeof event != "object") return null;
  
  var task = (event.task) ? event.task.toString() : "";
  return $('<tr/>').addClass('log-line id-'+index).append(
    $('<td/>').addClass('id').text(index),
    $('<td/>').addClass('timestamp').text((new Date(event.timestamp)).toString('yyyy/M/d HH:mm:ss')),
    $('<td/>').addClass('node').text(event.node),
    $('<td/>').addClass('task').text(task),
    $('<td/>').addClass('type').text(event.type),
    $('<td/>').addClass('targetNode').text(event.targetNode || ""),
    $('<td/>').addClass('value').text(event.value || ""),
    $('<td/>').addClass('message').text(event.message)
  )[0];
}