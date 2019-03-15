function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/" + sample).then(function(smplMeta){

    // Use d3 to select the panel with id of `#sample-metadata`
    var metaGrid = d3.select('#sample-metadata')
    // Use `.html("") to clear any existing metadata
    metaGrid.html("")

    // Use `Object.entries` to add each key and value pair to the panel

    Object.entries(smplMeta).forEach(function([key, value]) {
      // Append a ul row for metadata value
      var row = metaGrid.append("p");
      row.text(key + ": " + value);
    });
  });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

  d3.json("/samples/" + sample).then(function(smplData){
    smplData = smplData.sort(function(a, b) {
      return b.sample_values - a.sample_values;
    });    

  // @TODO: Build a Bubble Chart using the sample data
  // create arrays for the bubble chart

    var bubbleValues = smplData.map(sample => sample.sample_values);
    // Added 20 to the sample_value so the bubbles with very small sample sizes were more visible.
    // Adding a flat value was more desirable than a more complex formula since we do not want 
    // The large sample sizes to get too large.
    var bubbleSize = smplData.map(sample => sample.sample_values + 20);
    var bubbleIds = smplData.map(sample => sample.otu_id );
    var bubbleLabels = smplData.map(sample => sample.otu_label );

    // Build the trace, datta and layout.
    // The color scale of Viridis is used due to the chart background being white
    // We want all bubbles to be visible on the chart.
    var trace1 = {
      x: bubbleIds,
      y: bubbleValues,
      labels: bubbleLabels,
      text: bubbleLabels,
      mode: 'markers',
      marker: {
        size: bubbleSize,
        color: bubbleIds,
        colorscale: 'Viridis'
      }
    };
    
    var data = [trace1];
    
    var layout = {
      title: 'Marker Size',
      showlegend: false,
      height: 600,
      width: 1200
    };
  // plot the chart.  Use newPlot to ensure refreshes of the data do not add the results to the previous run.
    Plotly.newPlot("bubble", data, layout);

  // @TODO: Build a Pie Chart

  // Since the dataset is stored as records we can simply slice the data once
    pieData = smplData.slice(0,10)

  // Create the arrays for the pie chart 
    var pieValues = pieData.map(sample => sample.sample_values);
    var pieIds = pieData.map(sample => sample.otu_id );
    var pieLabels = pieData.map(sample => sample.otu_label );

  // build the trace, data and layout  
    var trace1 = {
      labels: pieIds,
      values: pieValues,
      text: pieLabels,
      textinfo: 'percent',
      hoverinfo: 'label+text+value+percent',
      type: 'pie'
    };
    var data = [trace1];
    var layout = {
      width: 600
    };
  // plot the chart.  Use newPlot to ensure refreshes of the data do not add the results to the previous run.
    Plotly.newPlot("pie", data, layout);
  });


};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
