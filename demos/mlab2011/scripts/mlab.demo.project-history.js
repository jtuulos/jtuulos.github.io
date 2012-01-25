$(function() {
  var w = 960,                    // Chart width
      pw = 50,                    // Left padding (inclusive)
      z = ~~((w - pw * 2) / 53),  // Day square width/height
      ph = 15,                // Padding between years
      h = z * 7;                  // Single year height
  
  // Initialize year charts
  var vis = d3.select("#chart")
    .selectAll("svg")
      .data(d3.range(2001, 2012))
    .enter().append("svg:svg")
      .attr("width", w)
      .attr("height", h + ph * 2)
      .attr("class", function(d) { return "year y" + d; })
    .append("svg:g")
      .attr("transform", "translate(" + pw + "," + ph + ")");
  
  // Year labels
  vis.append("svg:text")
      .attr("transform", "translate(-15," + h / 2 + ")rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("class", "year-label")
      .text(function(d) { return d; });
  
  // Day squares
  vis.selectAll("rect.day")
      .data(calendar.dates)
    .enter().append("svg:rect")
      .attr("x", function(d) { return d.week * z; })
      .attr("y", function(d) { return d.day * z; })
      .attr("class", function(d) { return "day d" + d.day; })
      .attr("fill", "#fff")
      .attr("width", z)
      .attr("height", z);
  
  // Month outlines
  vis.selectAll("path.month")
      .data(calendar.months)
    .enter().append("svg:path")
      .attr("class", function(d) { return "month m" + d.month; })
      .attr("d", function(d) {
        return "M" + (d.firstWeek + 1) * z + "," + d.firstDay * z
            + "H" + d.firstWeek * z
            + "V" + 7 * z
            + "H" + d.lastWeek * z
            + "V" + (d.lastDay + 1) * z
            + "H" + (d.lastWeek + 1) * z
            + "V" + 0
            + "H" + (d.firstWeek + 1) * z
            + "Z";
        });
  
  d3.csv("projects-files-by-date.csv", function(csv) {
    var data = d3.nest()
        .key(function(d) { return d.date; })
        .rollup(function(d) { return (d[0]).count; })
        .map(csv);
  
    var colors = 4;
    var color = d3.scale.quantize()
        .domain([1, 20])
        .range(d3.range(colors));
  
    vis.selectAll("rect.day")
        .attr("class", function(d) {
          var c = "day d" + d.Date;
          if (data[d.Date]) {
            c += " q" + color(data[d.Date]) + "-" + colors;
          }
          return c;
        });
    
    $('#chart').trigger('vis-ready');
  });
});
  