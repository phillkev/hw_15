function buildGauge(dialValue) {
  // This code is modified from the code https://plot.ly/javascript/gauge-charts/

  // Convert the dialValue to a value relevent to the dial
  level = dialValue/9*180

  // Trig to calc meter point
  var degrees = 180 - level,
  radius = .65;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
  pathX = String(x),
  space = ' ',
  pathY = String(y),
  pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [
    { 
      type: 'scatter',
      x: [0], 
      y:[0],
      marker: {
        size: 15, 
        color:'850000'
      },
      showlegend: false,
      name: 'Wash Frequency',
      text: dialValue,
      hoverinfo: 'text+name'
    },
    {
      values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {
        colors:[
          'rgba(88, 110, 209, .5)','rgba(156,108,202, .5)', 'rgba(203,108,187, .5)',
          'rgba(235,114,168, .5)', 'rgba(254,127,149, .5)',
          'rgba(255,147,132, .5)', 'rgba(255,171,122, .5)',
          'rgba(255,195,122, .5)', 'rgba(255,228,194, .5)',
          'rgba(255, 255, 255, 0)'
        ]
      },
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }
  ];

  var layout = {
    shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: {
      text: 'Belly Button Washing Frequency<br>Scrubs per Week',
    },
    height: 450,
    width: 450,
    xaxis: {
      zeroline:false,
      showticklabels:false,
      showgrid: false, 
      range: [-1, 1]
    },
    yaxis: {
      zeroline:false, 
      showticklabels:false,
      showgrid: false, 
      range: [-1, 1]
    }
  };

  Plotly.newPlot('gauge', data, layout);
  }


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

    // BONUS: Build the Gauge Chart
    buildGauge(smplMeta.WFREQ);
  });
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
      showlegend: false,
      xaxis: {
        title: {
          text: 'OTU_ID'
        }
      },
      height: 500
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
      width: 450,
      height: 450
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
