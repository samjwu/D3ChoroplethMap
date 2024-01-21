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
});
