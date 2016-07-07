$('#graph-draw-button').on('click', function() {
  var graph = {
    nodes: [],
    links: []
  }

  var rows = $('#graph-input').val().trim().split(/[\r\n]/);

  $.each(rows, function(i, x) {
    graph.nodes.push({ id: i });

    $.each(x.split(/\,/), function(j, y) {
      if (y[0] == '*') {
      } else {
        if (i != j) {
          graph.links.push({ source: i, target: j, weight: y });
        }
      }
    })
  })

  viz(graph);
})

$('#graph-load-example').on('click', function() {
  var example = '0,*,100,10,*,32,*' + "\n"
              + '4,0,*,*,17,*,5' + "\n"
              + '5,*,0,30,*,42,*' + "\n"
              + '*,23,3,0,14,*,*' + "\n"
              + '*,10,*,26,0,2,*' + "\n"
              + '*,*,9,13,3,0,*' + "\n"
              + '*,6,*,*,12,12,0';

  $('#graph-input').val(example);
  $('#graph-draw-button').trigger('click');
})

$('#graph-draw-button').trigger('click');
