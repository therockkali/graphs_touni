var weight_label_coeff = 5;
var weight_diff_coeff = 180;
var force;
var svg;
function viz(graph) {
  d3.select('svg').remove();

  var width = height = 800;
  svg = d3.select('#viz-base')
              .append('svg')
              .attr('width', width)
              .attr('height', height);

  var nodes = graph.nodes;
  var links = graph.links;

  force = d3.layout.force()
                .size([width, height])
                .nodes(nodes)
                .links(links);
  var drag = force.drag().on('dragstart', dragstart);

  force.charge(-20000)
       .gravity(1)
       //.linkDistance(function(d) { return d.weight * 25; })
       .linkDistance(256)
       .linkStrength(0.8)
       .friction(0.2);;

  /////////////////////////////////////
  // Code adapted from
  // http://bl.ocks.org/d3noob/5141278
  // Directional marker

  svg.append("defs").selectAll("marker")
      .data(["end"])
    .enter().append("marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr('refX', 32)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr("orient", "auto")
    .append("path")
      .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
      .style("stroke", "#111")
      .style('stroke-width', '0.1em');

  /////////////////////////////////////
  /////////////////////////////////////

  var link = svg.selectAll('.link')
      .data(links)
      .enter().insert('g')
      .attr('class', 'link')
      .insert('line')
      .style('marker-end', 'url(#end)')
      .attr('class', 'link-line')
      .attr('source', function(d) { return d.source; })
      .attr('target', function(d) { return d.target; })
      .attr('data-st', function(d) { return d.source + '-' + d.target; })
      .attr('x1', function(d) { return nodes[d.source].x; })
      .attr('y1', function(d) { return nodes[d.source].y; })
      .attr('x2', function(d) { return nodes[d.target].x; })
      .attr('y2', function(d) { return nodes[d.target].y; });

  var link_label = svg.selectAll('.link')
      .insert('svg:text')
      .attr('class', 'link-label')
      .attr('source', function(d) { return d.source; })
      .attr('target', function(d) { return d.target; })
      .attr('data-st', function(d) { return d.source + '-' + d.target; })
      .text(function(d) {
        return d.weight;
      })

  var node = svg.selectAll('g.node')
      .data(nodes, function(d) { return d.id; });

  var node_enter = node.enter().append('g')
      .attr('class', 'node')
      .attr('node-id', function(d) { return d.id; })
      .call(drag)
      .on('click', connectedNodes);

  node_enter.insert('svg:circle')
    .attr('r', '1em');  

  node_enter.insert('svg:text')
    .attr('class', 'node-text')
    .attr('text-anchor', 'middle')
    // .attr('x', '-0.4em')
    .attr('y', '0.4em')
    .text(function(d) { 
      return d.id; 
    });

  force.on('tick', function() {
    node.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

    link
        .attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    link_label
        .attr('x', function(d) {
          var diff = Math.abs(d.source.x - d.target.x);
          var target_on_right = d.target.x > d.source.x;

          if (target_on_right) {
            return d.target.x - diff / weight_label_coeff;
          } else {
            return d.target.x + diff / weight_label_coeff;
          }
        })
        .attr('y', function(d) {
          var diff = Math.abs(d.source.y - d.target.y);
          var target_is_below = d.target.y > d.source.y;

          if (target_is_below) {
            return d.target.y - diff / weight_label_coeff;
          } else {
            return d.target.y + diff / weight_label_coeff;
          }
        })
  })

  force.start();

  function dragstart(d, i) {
    d.fixed = true;
    $('#unfix-position')
      .css('visibility', 'visible');
    //force.stop();
  }

  function dragend(d, i) {
    d.fixed = true;
    force.resume();
  }

  function releasenode(d) {
    d.fixed = false;
  }

  //////////////////////////
  // Code adapted from
  // http://www.coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
  // Node+link highlighting
  //////////////////////////

  //Toggle stores whether the highlighting is on
  var toggle = 0;
  var toggled_index = null;
  //Create an array logging what is connected to what
  var linkedByIndex = {};
  for (i = 0; i < graph.nodes.length; i++) {
      linkedByIndex[i + "," + i] = 1;
  };
  graph.links.forEach(function (d) {
    linkedByIndex[d.source.index + "," + d.target.index] = 1;
  });
  //This function looks up whether a pair are neighbours
  function neighboring(a, b) {
      return linkedByIndex[a.index + "," + b.index];
  }
  function connectedNodes() {
    if (d3.event.defaultPrevented) {
      return;
    }

    var selected = d3.select(this).node().__data__.id;
    if (toggle == 0 || toggled_index != selected) {
      //Reduce the opacity of all but the neighbouring nodes
      d = d3.select(this).node().__data__;
      node.style("opacity", function (o) {
        return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
        //return neighboring(d, o) ? 1 : 0.1;
      });
      link.style("opacity", function (o) {
        return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
        //return d.index == o.source.index ? 1 : 0.1;
      });

      //Reduce the op
      toggle = 1;

      //console.log(d);
      var hid = d['id'];
      toggled_index = hid;

      $('.link-label').css('opacity', 0.1);
      $('.link-label[source=' + hid + ']').css('opacity', 1);
      $('.link-label[target=' + hid + ']').css('opacity', 1);
      $('.node')
        .css('fill', '#fff')
        .css('stroke', '#1E72AD')
        .find('text')
          .css('fill', '#1E72AD')
          .css('stroke', '#1E72AD');

      node.style('stroke', function (o) {
        //return neighboring(o, d) ? '#d33' : '1E72AD';
        if (neighboring(d, o) && neighboring(o, d)) {
          return '#3a3';
        } else if (neighboring(d, o)) {
          return '#1E72AD';
        } else if (neighboring(o, d)) {
          return '#d33';
        }
      });

      $('.node').find('text')
        .css('fill', '#333')
        .css('stroke', '#333')
      $('.node[node-id=' + hid + ']')
        .css('stroke', '#111')
        .css('fill', '#111')
        .find('text')
          .css('stroke', '#fff')
          .css('fill', '#fff');

      $('#highlight-info').css('visibility', 'visible');
    } else {
      //Put them back to opacity=1

      node.style("opacity", 1);
      link.style("opacity", 1);
      toggle = 0;
      $('.link-label').css('opacity', 1);
      $('.node')
        .css('fill', '#fff')
        .css('stroke', '#1E72AD')
        .find('text')
          .css('fill', '#1E72AD')
          .css('stroke', '#1E72AD');
      $('#highlight-info').css('visibility', 'hidden');
    }
  }
}