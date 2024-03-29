    d3.csv('https://raw.githubusercontent.com/dieterholger/US-Gun-Manufacturing-Interactive/master/data/yearlymanufacturing.csv', function(data) {

      data.forEach(function(d) {
        d.Rifles = +d.Rifles;
        d.Pistols = +d.Pistols;
        d.Shotguns = +d.Shotguns;
        d.Revolvers = +d.Revolvers;
        d.Misc = +d.Misc;
        d.Total = +d.Total;
      });

      var width = 960,
        height = 500

      var margin = {
        top: 10,
        right: 110,
        bottom: 18,
        left: 28
      };

      var svg = d3.select('#yearlyGunSalesStackedBar')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .append('g');

      width = width - margin.left - margin.right,
        height = height - margin.top - margin.bottom;

      // This must come after the svg is defined.

      svg.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Create x and y scales.

      var xScale = d3.scaleBand()
        .range([0, width])
        .padding(0.4);

      var yScale = d3.scaleLinear()
        .range([height, 0]);

      // Create domains.

      xScale.domain(data.map(function(d) {
        return d.Year;
      }));

      yScale.domain([0, d3.max(data, function(d) {
        return d.Total;
      })]);

      var x_axis = svg.append('g')
        .attr('class', 'axis')
        .attr('padding', 1)
        .attr('transform', 'translate(' + 0 + ',' + height + ')')
        .call(d3.axisBottom(xScale))
        .selectAll('text')

      // Now append fthe y_axis to the svg by calling the scale. 'S' sets the tick format to standard.

      var y_axis = svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(yScale)
          .ticks(10, 's'));

      // Choose which columns to have as keys with the slice method.

      var keys = data.columns.slice(1, -1);

      // Create a stack of the data based on the keys.

      var stack = d3.stack(data)
        .keys(keys);

      // Create a series of the data.

      var series = stack(data);

      // Create color scale or pass in array of colors.

      var colorScale = d3.scaleOrdinal()
        .domain([0, 5])
        .range(colorbrewer.Oranges[5]);

      // Create the variable and then append a group element.
      var bars = svg.append('g')
        // Select all the group elements.
        .selectAll('g')
        .data(series)
        .enter()
        // Append a new group element in this order, so the rectangles are in group element.
        // Each g here represents each of the keys of the data, in this case each firearm type.
        .append('g')
        // Set the color scale after creating the group for each of the keys, or the weapons in this case.
        .attr('fill', function(d) {
          return colorScale(d.key);
        })
        // When you select the rectangle it doesn't exist yet, because you haven't appended it yet.
        // But only after adding the data do you append the rectangle inside your svg.
        .selectAll('rect')
        // Call the data again and return it. Everytime you append something new you need to show what data you're using.
        .data(function(d) {
          return d;
        })
        // So you need enter the data and append the rectangles that were previously selected.
        .enter()
        .append('rect')
        // Here you set the x and y.
        // You need to use d.Data.Year to select only the year value inside the data array.
        .attr('x', function(d) {
          return xScale(d.data.Year);
        })
        // Now you need to set the y. You need to set the index to 1, which is the index that contains the data in the array.
        .attr('y', function(d) {
          return yScale(d[1]);
        });

      // Separate animation and mouseover so mousover doesn't break, per: https://stackoverflow.com/questions/22645162/d3-when-i-add-a-transition-my-mouseover-stops-working-why
      bars.attr('width', xScale.bandwidth())
        // So now set the y value by the arrays.
        .attr('height', function(d) {
          return yScale(d[0]) - yScale(d[1]);
        });

      // Sets mousover and mouseout events.
      bars.on('mouseover', function(d) {
          tip.show(d);
        })
        .on('mouseout', function(d) {
          tip.hide(d);
        });

      // Settings for the tooltip.

      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<p><font size='3rem'><center><strong>" + d.data.Year + "</strong></p></center></font><p><font size='2rem'>Misc: " + formatComma(d.data.Misc) + "</p><p>Revolvers: " + formatComma(d.data.Revolvers) + "</p><p>Shotguns: " + formatComma(d.data.Shotguns) +
            "</p><p>Pistols: " +
            formatComma(d.data.Pistols) + "</p><p>Rifles: " + formatComma(d.data.Rifles) + "</p></font>";
        })

      svg.call(tip);

      // Formats numbers with commas for display in the tooltip.

      var formatComma = d3.format(",");

      // Settings for the legend. From: http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend

      var legendRectSize = 18;
      var legendSpacing = 4;

      var legend = svg.selectAll('.legend')
        // Sets the data to the keys and reverses their order so they appear correctly.
        .data(keys.reverse())
        .enter()
        .append('g')
        .attr('transform', function(d, i) {
          // Modify vert and horzontal variables by adding or subracting pixels to change its position.
          var height = legendRectSize + legendSpacing;
          var offset = height * colorScale.length / 2;
          var horz = width + 15;
          var vert = i * height - offset;
          return 'translate(' + horz + ',' + vert + ')';
        });

      legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', colorScale)
        .style('stroke', colorScale);

      legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d, i) {
          return keys[i];
        })
    });
