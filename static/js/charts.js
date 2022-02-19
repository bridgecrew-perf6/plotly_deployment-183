// INITIALIZE DASHBOARD
function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    // REFACTOR TO USE OPTIONCHANGED FUNC
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

init();

// TRIGGER REBUILD WHEN LIST ITEM IS LOADED
function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// BUILD PANEL FOR DEMOGRAPHIC DATA
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];

    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// BUILD ALL CHARTS
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // Retrieve sample matching chosen ID
    var samplesData = data.samples.filter(sampleObj => sampleObj.id == sample);
    var sampleData = samplesData[0];

    var otuIDs = sampleData.otu_ids;
    var otuLabels = sampleData.otu_labels;
    var sampleValues = sampleData.sample_values;

    // Identify data set by taking largest sample results (data is initially stored in ascending order)
    // OTU value forced into text strings for display purposes
    var xvals = sampleValues.reverse().slice(-10);
    var yticks = sampleValues
                  .map(function(value, index) {
                      return `OTU ${otuIDs[index]}`;
                  }).reverse().slice(-10);

    // Generate bar chart.
    var barData = [
      {x: xvals, y:yticks, type:"bar", orientation:"h"}  
    ];

    var barLayout = {
       title: {text:'<b>Top 10 Bacteria Cultures Found</b>'}, paper_bgcolor: 'rgba(154,205,50,1)'
    };
    
    Plotly.newPlot('bar', barData, barLayout)

    // BEGIN BUBBLE CHART
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x:otuIDs,
      y:sampleValues,
      text:otuLabels,
      mode:'markers',
      marker: {size:sampleValues, color:otuIDs, colorscale:'YlGnBu'}
    }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title:{text:'<b>Bacterial Cultures Per Sample</b>'},
      hovermode: 'closest',
      xaxis: {title: 'OTU ID'},
      paper_bgcolor: 'rgba(154,205,50,1)',
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };
    
    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout); 

    // BEGIN GAUGE CHART
    // Extract washing frequency from sample metadata
    var metadata = data.metadata.filter(metaObj => metaObj.id == sample);
    var person = metadata[0];
    var wFreq = parseFloat(person.wfreq);

    // Configure and display gauge chart.
    var gaugeData = [{
      type: 'indicator',
      mode: 'gauge+number',
      gauge: {axis: {range: [0,10]},
              bar: {color:'black'},
              dtick: 2,
              steps:[{range:[0,2], color:'red'},
                     {range:[2,4], color:'orange'},
                     {range:[4,6], color:'yellow'},
                     {range:[6,8], color:'lightgreen'},
                     {range:[8,10], color:'green'}
                    ]
            },
      value: wFreq
    }];
  
    var gaugeLayout = { 
      title: {text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week"},
      paper_bgcolor: 'rgba(154,205,50,1)'
    };

    Plotly.newPlot('gauge', gaugeData, gaugeLayout);
  });
};

