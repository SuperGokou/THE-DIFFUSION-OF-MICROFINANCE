/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

class BarChart {

	constructor(parentElement, data, config) {
		this.parentElement = parentElement;
		this.data = data;
		this.config = config;
		this.displayData = data;
		// console.log(this.displayData);
		this.initVis();
	}

	/*
	 * Initialize visualization (static content; e.g. SVG area, axes)
	 */

	initVis() {
		let vis = this;

		//console.log(vis.config.title);
		// console.log(vis.parentElement);
		// console.log(vis.displayData);

		vis.margin = { top: 10, right: 80, bottom: 10, left: 80 };
		vis.width = 800 - vis.margin.left - vis.margin.right;
		vis.height = 150 - vis.margin.top - vis.margin.bottom;

		// vis.svg = d3.select(vis.parentElement).append("svg")
		vis.svg = d3.select('#' + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
			.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

		vis.y = d3.scaleBand()
			.rangeRound([0, vis.height])
			.padding(0.1);

		vis.x = d3.scaleLinear()
			.rangeRound([0, vis.width - 80]);

		vis.yAxis = d3.axisLeft()
			.scale(vis.y);

		vis.svg.append("g")
			.attr("class", "y-axis");

		// (Filter, aggregate, modify data)
		vis.wrangleData();
	}


	/*
	 * Data wrangling
	 */

	wrangleData() {
		let vis = this;


		// (1) Group data by key variable (e.g. 'electricity') and count leaves
		vis.displayData = d3.rollup(vis.displayData,
			v => v.length,
			d => d[vis.config.key]
		);

		vis.displayData = Array.from(vis.displayData, d => ({ key: d[0], value: d[1] }));

		// (2) Sort columns descending
		vis.displayData.sort((a, b) => b.value - a.value);


		// Update the visualization
		vis.updateVis();
	}

	/*
	 * The drawing function - should use the D3 update sequence (enter, update, exit)
	 */

	updateVis() {
		let vis = this;

		// (1) Update domains
		vis.y.domain(vis.displayData.map(d => d.key));
		vis.x.domain([0, d3.max(vis.displayData, d => d.value)]);

		// (2) Draw rectangles
		// Bind data to rectangles
		let bars = vis.svg.selectAll("rect").data(vis.displayData);
		let labels = vis.svg.selectAll(".label").data(vis.displayData);

		bars.transition()
			.duration(800)
			.attr("y", d => vis.y(d.key))
			.attr("width", d => vis.x(d.value));

		bars.enter().append("rect")
			.attr("class", "bar")
			.attr("y", d => vis.y(d.key))
			.attr("height", 26)
			.attr("x", 5)
			.transition()
			.duration(800)
			.attr("width", d => vis.x(d.value))
			.attr("fill", "#4682b4");

		labels.transition()
			.duration(800)
			.attr("y", d => vis.y(d.key) + vis.y.bandwidth() / 2)
			.attr("x", d => vis.x(d.value) + 10)
			.text(d => d.value);

		labels.enter().append("text")
			.attr("class", "label")
			.attr("y", d => vis.y(d.key) +  vis.y.bandwidth()/2)
			.attr("x", d => vis.x(d.value) + 10)
			.attr("dy", ".35em")
			.transition()
			.duration(800)
			.text(d => d.value);

		// (3) Draw labels
		bars.exit().remove();
		labels.exit().remove();
		// Update the axes
		// * TO-DO *

		// Update the y-axis
		vis.svg.select(".y-axis").call(vis.yAxis);

	}
	/*
	 * Filter data when the user changes the selection
	 * Example for brushRegion: 07/16/2016 to 07/28/2016
	 */
	selectionChanged(brushRegion) {
		let vis = this;
		// Filter data accordingly without changing the original data

		vis.filteredData = vis.data.filter(function (d) {
			return d.survey >= brushRegion[0] && d.survey <= brushRegion[1];
		});
		// Update the visualization
		vis.displayData = vis.filteredData;
		vis.wrangleData();

	}
}
