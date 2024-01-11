async function drawChart() {
    const myHeaders = new Headers()
    myHeaders.append("x-api-key", "************")
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    }
    const dateParser = d3.timeParse("%Y-%m-%dT%H:%M:%S+0000") 

    // Määritetään mitat
    const width = window.innerWidth - 500;
    let dimensions = {
        width: width,
        height: width * 0.7,
        margins: {
            top: 30,
            right: 10,
            bottom: 50,
            left: 90
        },
    };

    dimensions.boundedWidth = dimensions.width  
    -dimensions.margins.left
    -dimensions.margins.right;

    dimensions.boundeHeigth = dimensions.height 
        -dimensions.margins.top
        -dimensions.margins.bottom;


    //svg pohja
    const wrapper = d3
    .select("#wrapper")
    .append("svg")
    .attr("height", dimensions.height)
    .attr("width", dimensions.width)

    const boundingBox = 
    wrapper.append("g")
    .attr("id", "boundingbox") 
    .style("transform", `translate(
            ${dimensions.margins.left}px, 
            ${dimensions.margins.top}px)`
    );

    boundingBox.append("path").attr("class", "path")
    .attr("stroke", "blue")
    .attr("stroke-width", 2)
    .attr("fill", "none");
    boundingBox.append("rect").attr("class", "rect");
    boundingBox.append("g").attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundeHeigth}px)`)
    .append("text").attr("class", "x-axis-label")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margins.bottom - 10);
    boundingBox.append("g").attr("class", "y-axis")
    .append("text").attr("class", "y-axis-label")
    .attr("x", dimensions.margins.left - 125)
    .attr("y", dimensions.boundeHeigth / 2)
    
    const transition = d3.transition().duration(800);

    //SUBFUNCTION
    const getData = async () => {

        const idnro = document.querySelector('input[name="datasource"]:checked').value;
        const start_date =  document.getElementById("start_date").value;
        const end_date = document.getElementById("end_date").value;
        const apiURL = `https://api.fingrid.fi/v1/variable/${idnro}/events/csv?start_time=${start_date}T00:00:00Z&end_time=${end_date}T23:00:00Z`;
        const dataset = await d3.csv(apiURL, requestOptions)
        const xAccessor = d => dateParser(d.start_time);
        const yAccessor = d => +d.value;

        //Skaalaimet
        let yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundeHeigth, 0]);

        const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, xAccessor))
        .range([0, dimensions.boundedWidth]);

        let unit = String;

        if (idnro === "65") {
            unit = "MW"
        }
        else {
            unit = "MWh"
        }


        // Piirretään data
        boundingBox
        .select("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", dimensions.boundeHeigth)
        .attr("width", dimensions.boundedWidth)
        .attr("fill", "none");

        const lineGenerator = d3
        .line()
        .x((d) => xScale(xAccessor(d)))
        .y((d) => yScale(yAccessor(d)));

        boundingBox
        .select("path")
        .transition()
        .attr("d", lineGenerator(dataset))
        .transition()
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");

        // 6. Piirrä akselit ja otsikot

        const yAxisGenerator = d3.axisLeft().scale(yScale);
        const yAxis = boundingBox.select(".y-axis").transition().call(yAxisGenerator);

        const YAxisLabel = yAxis.select(".y-axis-label")
        .transition()
        .attr("x", dimensions.margins.left - 120)
        .attr("y", dimensions.boundeHeigth / 2)
        .attr("fill", "black")
        .text(unit)
        .style("font-size", "20px")
        .style("text-transform", "capitalize");

        const xAxisGenerator = d3.axisBottom().scale(xScale);
        const xAxis = boundingBox.select(".x-axis")
        .transition()
        .call(xAxisGenerator)
        .style("transform", `translateY(${dimensions.boundeHeigth}px)`);
        const xAxisLabel = xAxis.select(".x-axis-label")
        .transition()
        .attr("x", dimensions.boundedWidth / 2)
        .attr("y", dimensions.margins.bottom)
        .attr("fill", "black")
        .text("Date/time")
        .style("font-size", "20px")
        .style("text-transform", "capitalize");
        
    };

    const button = d3.select("button");
    button.node().addEventListener("click", getData, false);
    
}

drawChart();
