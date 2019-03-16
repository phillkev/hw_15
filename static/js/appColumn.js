function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel
  // Use `d3.json` to fetch the metadata for a sample
  d3.json("/metadata/" + sample).then(function(smplMeta){

    // Use d3 to select the panel with id of `#sample-metadata`
    var metaGrid = d3.select('#sample-metadata')
    // Use `.html("") to clear any existing metadata
    metaGrid.html("")

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    Object.entries(smplMeta).forEach(function([key, value]) {
      // Append a ul row for metadata value
      var row = metaGrid.append("ul");
      row.text(key + ": " + value);
    });
  });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

  d3.json("/samples/" + sample).then(function(smplData){

    // smplData = smplData.sort(function(a, b) {
    //   return b.sample_values - a.sample_values;
    // });    
    
  // @TODO: Build a Bubble Chart using the sample data

    
    var bubbleValues = smplData.sample_values;
    // var bubbleSize = smplData.map(sample => sample.sample_values + 20);
    var bubbleIds = smplData.otu_ids;
    var bubbleLabels = smplData.otu_labels;

    var trace1 = {
      x: bubbleIds,
      y: bubbleValues,
      labels: bubbleLabels,
      text: bubbleLabels,
      mode: 'markers',
      marker: {
        size: bubbleValues,
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
  
    Plotly.newPlot("bubble", data, layout);

  // // @TODO: Build a Pie Chart
  // // HINT: You will need to use slice() to grab the top 10 sample_values,
  // // otu_ids, and labels (10 each).



    pieData = smplData;

    var pieValues = pieData.sample_values;
    // var pieIds = pieData.otu_ids;
    // var pieLabels = pieData.otu_labels;

    pieValues = pieValues.sort(function(a, b) {
      return b - a;
    });
    console.log(pieValues);



  //   var trace1 = {
  //     labels: pieIds,
  //     values: pieValues,
  //     text: pieLabels,
  //     textinfo: 'percent',
  //     hoverinfo: 'label+text+value+percent',
  //     // hovertemplate: '%{label:">"}<br>%{text:">"}<br>%{value:">"}<br>%{percent:">"}',
  //     type: 'pie'
  //   };
  //   var data = [trace1];
  //   var layout = {
  //     title: "",
  //     width: 900
  //   };

  //   Plotly.newPlot("pie", data, layout);
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