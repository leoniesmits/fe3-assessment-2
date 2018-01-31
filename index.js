// select the svg and give the margin values
// for the width, give 
var svg = d3.select("svg"),
margin = {top: 40, right: 40, bottom: 110, left: 60},
width = +svg.attr("width") - margin.left - margin.right,
height = +svg.attr("height") - margin.top - margin.bottom;

// put a svg.append("g") in the g variable with the right attributes
// so you can use g.append and give the semantic buildup 
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// first, create the x axis with proper height
// don't call the content yet
g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

// do the same for the y axis
// give all the needed attributes without calling the element
g.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Percentage uitgaven t.o.v. inkomsten");

// start the function, this function is called at the end of the code
// the trigger of input will bring the code here later
// first, remove all .bar and .legend attributes
// these aren't made yet, but clean the field before it loops
function update(features) {
  d3.selectAll(".bar").remove();
  d3.selectAll(".legend").remove();
  
// define all the variables we'll use
// give transition a duration and store in t for quick usage
  var t = d3.transition()
    .duration(750);

// in x0, store the following:
// d3.scaleBand so construct a new band with the (now) empty domain
// with .ragebound, set the scale range to specified elements
// use the variable width in .rageBound to calculate the right range
  var x0 = d3.scaleBand()
    .rangeRound([3, width])
    .paddingInner(0.1);

// in x1, again store .scaleBand and some padding
  var x1 = d3.scaleBand()
    .padding(0.05);

// in variable y, construct a linear scale, for this axis
// will have linear count of ticks
// give another .rangeBound, this time with variable height
// because the y axis is going up
  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  // pick a color range for the scaling
  var z = d3.scaleOrdinal()
    .range(["#FAB94B", "#35A7FF", "#A3EDC7", "#EFE810", "#20BF55", "#003F91", "#0FA3B1"]);

// load the csv file and define the data
// there are multiple files, so to upload the right one, put 
// "features" in between, refering to the value of selected input
// in the parameters, store d, i and columns
// d gives the value for each variable
// i gives the number of the variable in the array
// columns gives the length of the array
d3.csv('data_' + features + '.csv', function(d, i, columns) {
// write a for loop to go through the data a number of times
// the variable i starts at 1, adds one when columns.length is bigger
// gives the string value back as number
for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
//return the value
return d;
// start another function, now that the right dataset is loaded
// to select errors in que, give parameter error
// to refer to the data in the dataset, give parameter d
}, function(error, d) {
// write statement to "throw" the error in the queue
if (error) throw error;

// in keys, store the column names to use as legend
// slice the category name (Huishoudens)
    var keys = d.columns.slice(1);

// slice off the title and the source
    var d = d.slice(1, d.length-1);

// this is the legend, make new array, return the name of the categories
    x0.domain(d.map(function(d) { return d.Huishoudens; }));
// in x axis domain, refer to the variable keys
// the keys is the data columns without the category names
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
// use 0 to 50 as scaling on the y axis
// as we're going up to 50 in the y axis
    y.domain([0, 50]);

// select the x axis in the svg, made before the function was called
// now, call the x axis and put the domain in the axisBottom
// give attributes and style to everyting in x axis
    svg.select(".x.axis")
      .transition(t)
        .call(d3.axisBottom(x0))
        .selectAll("text")
            .style("text-anchor", "end") //Change the allignment to the right
            .attr("y", "10px")
            .attr("transform", function(d) {
                return "rotate(-35)";
                });;

// call the y axis
// give a transition and the number of ticks
    svg.select(".y.axis")
      .transition(t)
        .call(d3.axisLeft(y).ticks(10))

//determine location of bars by making a new g element in svg.g (g variable)
// after .enter(), create a new g and write a function to make the bars refer to the legend
// (the legend = x0(d.Huishoudens))
// select the non existent rect and return their value
    g.append("g")
      .attr("class", "barfield")
      .selectAll("g")
      .data(d)
      .enter().append("g")
        .attr("class", "barsblock")
        .attr("transform", function(d) { return "translate(" + x0(d.Huishoudens) + ",0)"; })
      .selectAll("rect")
      // function to make a new array where you put the
      .data(function(d) {
        return keys.map(function(key) {
          return {key: key, value: d[key]};
        });
      })
// make the bars and match them to the data of x0.domain, x1.domain and y.domain
// add the attributes x, width and fill
// add functions to each attribute, make them return the values
// for x the values of x1.domain
// for y, refer to height
// make attr height 0, to make the bars start from the bottom with transition
// for the id, write a function that gives (d, i) as parameters to use the data and index
// return the id as #number(+ number of index)
      .enter().append("rect")
        .attr("width", x1.bandwidth())
        .attr('class', 'bar')
        .attr("id", function(d, i){
          return "number"+i
        })
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", height)
        .attr("height", 0)
        .attr("fill", function(d) { return z(d.key); });

// now, select all the bars individually (.bar)
// give a transition and give the values
// y is the value of y variable with d.value
// height is height minus attr y
      svg.selectAll(".bar")
        .transition(t)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); });

// construct the legend, give this element the proper attributes and styling
// select all the g's in the created legend and create the g's within
    var legend = g.append("g")
        .attr("class", "legend")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice())
      .enter().append("g")
        .attr("class", "legenditem")
        .attr('id', function(d, i) { return "number"+i; })
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// create the rectangles in legend, give them styling
    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z)
        .attr("margin", "15px")

// create the text in legend, give it styling
// in .text give a function to return the data here
// for the id, give a function with d (data) and i(index) parameters
// return an id which reads #number(i) in the HTML
// so that the 2nd text.textlegend has an id which reads #number1
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .attr("font-size", 13)
        .attr("class", "textlegend")
        .text(function(d) { return d; })
  
// make a new variable to store all .textlegend
// write a fucntion on eventlistener mouseover and store the selected .textlegend'd id
// use .toString to have type string as selected variable        

        var legendselect = d3.selectAll(".legenditem")
        legendselect.on('mouseover', function(d){
          var idNumber = this.id.toString();
          console.log(idNumber)

// select all .bar elements and make them unvisible on mouseover
// select all .bar elements with the id of the selected number by using the variable created above
// now, the selected .textlegend will tell which .bar will be visible, the ones that have the same index number
          d3.selectAll(".bar")
          .attr("opacity", "0");
          d3.selectAll(".bar#"+idNumber)
          .transition()
            .duration(400)
          .attr("opacity", "1");
        });

// write a function on eventlistener mouseout to change the opacity of all .bar back to visible
        legendselect.on("mouseout", function(d){
          d3.selectAll(".bar").attr("opacity", "1");
        })


      });
};

// make a variable refering to the input in HTML, which is our trigger
// put on an eventlistener on this variable to select if changed
// refer to function "update" with the parameter of that one selected "#features"

var select = d3.select("#features");
select.on("change", function() {
    console.log(this.value);
    update(this.value);
});


// call the function update with parameter (1)
// the select option with value 1 is the selected one
// so before changing, make sure this one is indeed the one already on screen
// the graph is only loaded when the update function is called
update("1");





