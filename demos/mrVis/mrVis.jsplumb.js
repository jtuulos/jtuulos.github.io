function initVisualization() {
  $('#vis-container').bind('event', handleVisEvent);
  
  $(window).resize(function() {
    controlPlumb.repaintEverything();
    dataPlumb.repaintEverything();
  });
  
  /*
  setTimeout(function() {
      jsPlumb.animate($('#node02'), {'left': '300'}, {duration:200});
    }, 2000);
  */
}

function handleVisEvent(e, event) {
  // Set the log message
  $('#vis-log').text(event.message);
  // Find the main node of the event
  var eventNode = (event.node != "master") ? $('#node-'+event.task.type+'-'+event.task.id) : $('#node-master-0');
  // Clear all control paths
  controlPlumb.reset();
  
  // Special handling for events
  switch(event.type) {
    case "job-initialize":
      $('#vis-master').show();
      $('#vis-master').append(renderMachine("master", { type:"master", id: 0 }));
      break;
    case "job-start":
      $('#node-master-0 .status').text('Job started');
      $('#node-master-0').addClass('running');
      $('#vis-input').show();
      $('#vis-input .nodes').append(renderFile("input", 0));
      break;
    case "phase-map-start":
      $('#vis-map').show();
      $('#node-master-0 .status').text('Map phase');
      break;
    case "task-assign":
      $('#vis-'+ event.task.type +' .nodes').append(renderMachine(event.targetNode, event.task));
      createConnection({
        source: { type: "master", id: 0 },
        target: event.task,
        label: "assign " + event.task.toString()
      });
      break;
    case "task-receive":
      if (event.task.type == "map") {
        createConnection({
          source: { type: "input", id: 0 },
          target: event.task,
          label: "read",
          data: true
        });
      } else {
        $('#vis-inter .node').each(function(i, node) {
          createConnection({
            source: { type: "inter", id: $(node).data('file-id') },
            target: event.task,
            label: "read",
            data: true
          });
        });
      }
      eventNode.addClass('running');
      eventNode.find('.task').text(event.task.toString());
      eventNode.find('.status').text('task received');
      break;
    case "task-status-amount":
      eventNode.find('.status').text(event.value);
      break;
    case "task-done-amount":
      eventNode.addClass('done');
      eventNode.find('.status').text("Done: " + event.value);
      break;
    case "task-done-duration":
      eventNode.attr('title', 'Finished in '+event.value+"ms");
      break;
    case "task-results":
      if (event.task.type == "map") {
        $('#vis-inter').show();
        $('#vis-inter .nodes').append(renderFile("inter", event.task.id));
        createConnection({
          source: event.task,
          target: { type: "inter", id: event.task.id },
          label: "write",
          data: true
        });
        createConnection({
          source: event.task,
          target: { type: "master", id: 0 },
          label: "data location"
        });
      } else {
        $('#vis-output').show();
        $('#vis-output .nodes').append(renderFile("output", event.task.id));
        createConnection({
          source: event.task,
          target: { type: "output", id: event.task.id },
          label: "write",
          data: true
        });
        createConnection({
          source: event.task,
          target: { type: "master", id: 0 },
          label: "data location"
        });
      }
      break;
    case "phase-shuffle-start":
      $('#node-master-0 .status').text('Shuffle phase');
      // TODO: visualize the shuffle
      break;
    case "phase-reduce-start":
      $('#vis-reduce').show();
      $('#node-master-0 .status').text('Reduce phase');
      break;
    case "task-input-size":
      eventNode.find('.status').text("input: "+event.value+"MB");
      break;
    case "job-done":
      $('#node-master-0 .status').text('Job finished in '+event.value+"ms");
      $('#vis-master .node').addClass('done')
      break;
  }
  controlPlumb.repaintEverything();
  dataPlumb.repaintEverything();
  //console.log("Handled event: ", event);
}

function renderMachine(name, task) {
  var node = $('<div/>').attr('id', 'node-'+task.type+'-'+task.id).addClass('node');
  node.data('task', task).append(
    $('<div/>').addClass('title').text(name),
    $('<div/>').addClass('info').append(
      $('<div/>').addClass('task'),
      $('<div/>').addClass('status')
    )
  );
  return node;
}

function renderFile(location, id) {
  var node = $('<div/>').attr('id', 'node-'+location+"-"+id).addClass('node file');
  node.data('file-id', id).append(
    $('<div/>').addClass('title').append(
      $('<span/>').addClass('name').text('file '+id)
    )
  );
  return node;
}

function createConnection(options) {
  var plumber = (options.data) ? dataPlumb : controlPlumb;
  var triggerStep = $('#vis-container').data('currentEvent').step;
  plumber.connect({
    source: "node-"+options.source.type+"-"+options.source.id,
    target: "node-"+options.target.type+"-"+options.target.id,
    overlays: [
      new jsPlumb.Overlays.Label({
        label: function() {
          var currentStep = $('#vis-container').data('currentEvent').step;
          if (currentStep == triggerStep) return options.label;
        }
      }),
      new jsPlumb.Overlays.Arrow(plumber.Defaults.ArrowStyle)
    ]
  });
}

/* jsPlumb defaults */
$.extend(true, jsPlumb.Defaults, {
  Connector: new jsPlumb.Connectors.Straight(),
  LabelStyle: {
    fillStyle: "rgba(255,255,255,0.7)",
    font: "14px sans-serif",
    color: "#000"
  }
});

var controlPlumb = jsPlumb.getInstance();
$.extend(true, controlPlumb.Defaults, {
  Container: "vis-paths-control",
  Anchors: [ new jsPlumb.Anchors.AutoDefault(), new jsPlumb.Anchors.AutoDefault() ],
  EndpointStyle: { fillStyle: 'rgba(0,0,0,0)' },
  PaintStyle: {
  	lineWidth: 1,
  	strokeStyle: '#f33'
  },
  ArrowStyle: { // NB: Not part of the official API
    fillStyle: '#f33',
    width: 15,
    length: 15,
    location: 0.8
  }
});
controlPlumb.setDraggableByDefault(false);

var dataPlumb = jsPlumb.getInstance();
$.extend(true, dataPlumb.Defaults, {
  Container: "vis-paths-data",
  Anchors: [ jsPlumb.Anchors.RightMiddle, jsPlumb.Anchors.LeftMiddle ],
  EndpointStyle: { fillStyle: 'rgba(0,0,0,0)' },
  PaintStyle: {
    lineWidth: 2,
    strokeStyle: '#338'
  },
  ArrowStyle: { // NB: Not part of the official API
    fillStyle: '#338',
    width: 15,
    length: 15,
    location: 0.95
  }
});
dataPlumb.setDraggableByDefault(false);
