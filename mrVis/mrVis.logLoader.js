function logLoader(url, framework, callback) {
  switch(framework) {
    case "disco":
      loadDisco(url, callback);
      break;
    case "hadoop":
      loadHadoop(url, callback);
      break;
  }
  
  function loadDisco(url, callback) {
    $.get(url, function(data, textStatus) {
      callback($.map(data.split(/\n/), function(line, i) {
        var lineData = eval(line),
            type = null,
            task = null,
            targetNode = null,
            value = null;
        
        // Don't include invalid lines
        if (line.length == 0 || !lineData) return null;
        
        var message = lineData[2];
        
        // Set event type
        $.each(Object.keys(discoTypes), function(i, key) {
          if (message.search(new RegExp(key, 'i')) > -1) type = discoTypes[key];
        });
        
        // Set event task (for task events)
        if (type && type.match(/^task-/)) {
          var taskInfo = message.match(/(map|reduce)\:\d+/)[0].split(':');
          task = {
            type: taskInfo[0],
            id: taskInfo[1],
            toString: function() { return this.type + ":" + this.id; }
          };
        }
        
        switch(type) {
          // Set event target node (for assignment and result events)
          case "task-assign":
            targetNode = message.match(/[^\s]+$/)[0];
            break;
          case "task-results":
            targetNode = message.match(/[^\s]+(?=\.$)/)[0];
            break;
          // Set event value (if applicable)
          case "task-status-amount":
          case "task-done-amount":
            value = parseInt(message.match(/\d+/g)[1]); // Amount of entries processed
            break;
          case "task-done-duration":
          case "job-done":
            var t = message.match(/(\d+):(\d{2}):(\d{2})\.(\d{3})/);
            value = t[1]*60*60*1000 + // hours
                    t[2]*60*1000 +    // minutes
                    t[3]*1000 +       // seconds
                    t[4]*1;           // milliseconds
            break;
          case "phase-shuffle-done":
            value = parseInt(message.match(/\d+/)[0]);
            break;
          case "task-input-size":
            value = parseFloat(message.match(/\d+\.\d+/)[0]);
            break;
        }
        
        return {
          timestamp: Date.parse(lineData[0]).getTime(),
          node: lineData[1],
          task: task,
          type: type,
          targetNode: targetNode,
          value: value,
          message: message
        };
      }));
    });
  }
  
  var discoTypes = {
    // Job events
    "new job initialized": "job-initialize",
    "starting job": "job-start",
    "ready: job finished in": "job-done",
    // Phase events
    "map phase$": "phase-map-start",
    "map phase done": "phase-map-done",
    "shuffle phase starts": "phase-shuffle-start",
    "shuffle phase took": "phase-shuffle-done",
    "starting reduce phase": "phase-reduce-start",
    "reduce phase done": "phase-reduce-done",
    // Task events
    "assigned to": "task-assign",
    "received results from": "task-results",
    "received a new (map|reduce) task": "task-receive",
    "input is": "task-input-size",
    "\\d+ entries (mapped|reduced)": "task-status-amount",
    "done: \\d+ entries (mapped|reduced)": "task-done-amount",
    "task finished in": "task-done-duration",
    "results pushed to DDFS": "task-filesystem-save"
  }
  
  function loadHadoop(url, callback) {
    // TODO
    callback([{}]);
  }
}

