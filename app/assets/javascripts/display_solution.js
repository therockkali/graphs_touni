function display_solution(graph) {
  var highlight_path = function(node_id) {
    var highlight_nodes = graph.paths[node_id].slice(0);
    highlight_nodes.push(node_id);

    $('#highlight-info').css('visibility', 'hidden');
    $('.link-line').css('opacity', 0.1)
    $('.link-label').css('opacity', 0.1);
    $('.node')
      .css('opacity', 0.1)
      .css('stroke', '#1E72AD')
      .css('fill', '#fff')
      .find('text')
        .css('stroke', '#1E72AD')
        .css('fill', '#1E72AD');

    for (var i = 0; i < highlight_nodes.length - 1; i++) {
      var current_node = highlight_nodes[i];
      var data_st = highlight_nodes[i] + '-' + highlight_nodes[i + 1];

      $('.link-line[data-st="' + data_st + '"]').css('opacity', 1);
      $('.link-label[data-st="' + data_st + '"]').css('opacity', 1);

      $('.node[node-id=' + current_node + ']')
        .css('opacity', 1);
    }

    $('.node[node-id=' + node_id + ']')
      .css('opacity', 1)
      .css('stroke', '#111')
      .css('fill', '#111')
      .find('text')
        .css('stroke', '#fff')
        .css('fill', '#fff');
  }

  var traverse_path = function(node_id) {
    return graph.preds[node_id];
  }

  var denormalized_paths = function() {
    console.log(graph);
    $.each(graph.preds, function(node_id, pred_id) {
      if (pred_id === null) {
      } else {
        graph.paths[node_id].push(pred_id);

        var traverse_pred_id = pred_id;
        while (traverse_pred_id != 0) {
          traverse_pred_id = traverse_path(traverse_pred_id);
          graph.paths[node_id].push(traverse_pred_id);
        }
      }
    });
  }();

  var render_result = function() {
    $('#solution').empty();
    var h_path = $('<div>');
    var h_dist = $('<div>');

    h_path.addClass('col-xs-10 header-path')
      .text('Shortest Path');

    h_dist.addClass('col-xs-2 header-dist')
      .text('d');

    $('#solution').append(h_path).append(h_dist);

    $.each(graph.paths, function(id, data) {
      var s_path = $('<div>');
      var s_dist = $('<div>');
      var s_dist_link = $('<a>');

      var t = $('<strong>');
      t.append(id);

      s_path.addClass('col-xs-10 body-path');

      if (data.length == 0) {
        s_path.append('No route from 0 to ' + id);
        s_dist.append('INF');
      } else {
        s_path.append(data.reverse().join(" &raquo; "));

        if (id != 0) {
          s_path.append(" &raquo; ").append(t);
        }

        s_dist_link.attr('href', '#sp')
          .attr('data-id', id)
          .text(graph.dists[id]);

        s_dist.addClass('col-xs-2 body-dist');
        s_dist.append(s_dist_link);      
      }
      $('#solution').append(s_path).append(s_dist);
    })

    $('a[data-id]').each(function() {
      var id = parseInt($(this).attr('data-id'));

      $(this).on('click', function() {
        highlight_path(id);
      })
    })
  }();
}