document.addEventListener('DOMContentLoaded', function () {
    var container = d3.select(".container");

    var containerSvg = container
        .append("svg")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT);

    var htmlBody = d3.select("body");

    var tooltip = htmlBody.append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    var legendXScale = d3.scaleLinear()
        .domain([0, 100])
        .rangeRound([600, 860]);

    var color = d3.scaleThreshold()
        .domain(d3.range(LEGEND_MIN, LEGEND_MAX, STEP_SIZE).concat(LEGEND_MAX))
        .range(d3.range(0, NUM_COLORS).map(i => d3.interpolateGreens(i / (NUM_COLORS - 1))));

    var g = containerSvg.append("g")
        .attr("class", "key")
        .attr("id", "legend")
        .attr("transform", "translate(0, 30)");

    g.selectAll("rect")
        .data(color.range().map(function (d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = legendXScale.domain()[0];
            if (d[1] == null) d[1] = legendXScale.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 10)
        .attr("x", function (d) { return legendXScale(d[0]); })
        .attr("width", function (d) { return legendXScale(d[1]) - legendXScale(d[0]); })
        .attr("fill", function (d) { return color(d[0]); });

    g.call(d3.axisBottom(legendXScale)
        .tickSize(10)
        .tickFormat(function (percent) { return Math.round(percent) + '%' })
        .tickValues(color.domain()))
        .select(".domain")
        .remove();

    var pathGenerator = d3.geoPath();

    fetchData()
        .then(data => {
            containerSvg.append("g")
                .attr("class", "counties")
                .selectAll("path")
                .data(topojson.feature(data.county, data.county.objects.counties).features)
                .enter().append("path")
                .attr("class", "county")
                .attr("data-fips", function (d) {
                    return d.id
                })
                .attr("data-education", function (d) {
                    var result = data.education.filter(function (obj) {
                        return obj.fips == d.id;
                    });
                    if (result[0]) {
                        return result[0].bachelorsOrHigher
                    }
                    console.log('could find data for: ', d.id);
                    return 0
                })
                .attr("fill", function (d) {
                    var result = data.education.filter(function (obj) {
                        return obj.fips == d.id;
                    });
                    if (result[0]) {
                        return color(result[0].bachelorsOrHigher)
                    }
                    console.log('could find data for: ', d.id);
                    return color(0)
                })
                .attr("d", pathGenerator)
                .on("mouseover", function (event, d) {
                    tooltip.style("opacity", 1);
                    tooltip.html(function () {
                        var result = data.education.filter(function (obj) {
                            return obj.fips == d.id;
                        });
                        if (result[0]) {
                            return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
                        }
                        console.log('could find data for: ', d.id);
                        return 0
                    })
                        .attr("data-education", function () {
                            var result = data.education.filter(function (obj) {
                                return obj.fips == d.id;
                            });
                            if (result[0]) {
                                return result[0].bachelorsOrHigher
                            }
                            console.log('could find data for: ', d.id);
                            return 0
                        })
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function (event, d) {
                    tooltip.style("opacity", 0);
                });

            containerSvg.append("path")
                .datum(topojson.mesh(data.county, data.county.objects.states, function (a, b) { return a !== b; }))
                .attr("class", "states")
                .attr("d", pathGenerator);
        })
        .catch(error => {
            console.error(error);
        });
});
