function bellman_ford_solver(graph) {
  var dists = new Array();
  var preds = new Array();
  var graph_length = graph.nodes.length;

  console.log(graph);

  var initialize_bfs = function() {
    for (var i = 0; i < graph_length; i++) {
      dists[i] = null;
      preds[i] = null;
      graph.nodes[i].bfs_dist = null;
    }

    dists[0] = 0;
    preds[0] = 0;
  }();

  var process_edges = function(node_id) {
    var changes_made = 0;

    $.each(graph.edges[node_id].edges, function (_junk, edge_data) {
      var maybe_new_dist;
      var target_node = edge_data.target;
      var target_dist = edge_data.weight;
      var dist_at_target = dists[target_node];

      if (dists[node_id] == null) {
        maybe_new_dist = target_dist;
      } else {
        maybe_new_dist = dists[node_id] + target_dist;
      }

      if (dist_at_target == null || maybe_new_dist < dist_at_target) {
        dists[target_node] = maybe_new_dist;
        preds[target_node] = node_id;
        changes_made++;
      }
    })

    // console.log(dists);
    // console.log(preds);
    // console.log('----');

    return changes_made;
  }

  var step = function() {
    function iterate() {
      var changes_made = 0;
      for (var i = 0; i < graph_length; i++) {
        if (dists[i] == null) {
          continue;
        } else {
          changes_made += process_edges(i);


        }
      }

      console.log(changes_made + ' changes made');
      console.log(dists);
      console.log(preds);
      console.log('---');

      return changes_made;
    }

    while (iterate() > 0);
  }();
}