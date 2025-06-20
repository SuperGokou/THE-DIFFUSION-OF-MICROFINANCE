// Bar chart configurations: data keys and chart titles
let configs = [
    {key: "ownrent", title: "Own or Rent"},
    {key: "electricity", title: "Electricity"},
    {key: "latrine", title: "Latrine"},
    {key: "hohreligion", title: "Religion"}
];

// Initialize variables to save the charts later
let barcharts = [];
let areachart;

// Date parser to convert strings to date objects
let parseDate = d3.timeParse("%Y-%m-%d");

// (1) Load CSV data
loadData()

function loadData() {
    d3.csv("data/household_characteristics.csv").then(data => {
        // 	(2) Convert strings to date objects
        data.forEach(d => {
            d.survey = parseDate(d.survey)
        });
        let keys = ['ownrent','electricity', 'latrine', 'hohreligion']; // replace with your actual keys
        let aspectRatio = 9 / 16;

        // 	(3) Create new bar chart objects
        keys.forEach((key) => {
            let barChartDiv = "barchart-" + key; // corresponding div id in index.html
            let config = {key: key, title: "Distribution for " + key}; // add properties for title and key
            let barchart = new BarChart(barChartDiv, data, config);
            barcharts.push(barchart);
        });
        areachart = new AreaChart("area-chart", data);


    }).catch(error => {
        console.log(error);
    });
}


// React to 'brushed' event and update all bar charts
function brushed() {

    let selectionRange = d3.brushSelection(d3.select(".brush").node());
    // Convert the extent into the corresponding domain values
    let selectionDomain = selectionRange.map(areachart.x.invert, areachart.x);
    areachart.x.domain(selectionDomain);
    areachart.updateVis();

    barcharts.forEach(barchart => barchart.selectionChanged(selectionDomain));


}
